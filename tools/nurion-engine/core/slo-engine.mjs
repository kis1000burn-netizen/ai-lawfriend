/**
 * 누리온 SLO·에러버짓 엔진 (v1.4)
 *
 * G0~G4 가 "지금 이 순간 상태"를 판단한다면,
 * SLO 엔진은 "이번 달 얼마나 안정적으로 운영되었는가"를 수치화합니다.
 *
 * ─ 개념 ──────────────────────────────────────────────────────────────────────
 * SLO (Service Level Objective)
 *   목표 성공률. 예: 견적 접수 99.5%
 *
 * Error Budget
 *   허용된 실패량. 99.5% SLO에서 30일이라면 = 0.5% × 43,200분 = 216분 허용.
 *   실제 실패가 이 분량을 소진하면 "에러버짓 소진(Exhausted)".
 *
 * Burn Rate
 *   에러버짓이 소진되는 속도.  burn_rate = 1이면 딱 30일에 소진.
 *   burn_rate = 14이면 30일치를 2일 만에 소진 → 즉시 알림 필요.
 *
 * ─ 배포 정책 ─────────────────────────────────────────────────────────────────
 *   Budget > 50%  → 정상 배포 가능
 *   Budget 10~50% → 배포 시 preflight 강화 + 운영자 확인 권고
 *   Budget < 10%  → G2 이상은 승인자 필수 (DEPLOY_RESTRICT)
 *   Budget 소진   → 신규 기능 배포 차단 + 안정화 우선 (DEPLOY_FREEZE)
 */
import path from 'node:path';
import { loadEventsSince } from '../scripts/nurion-state.mjs';
import { readJson } from '../scripts/nurion-utils.mjs';

// ─── 에러버짓 상태 임계값 ─────────────────────────────────────────────────────
export const BUDGET_THRESHOLDS = {
  HEALTHY:   50,   // > 50% 남음
  WARNING:   10,   // 10~50% 남음
  CRITICAL:   0,   // 0~10% 남음
  EXHAUSTED: -Infinity, // 소진 (< 0%)
};

// ─── SLO 단위 ────────────────────────────────────────────────────────────────
// availability : pass/fail 기반 가용성
// zero-violation: 단 1건의 fail도 허용하지 않음 (P-0 경계 등)
const SLO_UNITS = ['availability', 'zero-violation'];

// ─── SLO 파일 로드 ────────────────────────────────────────────────────────────

/**
 * 플랫폼 프로필 디렉토리의 slo-targets.json 을 읽습니다.
 * 없으면 config/slo-targets.example.json 을 시도합니다.
 *
 * @param {string} platformId
 * @param {string} ROOT
 * @returns {Promise<{windowDays: number, slos: SloTarget[]}>}
 */
export async function loadSloTargets(platformId, ROOT) {
  const profilePath = path.join(ROOT, 'platform-profiles', platformId, 'slo-targets.json');
  const fallback    = path.join(ROOT, 'config', 'slo-targets.example.json');

  const targets = await readJson(profilePath, null) ?? await readJson(fallback, null);
  if (!targets) {
    throw new Error(
      `SLO 목표 파일 없음: platform-profiles/${platformId}/slo-targets.json\n` +
      `config/slo-targets.example.json 을 복사해 작성하세요.`
    );
  }
  return targets;
}

// ─── 핵심 계산 ───────────────────────────────────────────────────────────────

/**
 * 아카이브 이벤트에서 특정 signalId 의 상태를 추출합니다.
 * 스킬 신호(예: gas-health:endpoint)와 코어 신호(예: api:submissions) 모두 처리합니다.
 */
function extractSignalStatus(event, signalId) {
  if (!Array.isArray(event.signals)) return null;
  // 직접 매치
  const exact = event.signals.find(s => s.id === signalId);
  if (exact) return exact.status;
  // 스킬 신호는 skill:check-name 형식 — skill 부분 prefix 매치 허용
  const prefix = event.signals.find(s => s.id.endsWith(':' + signalId) || s.id === signalId);
  return prefix?.status ?? null;
}

/**
 * 단일 SLO 에 대한 메트릭을 계산합니다.
 *
 * @param {SloTarget}  slo
 * @param {object[]}   events     - loadEventsSince() 반환값
 * @param {number}     windowDays - 집계 창 (일)
 * @returns {SloResult}
 */
