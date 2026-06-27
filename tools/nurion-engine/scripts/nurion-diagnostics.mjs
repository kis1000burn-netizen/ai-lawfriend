import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, matchSignal, severityRank, writeJson, isMainScript } from './nurion-utils.mjs';
import { loadConfig } from './nurion-collector.mjs';
import { loadEventsSince } from './nurion-state.mjs';

export function aggregateSignals(events) {
  const map = new Map();
  for (const event of events) for (const signal of event.signals ?? []) {
    const x = map.get(signal.id) ?? { id: signal.id, fail: 0, warn: 0, pass: 0, entries: [] };
    x[signal.status] = (x[signal.status] ?? 0) + 1;
    x.entries.push({ status: signal.status, observedAt: event.observedAt }); map.set(signal.id, x);
  }
  return [...map.values()];
}
export function maxConsecutiveFails(entries) {
  let streak = 0, max = 0;
  for (const e of [...entries].sort((a,b) => Date.parse(a.observedAt)-Date.parse(b.observedAt))) {
    streak = e.status === 'fail' ? streak + 1 : 0; max = Math.max(max, streak);
  }
  return max;
}
export function detectPatterns(aggregate, rules) {
  const results = [];
  for (const rule of rules) for (const item of aggregate.filter(x => matchSignal(rule.signal, x.id))) {
    const count = rule.type === 'consecutive_fail' ? maxConsecutiveFails(item.entries) : rule.type === 'warn_count' ? item.warn : item.fail;
    if (count >= rule.threshold) results.push({ signal: item.id, count, threshold: rule.threshold, severity: rule.severity, reason: rule.reason, ruleType: rule.type });
  }
  return results.sort((a,b) => severityRank(b.severity)-severityRank(a.severity));
}
export function gradeHistogram(events) {
  const histogram = Object.fromEntries(['G0','G1','G2','G3','G4'].map(x => [x,0]));
  for (const event of events) histogram[event.grade] = (histogram[event.grade] ?? 0)+1;
  const total = events.length || 1; const healthy = (histogram.G0 / total) * 100;
  return { histogram, healthPercent: Number(healthy.toFixed(1)) };
}
export async function runDiagnostics() {
  const config = await loadConfig();
  const events = await loadEventsSince(config.historyDays ?? 7, config.platformId);
  const rules = JSON.parse(await fs.readFile(path.join(ROOT, 'config', 'nurion-rules.json'), 'utf8')).rules;
  const aggregate = aggregateSignals(events); const patterns = detectPatterns(aggregate, rules); const grades = gradeHistogram(events);
  const result = { generatedAt: new Date().toISOString(), platformId: config.platformId, events: events.length, ...grades, patterns, aggregate };
  await writeJson(path.join(ROOT, '_nurion_events', 'diagnostics.json'), result);
  return result;
}
if (isMainScript(import.meta.url)) runDiagnostics().then(result => { console.log(JSON.stringify(result, null, 2)); if (result.patterns.some(x => x.severity === 'CRITICAL')) process.exitCode = 2; }).catch(e => { console.error(e.stack || e); process.exitCode = 1; });
