/**
 * nurion-slo.mjs
 *
 * SLO·에러버짓 대시보드 CLI.
 * 플랫폼의 월간 안정성을 텍스트 대시보드로 출력합니다.
 *
 * 사용법:
 *   node scripts/nurion-slo.mjs
 *   node scripts/nurion-slo.mjs --json      (JSON 원본 출력)
 *   node scripts/nurion-slo.mjs --window 7  (최근 7일 기준)
 *
 * 종료 코드:
 *   0  → DEPLOY_OPEN  (모든 SLO 건강)
 *   1  → DEPLOY_CAUTION (경고 SLO 존재)
 *   2  → DEPLOY_RESTRICTED (위험 SLO — 승인자 필수)
 *   3  → DEPLOY_FREEZE (소진 SLO — 배포 차단)
 */
import { loadConfig } from './nurion-collector.mjs';
import { parseArgs, ROOT, isMainScript } from './nurion-utils.mjs';
import { loadSloTargets, calculateSlos, detectFastBurn } from '../core/slo-engine.mjs';

// ─── CLI 파싱 ────────────────────────────────────────────────────────────────

function getArg(argv, flag, fallback = null) {
  const idx = argv.indexOf(flag);
  if (idx === -1) return fallback;
  return argv[idx + 1] ?? fallback;
}

// ─── 대시보드 렌더링 ─────────────────────────────────────────────────────────

function bar(pct, width = 20) {
  if (pct === null || pct === undefined) return '─'.repeat(width);
  const filled = Math.round((Math.min(Math.max(pct, 0), 100) / 100) * width);
  const empty  = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function padEnd(str, len) {
  const s = String(str ?? '');
  return s + ' '.repeat(Math.max(0, len - s.length));
}

function renderDashboard(sloReport, fastBurnAlerts) {
  const LINE = '─'.repeat(72);
  const lines = [];

  lines.push('');
  lines.push('┌' + '─'.repeat(70) + '┐');
  lines.push(`│  누리온 SLO·에러버짓 대시보드  [플랫폼: ${sloReport.platformId}]`.padEnd(71) + '│');
  lines.push(`│  기준 창: 최근 ${sloReport.windowDays}일  │  이벤트: ${sloReport.totalEvents}건  │  산출: ${sloReport.calculatedAt.replace('T', ' ').slice(0, 19)} UTC`.padEnd(71) + '│');
  lines.push('└' + '─'.repeat(70) + '┘');
  lines.push('');

  // SLO 목록
  lines.push('  SLO 목표별 에러버짓 상태');
  lines.push('  ' + LINE);

  const LABEL_W = 26;
  const RATE_W  = 14;

  for (const slo of sloReport.slos) {
    const emoji  = slo.emoji ?? '?';
    const label  = padEnd(slo.description, LABEL_W);
    const rate   = padEnd(slo.successRatePct ?? 'N/A', RATE_W);
    const target = padEnd(`(목표 ${slo.targetPct ?? '?'})`, 14);
    const bPct   = slo.budgetRemainingPct;
    const bBar   = bar(bPct, 16);
    const bLabel = bPct !== null ? `${bPct.toFixed(1)}% 잔여` : 'N/A';

    lines.push(`  ${emoji} ${label} ${rate} ${target} [${bBar}] ${bLabel}`);

    if (slo.burnRate !== null && slo.burnRate > 1) {
      const daysStr = slo.daysUntilExhausted ? ` / ${slo.daysUntilExhausted}일 후 소진 예상` : '';
      lines.push(`    └─ burn rate: ${slo.burnRate.toFixed(1)}×${daysStr}`);
    }
    if (slo.totalChecks === 0) {
      lines.push(`    └─ 이력 없음 — 누리온 감시 실행 후 데이터가 쌓이면 계산됩니다`);
    }
  }

  lines.push('  ' + LINE);
  lines.push('');

  // 빠른 소진 알림
  if (fastBurnAlerts.length > 0) {
    lines.push('  ⚡ 빠른 소진(Fast Burn) 감지');
    for (const a of fastBurnAlerts) {
      lines.push(`    • ${a.message}`);
    }
    lines.push('');
  }

  // 배포 정책 결론
  const p = sloReport.deployPolicy;
  const policyIcons = { OPEN: '🟢', CAUTION: '🟡', RESTRICTED: '🔴', FREEZE: '🔥' };
  lines.push(`  배포 정책: ${policyIcons[p.code] ?? '⬜'} ${p.level}`);
  lines.push(`  ${p.message}`);

  if (p.actions.length > 0) {
    lines.push('');
    lines.push('  권고 조치:');
    for (const a of p.actions) {
      lines.push(`    • ${a}`);
    }
  }

  lines.push('');
  lines.push('  [에러버짓 범례]  > 50% ✅ 건강  10~50% ⚠️ 경고  < 10% 🔴 위험  소진 🔥');
  lines.push('');

  return lines.join('\n');
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  const args    = process.argv;
  const asJson  = args.includes('--json');
  const windowArg = getArg(args, '--window');

  const config = await loadConfig();
  const platformId = config.platformId;

  let sloConfig;
  try {
    sloConfig = await loadSloTargets(platformId, ROOT);
  } catch (err) {
    console.error(`[nurion-slo] SLO 목표 없음: ${err.message}`);
    console.error(`  config/slo-targets.example.json → platform-profiles/${platformId}/slo-targets.json 으로 복사해 설정하세요.`);
    process.exitCode = 1;
    return;
  }

  if (windowArg) {
    const w = parseInt(windowArg, 10);
    if (!isNaN(w) && w > 0) sloConfig.windowDays = w;
  }

  const sloReport = await calculateSlos(platformId, sloConfig);
  const fastBurnAlerts = await detectFastBurn(
    platformId,
    sloConfig.slos,
    sloConfig.fastBurnThreshold ?? 14
  );

  if (asJson) {
    console.log(JSON.stringify({ sloReport, fastBurnAlerts }, null, 2));
  } else {
    console.log(renderDashboard(sloReport, fastBurnAlerts));
  }

  process.exitCode = sloReport.deployPolicy.exitCode ?? 0;
}

if (isMainScript(import.meta.url)) {
  main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
}