export function calculateOneSlo(slo, events, windowDays) {
  const relevant = events.filter(e =>
    Array.isArray(e.signals) &&
    e.signals.some(s =>
      s.id === slo.signalId ||
      s.id.endsWith(':' + slo.signalId)
    )
  );

  const totalChecks = relevant.length;

  if (totalChecks === 0) {
    return {
      id: slo.id,
      description: slo.description,
      signalId: slo.signalId,
      target: slo.target,
      unit: slo.unit ?? 'availability',
      totalChecks: 0,
      passChecks: 0,
      failChecks: 0,
      successRate: null,
      successRatePct: 'N/A (이력 없음)',
      errorBudgetConsumedPct: null,
      budgetRemainingPct: null,
      budgetStatus: 'unknown',
      burnRate: null,
      windowDays,
      message: `이력 없음 — ${slo.signalId} 신호가 아직 기록되지 않음`,
    };
  }

  const passChecks = relevant.filter(e =>
    extractSignalStatus(e, slo.signalId) === 'pass'
  ).length;
  const failChecks = totalChecks - passChecks;
  const successRate = passChecks / totalChecks;

  // zero-violation: target = 1.000 이면 분모가 0 → 특수 처리
  const unit = slo.unit ?? 'availability';
  let budgetRemainingPct, errorBudgetConsumedPct, budgetStatus;

  if (unit === 'zero-violation' || slo.target >= 1.0) {
    // 0회 위반 SLO: 단 1건이라도 실패하면 소진
    errorBudgetConsumedPct = failChecks > 0 ? 100 : 0;
    budgetRemainingPct     = failChecks > 0 ? 0   : 100;
    budgetStatus = failChecks > 0 ? 'exhausted' : 'healthy';
  } else {
    const errorRate = 1 - successRate;
    const allowedErrorRate = 1 - slo.target;
    errorBudgetConsumedPct = (errorRate / allowedErrorRate) * 100;
    budgetRemainingPct = Math.max(0, 100 - errorBudgetConsumedPct);

    if (budgetRemainingPct <= 0)  budgetStatus = 'exhausted';
    else if (budgetRemainingPct <= BUDGET_THRESHOLDS.WARNING) budgetStatus = 'critical';
    else if (budgetRemainingPct <= BUDGET_THRESHOLDS.HEALTHY) budgetStatus = 'warning';
    else budgetStatus = 'healthy';
  }

  // burn rate: 현재 소진 속도 기준 에러버짓이 소진될 때까지 남은 일수
  // burn_rate = 1이면 window 기간과 같은 속도로 소진
  let burnRate = null;
  let daysUntilExhausted = null;
  if (unit !== 'zero-violation' && slo.target < 1.0 && totalChecks > 0) {
    const allowedErrorRate = 1 - slo.target;
    const actualErrorRate  = 1 - successRate;
    burnRate = actualErrorRate > 0 ? actualErrorRate / allowedErrorRate : 0;
    if (burnRate > 0 && budgetRemainingPct > 0) {
      daysUntilExhausted = Math.round((budgetRemainingPct / 100 * windowDays) / burnRate);
    }
  }

  // 메시지 생성
  const targetPct = `${(slo.target * 100).toFixed(1)}%`;
  const actualPct = `${(successRate * 100).toFixed(2)}%`;
  const budgetPct = budgetRemainingPct !== null ? `${budgetRemainingPct.toFixed(1)}%` : 'N/A';
  const STATUS_EMOJI = { healthy: '✅', warning: '⚠️', critical: '🔴', exhausted: '🔥', unknown: '❓' };

  let message;
  switch (budgetStatus) {
    case 'healthy':
      message = `정상 — 실제 ${actualPct} (목표 ${targetPct}), 에러버짓 ${budgetPct} 잔여`;
      break;
    case 'warning':
      message = `경고 — 에러버짓 ${budgetPct} 잔여, 배포 시 운영자 확인 권고`;
      break;
    case 'critical':
      message = `위험 — 에러버짓 ${budgetPct} 잔여 (${daysUntilExhausted ? daysUntilExhausted + '일 후 소진 예상' : '소진 임박'}), G2+ 배포 승인자 필수`;
      break;
    case 'exhausted':
      message = `소진 — 에러버짓 0% (실제 ${actualPct} vs 목표 ${targetPct}), 신규 기능 배포 차단 권고`;
      break;
    default:
      message = '이력 없음';
  }

  return {
    id: slo.id,
    description: slo.description,
    signalId: slo.signalId,
    target: slo.target,
    unit,
    totalChecks,
    passChecks,
    failChecks,
    successRate,
    successRatePct: actualPct,
    targetPct,
    errorBudgetConsumedPct: Math.min(errorBudgetConsumedPct, 100),
    budgetRemainingPct,
    budgetStatus,
    burnRate,
    daysUntilExhausted,
    windowDays,
    emoji: STATUS_EMOJI[budgetStatus] ?? '❓',
    message,
  };
}

// ─── 전체 SLO 계산 ────────────────────────────────────────────────────────────

/**
 * 플랫폼의 모든 SLO 를 계산하고 배포 정책 결론을 반환합니다.
 *
 * @param {string} platformId
 * @param {{windowDays: number, slos: SloTarget[]}} sloConfig
 * @returns {Promise<SloReport>}
 */
