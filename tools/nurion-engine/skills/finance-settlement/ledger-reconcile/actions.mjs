/**
 * finance-settlement/ledger-reconcile: actions.mjs
 *
 * 허용된 조치:
 *  ✅ SETTLEMENT_HOLD 플래그 (G3 + apply)
 *  ✅ SETTLEMENT_MISMATCH 인시던트 저장
 *  ✅ 알림·에스컬레이션
 *
 * 절대 금지:
 *  ❌ 지급 금액 변경
 *  ❌ 송금 실행
 *  ❌ 원본 거래 수정·삭제
 *  ❌ 정산 상태 직접 변경 (adjustment 생성으로만 처리)
 */
import path from 'node:path';
import { saveSettlementEvent } from '../_lib.mjs';

export async function runActions(skillSignals, context) {
  const { config, grade, apply, ROOT, isoNow } = context;
  const actions = [];

  const mismatches  = skillSignals.filter(s => s.financeType === 'finance:payout-mismatch');
  const duplicates  = skillSignals.filter(s => s.financeType === 'finance:payout-duplicate' || s.id === 'code:p0-boundary');
  const hasIssue    = mismatches.length > 0 || duplicates.length > 0;

  if (!hasIssue) return actions;

  // ── 1. 인시던트 기록 (항상) ──────────────────────────────────────────────
  for (const sig of mismatches) {
    const event = {
      type: 'SETTLEMENT_MISMATCH',
      settlementId: sig.settlementId,
      orderId:      sig.orderId,
      vendorId:     sig.vendorId,
      traceId:      sig.traceId,
      mismatch:     sig.mismatch,
      detectedAt:   isoNow(),
      platformId:   config.platformId,
      status:       'pending_review',
    };
    try {
      await saveSettlementEvent(ROOT, config.platformId, event);
      actions.push({
        type: 'record-incident',
        incidentType: 'SETTLEMENT_MISMATCH',
        settlementId: sig.settlementId,
        executed: true,
        message: `SETTLEMENT_MISMATCH 기록 — ${sig.settlementId ?? '?'} (차이: ${Math.abs(sig.mismatch?.difference ?? 0).toLocaleString()}원)`,
      });
    } catch (err) {
      actions.push({ type: 'record-incident', executed: false, error: String(err.message) });
    }
  }

  // ── 2. 에스컬레이션 알림 ────────────────────────────────────────────────
  const mismatchList = mismatches
    .map(s => `  • ${s.settlementId ?? '?'}: ${s.message}`)
    .join('\n');
  const dupList = duplicates
    .filter(s => s.financeType === 'finance:payout-duplicate')
    .map(s => `  • ${s.message}`)
    .join('\n');

  const notifyParts = [];
  if (mismatches.length > 0) notifyParts.push(`정산 불일치 ${mismatches.length}건:\n${mismatchList}`);
  if (duplicates.length > 0) notifyParts.push(`중복 정산 감지:\n${dupList}`);

  actions.push({
    type: duplicates.length > 0 ? 'escalate' : 'notify',
    message: `[ledger-reconcile] 정산 이상 감지\n${notifyParts.join('\n\n')}\n\n⚠️ 지급 변경·송금 실행은 운영자가 직접 처리하세요.`,
    executed: true,
  });

  // ── 3. SETTLEMENT_HOLD 플래그 (G3 이상에서만) ───────────────────────────
  if (['G3', 'G4'].includes(grade)) {
    const remoteEnabled =
      apply &&
      config.remoteActions?.enabled &&
      process.env.NURION_REMOTE_ACTIONS === '1' &&
      config.remoteActions?.actionWebhook;

    if (remoteEnabled) {
      try {
        const res = await fetch(config.remoteActions.actionWebhook, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            action: 'set_flag',
            key: 'SETTLEMENT_HOLD',
            value: '1',
            platformId: config.platformId,
            skill: 'finance-settlement/ledger-reconcile',
            reason: `정산 불일치 ${mismatches.length}건 감지 — 수동 검토 필요`,
          }),
        });
        actions.push({
          type: 'set_flag', key: 'SETTLEMENT_HOLD', value: '1',
          executed: res.ok, httpStatus: res.status,
          message: res.ok ? 'SETTLEMENT_HOLD=1 전송 완료' : `전송 실패 (HTTP ${res.status})`,
        });
      } catch (err) {
        actions.push({ type: 'set_flag', key: 'SETTLEMENT_HOLD', value: '1', executed: false, error: String(err.message) });
      }
    } else {
      actions.push({
        type: 'set_flag', key: 'SETTLEMENT_HOLD', value: '1',
        executed: false, dryRun: true,
        message: `SETTLEMENT_HOLD=1 (dry-run — ${grade} 등급, apply + remoteActions 시 실행)`,
      });
    }
  }

  return actions;
}
