import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateSignals, maxConsecutiveFails, detectPatterns, gradeHistogram } from '../scripts/nurion-diagnostics.mjs';

const e = (t, id, status, grade='G0') => ({ observedAt: t, grade, signals: [{ id, status }] });

test('TC1 api:submissions 3회 연속 CRITICAL', () => {
  const agg = aggregateSignals([e('2026-01-01','api:submissions','fail','G2'),e('2026-01-02','api:submissions','fail','G2'),e('2026-01-03','api:submissions','fail','G3')]);
  const r = detectPatterns(agg, [{ signal:'api:submissions', type:'consecutive_fail', threshold:3, severity:'CRITICAL', reason:'x' }]);
  assert.equal(r.length, 1); assert.equal(r[0].severity, 'CRITICAL');
});
test('TC4 fail 후 복구는 연속 실패 패턴 미감지', () => {
  assert.equal(maxConsecutiveFails([{status:'fail',observedAt:'2026-01-01'},{status:'pass',observedAt:'2026-01-02'}]), 1);
});
test('TC5 신호 혼재 독립 집계', () => {
  const agg = aggregateSignals([e('2026-01-01','ops:list','fail'),e('2026-01-02','gas:health','warn')]);
  assert.equal(agg.length, 2); assert.equal(agg.find(x=>x.id==='ops:list').fail, 1);
});
test('등급 건강도', () => {
  assert.equal(gradeHistogram([e('2026-01-01','a','pass','G0'),e('2026-01-02','a','fail','G2')]).healthPercent, 50);
});
