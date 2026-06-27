/**
 * finance-settlement/tax-invoice-watch: checks.mjs
 * 세금계산서 발급 기한 임박·초과·누락을 감지합니다.
 */
import { loadSettlements, makeFinanceSignal } from '../_lib.mjs';

export async function runChecks(context) {
  const { config, profile, ROOT } = context;
  const opts = profile?.skillOptions?.['finance-settlement/tax-invoice-watch'] ?? {};
  const results = [];
  const warnDaysBeforeDeadline = opts.warnDaysBeforeDeadline ?? 3;
  const missingInvoiceDays     = opts.missingInvoiceDays ?? 14;
  const now = Date.now();

  const settlements = await loadSettlements(ROOT, config.platformId, { limit: 200 });

  if (settlements.length === 0) {
    results.push({ id: 'data-available', status: 'warn', critical: false, message: '정산 데이터 없음 — 세금계산서 감시 대상 없음' });
    return results;
  }

  let lateCount = 0, warnCount = 0, missingCount = 0, amendCount = 0;

  for (const s of settlements) {
    const inv = s.evidence ?? s.invoice ?? null;
    if (!inv) continue;
    if (!inv.invoiceRequired) continue;

    const deadline = inv.invoiceDeadline ? Date.parse(inv.invoiceDeadline) : null;
    const daysLeft = deadline ? Math.floor((deadline - now) / 86400000) : null;

    if (inv.invoiceStatus === 'amendment_required') {
      amendCount++;
      results.push({ id: `invoice-amend:${s.settlementId ?? s.orderId}`, status: 'warn', critical: false, message: `세금계산서 수정 발급 필요 — settlementId: ${s.settlementId ?? '?'} (운영자 직접 처리 필요)` });
    }

    if (inv.invoiceStatus === 'issued') continue;

    if (daysLeft !== null && daysLeft < 0) {
      lateCount++;
      results.push(makeFinanceSignal('finance:tax-invoice-late', `세금계산서 발급 기한 초과 — settlementId: ${s.settlementId ?? '?'} (${Math.abs(daysLeft)}일 초과)`, { settlementId: s.settlementId, orderId: s.orderId, daysOverdue: Math.abs(daysLeft) }));
    } else if (daysLeft !== null && daysLeft <= warnDaysBeforeDeadline) {
      warnCount++;
      results.push({ id: `invoice-deadline:${s.settlementId ?? s.orderId}`, status: 'warn', critical: false, message: `세금계산서 발급 기한 임박 — ${daysLeft}일 남음 (settlementId: ${s.settlementId ?? '?'})` });
    }

    // 증빙 미수집 감지
    if (inv.invoiceStatus === 'pending' && s.createdAt) {
      const ageDays = Math.floor((now - Date.parse(s.createdAt)) / 86400000);
      if (ageDays > missingInvoiceDays) {
        missingCount++;
        results.push(makeFinanceSignal('finance:missing-invoice', `증빙 미수집 ${ageDays}일 경과 — settlementId: ${s.settlementId ?? '?'} (기준: ${missingInvoiceDays}일)`, { settlementId: s.settlementId, ageDays }));
      }
    }
  }

  if (lateCount === 0 && warnCount === 0 && missingCount === 0 && amendCount === 0) {
    results.push({ id: 'invoice-status', status: 'pass', critical: false, message: `세금계산서 감시 정상 (검사: ${settlements.length}건)` });
  }

  return results;
}
