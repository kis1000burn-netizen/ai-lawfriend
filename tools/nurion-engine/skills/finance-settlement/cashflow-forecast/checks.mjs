/**
 * finance-settlement/cashflow-forecast: checks.mjs
 * 예정 지급액 vs 가용 현금을 비교하고 단기 현금 부족 위험을 감지합니다.
 */
import { loadSettlements, makeFinanceSignal } from '../_lib.mjs';

export async function runChecks(context) {
  const { config, profile, ROOT } = context;
  const opts = profile?.skillOptions?.['finance-settlement/cashflow-forecast'] ?? {};
  const results = [];

  // 가용 현금 (수동 주입 또는 API)
  const availableCash = opts.availableCash ?? null;
  if (availableCash === null) {
    results.push({ id: 'cash-configured', status: 'warn', critical: false, message: '가용 현금 미설정 — skillOptions.cashflow-forecast.availableCash 필요' });
    return results;
  }

  // 이번 주 + 다음 주 지급 예정액 계산
  const now = Date.now();
  const settlements = await loadSettlements(ROOT, config.platformId, { status: 'payment_waiting', limit: 300 });
  const safetyBuffer = opts.safetyBufferRate ?? 0.2; // 20% 안전 여유

  let pendingPayout7d = 0, pendingPayout30d = 0;
  for (const s of settlements) {
    const due = s.settlementDue ? Date.parse(s.settlementDue) : null;
    const amount = s.expectedVendorPayout ?? 0;
    if (due && due - now <= 7 * 86400000)  pendingPayout7d  += amount;
    if (due && due - now <= 30 * 86400000) pendingPayout30d += amount;
  }

  const required7d  = pendingPayout7d  * (1 + safetyBuffer);
  const required30d = pendingPayout30d * (1 + safetyBuffer);

  if (availableCash < required7d) {
    results.push(makeFinanceSignal('finance:cashflow-risk',
      `7일 내 지급 예정액 초과 — 예정: ${pendingPayout7d.toLocaleString()}원, 가용: ${availableCash.toLocaleString()}원 (안전여유 ${(safetyBuffer*100).toFixed(0)}% 포함 필요: ${Math.round(required7d).toLocaleString()}원)`,
      { pendingPayout7d, availableCash, required7d, window: '7d' }
    ));
  } else if (availableCash < required30d) {
    results.push({ id: 'cashflow-30d', status: 'warn', critical: false,
      message: `30일 현금흐름 주의 — 예정: ${pendingPayout30d.toLocaleString()}원, 가용: ${availableCash.toLocaleString()}원`,
      pendingPayout30d, availableCash });
  } else {
    results.push({ id: 'cashflow-ok', status: 'pass', critical: false,
      message: `현금흐름 정상 — 7일 예정: ${pendingPayout7d.toLocaleString()}원, 가용: ${availableCash.toLocaleString()}원` });
  }

  return results;
}