export async function calculateSlos(platformId, sloConfig) {
  const { windowDays = 30, slos = [] } = sloConfig;
  const events = await loadEventsSince(windowDays, platformId);

  const results = slos.map(slo => calculateOneSlo(slo, events, windowDays));

  // 배포 정책 결론
  const deployPolicy = deriveDeployPolicy(results);

  return {
    schemaVersion: '1.4',
    platformId,
    windowDays,
    totalEvents: events.length,
    calculatedAt: new Date().toISOString(),
    slos: results,
    deployPolicy,
  };
}

// ─── 배포 정책 도출 ──────────────────────────────────────────────────────────

/**
 * SLO 결과들을 종합해 배포 제한 수준을 결정합니다.
 *
 * DEPLOY_OPEN       → G0~G4 정상 흐름, 별도 제한 없음
 * DEPLOY_CAUTION    → preflight 강화 권고 (warning SLO 존재)
 * DEPLOY_RESTRICTED → G2 이상 배포 시 승인자 필수 (critical SLO 존재)
 * DEPLOY_FREEZE     → 신규 기능 배포 차단 (exhausted SLO 존재)
 */
export function deriveDeployPolicy(sloResults) {
  const hasExhausted = sloResults.some(s => s.budgetStatus === 'exhausted');
  const hasCritical  = sloResults.some(s => s.budgetStatus === 'critical');
  const hasWarning   = sloResults.some(s => s.budgetStatus === 'warning');

  if (hasExhausted) {
    const exhausted = sloResults.filter(s => s.budgetStatus === 'exhausted');
    return {
      level: 'DEPLOY_FREEZE',
      code: 'FREEZE',
      exitCode: 3,
      message: `신규 기능 배포 차단 — 에러버짓 소진: ${exhausted.map(s => s.description).join(', ')}`,
      actions: [
        '신규 기능 배포 중단',
        '안정화 작업 우선 진행',
        '에러버짓 소진 SLO 복구 후 배포 재개',
      ],
    };
  }

  if (hasCritical) {
    const critical = sloResults.filter(s => s.budgetStatus === 'critical');
    return {
      level: 'DEPLOY_RESTRICTED',
      code: 'RESTRICTED',
      exitCode: 2,
      message: `G2 이상 배포 시 승인자 필수 — 에러버짓 위험: ${critical.map(s => s.description).join(', ')}`,
      actions: [
        'G2 이상 등급에서 배포 전 운영자 승인 필수',
        'deploy-preflight 강화 검사 적용',
        '에러버짓 소진까지 신규 기능 자제',
      ],
    };
  }

  if (hasWarning) {
    return {
      level: 'DEPLOY_CAUTION',
      code: 'CAUTION',
      exitCode: 1,
      message: '배포 주의 — preflight 강화 권고 (에러버짓 경고 수준)',
      actions: [
        'deploy-preflight 전체 smoke 실행',
        '배포 후 10분간 G등급 모니터링',
      ],
    };
  }

  return {
    level: 'DEPLOY_OPEN',
    code: 'OPEN',
    exitCode: 0,
    message: '배포 가능 — 모든 SLO 에러버짓 50% 이상 잔여',
    actions: [],
  };
}

// ─── 빠른 소진 감지 (Fast Burn Rate Alert) ───────────────────────────────────

/**
 * 최근 1시간 burn rate 가 임계값(기본 14배)을 초과하면 즉시 알림이 필요합니다.
 * (Google SRE: 1hr window × 14× burn = 30일치 budget 2일 만에 소진)
 *
 * @param {string}   platformId
 * @param {SloTarget[]} slos
 * @param {number}   burnThreshold  (기본 14)
 * @returns {Promise<FastBurnAlert[]>}
 */
export async function detectFastBurn(platformId, slos, burnThreshold = 14) {
  const events1h  = await loadEventsSince(1 / 24, platformId);  // 최근 1시간
  const events6h  = await loadEventsSince(6 / 24, platformId);  // 최근 6시간
  const alerts = [];

  for (const slo of slos) {
    if ((slo.unit ?? 'availability') === 'zero-violation') continue;
    if (slo.target >= 1.0) continue;

    const allowedErrorRate = 1 - slo.target;

    for (const [label, evts] of [['1h', events1h], ['6h', events6h]]) {
      const relevant = evts.filter(e =>
        Array.isArray(e.signals) && e.signals.some(s => s.id === slo.signalId || s.id.endsWith(':' + slo.signalId))
      );
      if (relevant.length === 0) continue;

      const failCount = relevant.filter(e => extractSignalStatus(e, slo.signalId) !== 'pass').length;
      const errorRate = failCount / relevant.length;
      const burn = errorRate / allowedErrorRate;

      if (burn >= burnThreshold) {
        alerts.push({
          sloId: slo.id,
          description: slo.description,
          window: label,
          burnRate: Math.round(burn * 10) / 10,
          threshold: burnThreshold,
          message: `⚡ 빠른 소진 감지 — ${slo.description} (${label} 창 burn rate: ${burn.toFixed(1)}×, 임계값: ${burnThreshold}×)`,
        });
        break; // 한 SLO에 대해 짧은 창 알림이 있으면 충분
      }
    }
  }

  return alerts;
}
