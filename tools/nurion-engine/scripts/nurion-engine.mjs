import path from 'node:path';
import { collectSignals, loadConfig } from './nurion-collector.mjs';
import { archiveRun, loadLastReport } from './nurion-state.mjs';
import { ROOT, parseArgs, severityRank, isoNow, isMainScript } from './nurion-utils.mjs';
import { evaluatePolicy } from './nurion-policy.mjs';

export function deriveGrade(signals, previousReport = null, releaseAt = null) {
  const failures = signals.filter(s => s.status === 'fail');
  const warnings = signals.filter(s => s.status === 'warn');
  const p0 = failures.some(s => s.id === 'code:p0-boundary');
  const coreFails = failures.filter(s => s.critical).length;
  const staticFails = failures.filter(s => s.id.startsWith('code:') || s.id.startsWith('asset:')).length;
  const retryFail = !!previousReport && previousReport.signals?.some(s => s.status === 'fail');
  const releasedRecently = !!releaseAt && (Date.now() - Date.parse(releaseAt) <= 30 * 60 * 1000);
  const g4 = p0 || (coreFails >= 1 && staticFails >= 2 && retryFail && releasedRecently);
  if (g4) return { grade: 'G4', reason: p0 ? 'P-0 위반' : '핵심+정적 복수 실패, 재시도 실패, 최근 배포 조건 충족' };
  if (coreFails >= 1) return { grade: 'G3', reason: '핵심 경로 실패' };
  if (failures.length >= 1) return { grade: 'G2', reason: '부분 장애' };
  if (warnings.length >= 1) return { grade: 'G1', reason: '경미한 이상' };
  return { grade: 'G0', reason: '수집 범위 내 전체 정상' };
}

async function main() {
  const args = parseArgs(process.argv);
  const config = await loadConfig();
  const { observedAt, signals } = await collectSignals(config);
  const release = await (async () => {
    try { return JSON.parse(await (await import('node:fs/promises')).readFile(path.join(ROOT, config.releaseTagFile ?? 'release/LAST_RELEASE.json'), 'utf8')); }
    catch { return null; }
  })();
  const previous = await loadLastReport(config.platformId);
  const derived = deriveGrade(signals, previous, release?.releasedAt ?? null);
  const report = {
    schemaVersion: '1.2', platformId: config.platformId, platformName: config.platformName,
    observedAt, grade: derived.grade, reason: derived.reason, signals,
    scope: { coverage: 'nurion-v1.2 수집 범위 (코드정적·API·GAS·PWA)', disclaimer: '플랫폼 전체 무결성 보장 아님' }
  };
  await archiveRun(report, config.retentionDays ?? config.historyDays ?? 7);
  const policy = await evaluatePolicy(report, config, { apply: args.has('--apply') });
  console.log(JSON.stringify({ report, policy }, null, 2));
  if (['G3', 'G4'].includes(report.grade)) process.exitCode = 2;
}

if (isMainScript(import.meta.url)) main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
