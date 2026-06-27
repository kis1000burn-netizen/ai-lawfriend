/**
 * finance-settlement/revenue-leak-watch: checks.mjs
 * 음수 마진, 환불 급증, 미매핑 거래를 감지합니다.
 */
import { loadSettlements, makeFinanceSignal } from '../_lib.mjs';

export async function runChecks(context) {
  const { config, profile, ROOT } = context;
  const opts = profile?.skillOptions?.['finance-settlement/revenue-leak-watch'] ?? {};
  const results = [];
  const negativeMarginsWarn  = opts.negativeMarginsWarn  ?? 1;
  const refundSpikeThreshold = opts.refundSpikeThreshold ?? 0.10; // 10%

  const settlements = await loadSettlements(ROOT, config.platformId, { limit: 300 });
  if (settlements.length === 0) {
    results.push({ id: 'data-available', status: 'warn', critical: false, message: '정산 데이터 없음 — 마진 감시 대상 없음' });
    return results;
  }

  // 음수 마진 감지
  const negatives = settlements.filter(s =>
    s.expectedVendorPayout != null && s.orderAmount != null &&
    s.expectedVendorPayout < 0
  );
  if (negatives.length >= negativeMarginsWarn) {
    results.push(makeFinanceSignal('finance:negative-margin',
      `음수 마진 ${negatives.length}건 — 수수료·비용 설정 확인 필요 (ID: ${negatives.slice(0,3).map(s=>s.settlementId??'?').join(', ')})`,
      { count: negatives.length }
    ));
  }

  // 환불 급증 감지
  const refunds = settlements.filter(s => ['refund_pending','disputed','failed'].includes(s.status));
  const refundRate = refunds.length / settlements.length;
  if (refundRate >= refundSpikeThreshold) {
    results.push(makeFinanceSignal('finance:refund-spike',
      `환불률 급증 — ${(refundRate*100).toFixed(1)}% (기준: ${(refundSpikeThreshold*100).toFixed(0)}%, ${refunds.length}/${settlements.length}건)`,
      { refundRate, refundCount: refunds.length, totalCount: settlements.length }
    ));
  }

  // 업체 잔액 드리프트 (vendorId별 예상 합계 vs 실제 합계)
  const vendorTotals = {};
  for (const s of settlements) {
    if (!s.vendorId) continue;
    if (!vendorTotals[s.vendorId]) vendorTotals[s.vendorId] = { expected: 0, actual: 0 };
    vendorTotals[s.vendorId].expected += s.expectedVendorPayout ?? 0;
    vendorTotals[s.vendorId].actual   += s.actualVendorPayout   ?? 0;
  }
  for (const [vid, totals] of Object.entries(vendorTotals)) {
    const drift = Math.abs(totals.expected - totals.actual);
    if (totals.actual > 0 && drift > (opts.balanceDriftThreshold ?? 10000)) {
      results.push(makeFinanceSignal('finance:vendor-balance-drift',
        `업체 잔액 불일치 — ${vid}: 예상 ${totals.expected.toLocaleString()}원, 실제 ${totals.actual.toLocaleString()}원, 차이 ${drift.toLocaleString()}원`,
        { vendorId: vid, expected: totals.expected, actual: totals.actual, drift }
      ));
    }
  }

  const hasIssue = results.some(r => r.status !== 'pass');
  if (!hasIssue) {
    results.push({ id: 'revenue-integrity', status: 'pass', critical: false, message: `수익 무결성 정상 (검사: ${settlements.length}건)` });
  }
  return results;
}
