/**
 * finance-settlement/payout-control: checks.mjs  (v2)
 *
 * 강화 내역:
 *   - Idempotency Key 기반 중복 지급 차단
 *   - paid/processing 상태 재처리 시도 감지
 *   - paid 이후 금액 수정 시도 감지
 */
import {
  loadSettlements,
  ALLOWED_TRANSITIONS,
  IMMUTABLE_STATES,
  makeFinanceSignal,
  buildPayoutIdempotencyKey,
  isAlreadyProcessed,
} from '../_lib.mjs';

export async function runChecks(context) {
  const { config, profile, ROOT } = context;
  const results = [];

  const settlements = await loadSettlements(ROOT, config.platformId, { limit: 200 });

  if (settlements.length === 0) {
    results.push({ id: 'data-available', status: 'warn', critical: false, message: '정산 데이터 없음 — 감시 대상 없음' });
    return results;
  }

  // ── 1. Idempotency Key 기반 중복 지급 차단 ──────────────────────────────────
  const idempotencyMap = {};
  for (const s of settlements) {
    if (!s.settlementId || !s.vendorId) continue;
    // 이미 paid/processing 상태인데 새 지급 요청이 있는지 확인
    if (s.status === 'paid' || s.status === 'processing') {
      const { payoutId } = buildPayoutIdempotencyKey(
        s.settlementId, s.vendorId, s.payoutCycle ?? 'default', s.revision ?? 1
      );
      if (idempotencyMap[payoutId]) {
        // 동일 payoutId 중복 감지
        results.push(makeFinanceSignal(
          'finance:payout-duplicate',
          `Idempotency 위반 — payoutId: ${payoutId} 이미 ${idempotencyMap[payoutId]} 상태 (재시도 차단)`,
          { settlementId: s.settlementId, vendorId: s.vendorId, payoutId, existingStatus: idempotencyMap[payoutId] }
        ));
      } else {
        idempotencyMap[payoutId] = s.status;
      }
    }
  }

  // ── 2. 직접 중복 paid 감지 ────────────────────────────────────────────────
  const paidMap = {};
  for (const s of settlements) {
    if (s.status === 'paid' && s.settlementId) {
      paidMap[s.settlementId] = (paidMap[s.settlementId] ?? 0) + 1;
    }
  }
  for (const [sid, cnt] of Object.entries(paidMap)) {
    if (cnt > 1) {
      results.push(makeFinanceSignal(
        'finance:payout-duplicate',
        `중복 지급 감지 — settlementId: ${sid} (paid ${cnt}회)`,
        { settlementId: sid, paidCount: cnt }
      ));
    }
  }

  // ── 3. 상태 머신 위반 ────────────────────────────────────────────────────
  for (const s of settlements) {
    if (s.prevStatus && s.status) {
      const allowed = ALLOWED_TRANSITIONS[s.prevStatus] ?? [];
      if (!allowed.includes(s.status)) {
        results.push(makeFinanceSignal(
          'finance:payout-mismatch',
          `상태 전환 위반 — settlementId: ${s.settlementId ?? '?'}: ${s.prevStatus} → ${s.status}`,
          { settlementId: s.settlementId, prevStatus: s.prevStatus, newStatus: s.status }
        ));
      }
    }

    // IMMUTABLE 상태에서 금액 수정 시도
    if (IMMUTABLE_STATES.has(s.status) && s.amountModifiedAfterPaid) {
      results.push(makeFinanceSignal(
        'finance:payout-duplicate',
        `paid 이후 금액 수정 시도 — settlementId: ${s.settlementId ?? '?'} (status: ${s.status})`,
        { settlementId: s.settlementId, status: s.status, detail: 'amountModifiedAfterPaid=true' }
      ));
    }
  }

  // ── 4. 미승인 지급 대기 ──────────────────────────────────────────────────
  const unapproved = settlements.filter(s => s.status === 'payment_waiting' && !s.approvedBy);
  if (unapproved.length > 0) {
    results.push({ id: 'unapproved-payments', status: 'warn', critical: false, message: `미승인 지급 대기 ${unapproved.length}건`, count: unapproved.length });
  }

  const hasCritical = results.some(r => r.status === 'fail' && r.critical);
  if (!hasCritical && Object.keys(paidMap).every(k => paidMap[k] === 1)) {
    results.push({ id: 'payout-integrity', status: 'pass', critical: false, message: `지급 무결성 정상 (검사: ${settlements.length}건)` });
  }

  return results;
}
