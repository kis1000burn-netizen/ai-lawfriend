/**
 * finance-settlement/approval-matrix: checks.mjs
 * 지급 예정 건에 필요한 승인이 있는지, 미승인 지급 대기를 감지합니다.
 */
import { loadSettlements, makeFinanceSignal } from '../_lib.mjs';

function requiredApprovalLevel(amount, isException = false) {
  if (isException) return 'dual';
  if (amount > 1000000) return 'executive';
  if (amount > 100000)  return 'dual';
  return 'single';
}

export async function runChecks(context) {
  const { config, profile, ROOT } = context;
  const opts = profile?.skillOptions?.['finance-settlement/approval-matrix'] ?? {};
  const results = [];

  const settlements = await loadSettlements(ROOT, config.platformId, { status: 'payment_waiting', limit: 200 });
  if (settlements.length === 0) {
    results.push({ id: 'no-pending', status: 'pass', critical: false, message: '지급 대기 건 없음' });
    return results;
  }

  let unapprovedCritical = 0, unapprovedHigh = 0;

  for (const s of settlements) {
    const amount = s.expectedVendorPayout ?? 0;
    const isException = s.isException ?? s.isManualPayout ?? false;
    const required = requiredApprovalLevel(amount, isException);
    const approvalCount = s.approvals?.length ?? (s.approvedBy ? 1 : 0);

    const needCount = required === 'dual' || required === 'executive' ? 2 : 1;
    if (approvalCount < needCount) {
      if (required === 'executive' || isException) {
        unapprovedCritical++;
        results.push(makeFinanceSignal('finance:payout-mismatch',
          `미승인 고액·예외 지급 대기 — settlementId: ${s.settlementId ?? '?'}, 금액: ${amount.toLocaleString()}원, 필요: ${required} 승인 (현재: ${approvalCount}/${needCount})`,
          { settlementId: s.settlementId, amount, required, approvalCount, needCount }
        ));
      } else {
        unapprovedHigh++;
        results.push({ id: `approval-pending:${s.settlementId ?? 'unknown'}`, status: 'warn', critical: false, message: `승인 대기 — settlementId: ${s.settlementId ?? '?'}, 금액: ${amount.toLocaleString()}원 (${approvalCount}/${needCount} 승인)` });
      }
    }
  }

  if (unapprovedCritical === 0 && unapprovedHigh === 0) {
    results.push({ id: 'approvals-ok', status: 'pass', critical: false, message: `승인 매트릭스 정상 (지급 대기: ${settlements.length}건)` });
  }
  return results;
}
