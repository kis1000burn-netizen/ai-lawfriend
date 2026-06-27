/**
 * slo-budget: checks.mjs
 *
 * SLO 목표 파일을 읽고, 아카이브 이벤트에서 성공률을 계산하고,
 * 에러버짓 소진 수준에 따른 신호를 반환합니다.
 */
import { calculateSlos, detectFastBurn, loadSloTargets } from '../../core/slo-engine.mjs';

export async function runChecks(context) {
  const { config, ROOT, isoNow } = context;
  const platformId = config.platformId;
  const results = [];

  // ── SLO 목표 로드 ─────────────────────────────────────────────────────────
  let sloConfig;
  try {
    sloConfig = await loadSloTargets(platformId, ROOT);
  } catch (err) {
    results.push({
      id: 'slo-config',
      status: 'warn',
      critical: false,
      message: `SLO 목표 파일 없음 — ${err.message.split('\n')[0]}`,
    });
    return results;
  }

  // ── SLO 계산 ─────────────────────────────────────────────────────────────
  let sloReport;
  try {
    sloReport = await calculateSlos(platformId, sloConfig);
  } catch (err) {
    results.push({
      id: 'slo-calculation',
      status: 'fail',
      critical: false,
      message: `SLO 계산 오류: ${err.message}`,
    });
    return results;
  }

  // ── 각 SLO를 신호로 변환 ───────────────────────────────────────────────
  for (const slo of sloReport.slos) {
    let status;
    switch (slo.budgetStatus) {
      case 'exhausted': status = 'fail';  break;
      case 'critical':  status = 'fail';  break;
      case 'warning':   status = 'warn';  break;
      case 'healthy':   status = 'pass';  break;
      default:          status = 'warn';  break;
    }

    results.push({
      id: `slo:${slo.id}`,
      status,
      critical: slo.budgetStatus === 'exhausted',
      message: `${slo.emoji ?? ''} [${slo.budgetStatus?.toUpperCase() ?? 'UNKNOWN'}] ${slo.description}: ${slo.message}`,
      sloData: {
        id: slo.id,
        successRatePct: slo.successRatePct,
        targetPct: slo.targetPct,
        budgetRemainingPct: slo.budgetRemainingPct,
        budgetStatus: slo.budgetStatus,
        burnRate: slo.burnRate,
        totalChecks: slo.totalChecks,
        windowDays: slo.windowDays,
      },
    });
  }

  // ── 배포 정책 신호 ────────────────────────────────────────────────────────
  const policy = sloReport.deployPolicy;
  const policyStatus = {
    OPEN:       'pass',
    CAUTION:    'warn',
    RESTRICTED: 'fail',
    FREEZE:     'fail',
  }[policy.code] ?? 'warn';

  results.push({
    id: 'deploy-policy',
    status: policyStatus,
    critical: policy.code === 'FREEZE',
    message: `[${policy.code}] ${policy.message}`,
    deployPolicy: policy,
  });

  // ── 빠른 소진 감지 ────────────────────────────────────────────────────────
  try {
    const fastBurnAlerts = await detectFastBurn(
      platformId,
      sloConfig.slos,
      sloConfig.fastBurnThreshold ?? 14
    );
    for (const alert of fastBurnAlerts) {
      results.push({
        id: `fast-burn:${alert.sloId}`,
        status: 'fail',
        critical: true,
        message: alert.message,
        burnRate: alert.burnRate,
      });
    }
  } catch { /* 빠른 소진 계산 실패 무시 */ }

  return results;
}
