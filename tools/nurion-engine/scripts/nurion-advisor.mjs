import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, writeJson, isMainScript } from './nurion-utils.mjs';
import { loadConfig } from './nurion-collector.mjs';
import { loadEventsSince } from './nurion-state.mjs';
import { runDiagnostics } from './nurion-diagnostics.mjs';

function readiness(events) {
  const nonG0 = events.filter(e => e.grade && e.grade !== 'G0');
  const signalKinds = new Set(events.flatMap(e => (e.signals ?? []).filter(s => s.status !== 'pass').map(s => s.id)));
  const recoveryPairs = nonG0.filter((e, i) => events.slice(i + 1).some(next => next.grade === 'G0')).length;
  const deployed = events.some(e => e.releaseTag || e.releaseTagId || e.releaseAt);
  const checks = [
    { id: 'event_count', ok: events.length >= 30, label: '총 이벤트 30건+' },
    { id: 'non_g0', ok: nonG0.length > 0, label: 'G1~G4 실제 포함' },
    { id: 'signal_variety', ok: signalKinds.size >= 3, label: '신호 3종 이상' },
    { id: 'recovery_history', ok: recoveryPairs >= 3, label: '복구 이력 3건+' },
    { id: 'release_link', ok: deployed, label: '배포 연결 1건+' }
  ];
  return { checks, passCount: checks.filter(x=>x.ok).length, ready: checks.every(x=>x.ok) };
}
function score(history) {
  if (!history.length) return 0.10;
  const successful = history.filter(x => x.resolved === true).length;
  return Math.max(0.10, successful / (history.length + 1));
}
async function main() {
  const config = await loadConfig();
  const events = await loadEventsSince(config.historyDays ?? 7, config.platformId);
  const gate = readiness(events);
  const diagnostics = await runDiagnostics();
  const result = { generatedAt: new Date().toISOString(), platformId: config.platformId, readiness: gate, diagnostics: { patterns: diagnostics.patterns } };
  if (!gate.ready) {
    result.status = 'not-ready'; result.message = `현재 상태: ${gate.passCount}/5 조건 충족, 부족한 항목: ${gate.checks.filter(x=>!x.ok).map(x=>x.label).join(', ')}`;
  } else {
    const evidence = diagnostics.patterns.map(p => ({ signal: p.signal, severity: p.severity, reason: p.reason, count: p.count }));
    result.status = evidence.length ? 'advice-eligible' : 'no-pattern';
    result.evidence = evidence;
    result.confidence = evidence.length ? score([]) : null;
    result.branchAllowed = evidence.length && result.confidence >= 0.65;
    result.message = evidence.length ? '근거 기반 조언 후보가 생성되었습니다. 운영 반영은 반드시 사람 승인 후 진행합니다.' : '설명 가능한 반복 패턴이 없어 조언을 생성하지 않습니다.';
  }
  await writeJson(path.join(ROOT, '_nurion_events', 'advisor.json'), result);
  console.log(JSON.stringify(result, null, 2));
}
if (isMainScript(import.meta.url)) main().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
