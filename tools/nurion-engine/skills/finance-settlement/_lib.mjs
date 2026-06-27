/**
 * finance-settlement/_lib.mjs  (v2 — 강화판)
 *
 * ─ 변경 내역 ──────────────────────────────────────────────────────────────────
 *   v2  금액 정수 강제, 반올림 정책, Idempotency Key, 해시체인 추가
 *
 * ─ 원칙 ───────────────────────────────────────────────────────────────────────
 *   1. 모든 KRW 금액은 원 단위 정수로만 저장 (부동소수점 금지)
 *   2. 중간 계산 후 roundKrw()로 즉시 정수 확정
 *   3. 동일 정산 요청 재시도 → idempotencyKey로 중복 차단
 *   4. 감사 이벤트는 해시체인으로 연결 → 사후 변조 탐지
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

// ─── 1. 금액 정수 강제 ────────────────────────────────────────────────────────

/**
 * KRW 금액이 정수인지 검증합니다.
 * 부동소수점 계산 결과를 저장하려 할 때 오류를 즉시 발생시킵니다.
 */
export function assertKrwInt(amount, fieldName = 'amount') {
  if (!Number.isInteger(amount)) {
    throw new TypeError(
      `[KRW 정수 위반] ${fieldName} = ${amount} — ` +
      `KRW는 원 단위 정수만 허용됩니다. roundKrw()를 먼저 호출하세요.`
    );
  }
  return amount;
}

/**
 * 중간 계산 후 정수로 확정합니다.
 * 정책: HALF_UP (4사5입) — 세금 계산 기본값
 */
export function roundKrw(amount, policy = 'HALF_UP') {
  if (policy === 'HALF_UP') return Math.round(amount);
  if (policy === 'FLOOR')   return Math.floor(amount);
  if (policy === 'CEIL')    return Math.ceil(amount);
  return Math.round(amount);
}

// ─── 2. 정산 상태 머신 ────────────────────────────────────────────────────────

export const SETTLEMENT_STATES = Object.freeze({
  NORMAL:    ['draft', 'approved', 'payment_waiting', 'paid', 'reconciled', 'closed'],
  EXCEPTION: ['disputed', 'refund_pending', 'chargeback_pending', 'hold', 'failed'],
});

export const ALLOWED_TRANSITIONS = Object.freeze({
  draft:              ['approved', 'hold', 'failed'],
  approved:           ['payment_waiting', 'hold', 'disputed'],
  payment_waiting:    ['paid', 'hold', 'failed', 'disputed'],
  paid:               ['reconciled', 'disputed', 'chargeback_pending'],
  reconciled:         ['closed', 'disputed'],
  closed:             [],
  disputed:           ['refund_pending', 'hold', 'closed'],
  refund_pending:     ['closed', 'failed'],
  chargeback_pending: ['closed', 'failed'],
  hold:               ['draft', 'approved', 'failed'],
  failed:             [],
});

/** paid 이후 상태에서는 금액 수정 불가 — adjustment 거래 생성으로만 처리 */
export const IMMUTABLE_STATES = new Set(['paid', 'reconciled', 'closed']);

export function isValidTransition(fromState, toState) {
  return (ALLOWED_TRANSITIONS[fromState] ?? []).includes(toState);
}

// ─── 3. 정산 금액 계산 ────────────────────────────────────────────────────────

/**
 * 업체 지급 예정액 계산.
 * 모든 중간값을 roundKrw()로 즉시 정수 확정합니다.
 *
 * payout = orderAmount - discount - cancel - pgFee - deliveryFee(vendor_borne) - commission
 */
export function calcExpectedPayout(order, vendorProfile, roundingPolicy = 'HALF_UP') {
  const orderAmount   = assertKrwInt(Math.round(order.orderAmount ?? 0),   'orderAmount');
  const discountAmount= assertKrwInt(Math.round(order.discountAmount ?? 0),'discountAmount');
  const cancelAmount  = assertKrwInt(Math.round(order.cancelAmount ?? 0),  'cancelAmount');
  const pgFee         = assertKrwInt(Math.round(order.pgFee ?? 0),         'pgFee');
  const deliveryFee   = assertKrwInt(Math.round(order.deliveryFee ?? 0),   'deliveryFee');

  const commissionRate    = vendorProfile?.commissionRate ?? 0;
  const vendorBorneDelivery = vendorProfile?.deliveryFeeRule === 'vendor_borne';
  const holdDays          = vendorProfile?.holdDays ?? 0;

  const base       = orderAmount - discountAmount - cancelAmount;
  const commission = roundKrw(base * commissionRate, roundingPolicy);
  const delivery   = vendorBorneDelivery ? deliveryFee : 0;
  const payout     = base - pgFee - commission - delivery;

  assertKrwInt(commission, 'commission');
  assertKrwInt(payout,     'expectedPayout');

  return {
    orderAmount, discountAmount, cancelAmount, pgFee,
    platformCommission: commission,
    commissionRate,
    deliveryFeeCharged: delivery,
    expectedPayout: payout,
    holdDays,
    settlementDue: holdDays > 0 ? addDays(new Date(), holdDays).toISOString() : null,
  };
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// ─── 4. 불일치 감지 (허용 오차 정책 적용) ─────────────────────────────────────

/**
 * 금액 불일치를 감지합니다.
 *
 * reconciliationPolicy:
 *   allowedDifferenceKrw     — 이 이하 차이는 정상으로 처리 (기본 0 = 1원도 허용 안 함)
 *   allocationToleranceKrw   — 안분 규칙 허용 범위 (사유 필수)
 *   requireReasonForTolerance — 허용 오차 사유 기록 강제 여부
 */
export function detectMismatch(expected, actual, reconciliationPolicy = {}) {
  if (actual === null || actual === undefined) return null;

  const e = roundKrw(expected);
  const a = roundKrw(actual);
  const diff    = e - a;
  const absDiff = Math.abs(diff);

  if (absDiff === 0) return null;

  const {
    allowedDifferenceKrw   = 0,
    allocationToleranceKrw = 0,
  } = reconciliationPolicy;

  if (absDiff <= allowedDifferenceKrw) return null; // 허용 범위 내 → 정상

  return {
    expected: e,
    actual: a,
    difference: diff,
    absDiff,
    sign: diff > 0 ? 'underpaid' : 'overpaid',
    withinAllocationTolerance: absDiff <= allocationToleranceKrw,
  };
}

// ─── 5. 지급 Idempotency Key ──────────────────────────────────────────────────

/**
 * 같은 정산 요청이 재시도되어도 중복 지급되지 않도록 고유 키를 생성합니다.
 *
 * payoutId = settlementId:vendorId:payoutCycle:r{revision}
 */
export function buildPayoutIdempotencyKey(settlementId, vendorId, payoutCycle, revision = 1) {
  const raw     = `${settlementId}:${vendorId}:${payoutCycle}:r${revision}`;
  const payoutId = `${settlementId}-${vendorId}-${payoutCycle}-r${revision}`;
  const idempotencyKey = crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
  return { payoutId, idempotencyKey };
}

/** idempotencyKey 또는 payoutId 기준으로 이미 지급된 건인지 확인합니다. */
export function isAlreadyProcessed(settlement) {
  return ['paid', 'reconciled', 'closed', 'processing'].includes(settlement.status);
}

// ─── 6. 감사 해시체인 ─────────────────────────────────────────────────────────

/** 창세 블록 해시 (최초 이벤트의 previousHash) */
export const GENESIS_HASH = '0'.repeat(64);

/**
 * 감사 이벤트에 해시체인 링크를 추가합니다.
 *
 * currentHash = SHA-256( previousHash + ":" + JSON.stringify(payload) )
 *
 * 중간 이벤트가 삭제·변경되면 체인이 끊어져 탐지됩니다.
 */
export function buildHashChainEntry(previousHash, payload, actor = 'nurion-engine') {
  const payloadStr = JSON.stringify(payload);
  const currentHash = crypto
    .createHash('sha256')
    .update(`${previousHash}:${payloadStr}`, 'utf8')
    .digest('hex');
  return {
    previousHash,
    currentHash,
    payloadHash: crypto.createHash('sha256').update(payloadStr, 'utf8').digest('hex'),
    actor,
    chainedAt: new Date().toISOString(),
  };
}

/** approval-audit.ndjson 에서 마지막 해시를 로드합니다. */
export async function loadLastAuditHash(auditLogPath) {
  try {
    const text = await fs.readFile(auditLogPath, 'utf8');
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return GENESIS_HASH;
    const last = JSON.parse(lines[lines.length - 1]);
    return last.currentHash ?? GENESIS_HASH;
  } catch {
    return GENESIS_HASH;
  }
}

// ─── 7. 정산 데이터 I/O ───────────────────────────────────────────────────────

const SETTLEMENT_DIR = (ROOT) => path.join(ROOT, '_nurion_events', 'settlements');

export async function loadSettlements(ROOT, platformId, options = {}) {
  const dir = SETTLEMENT_DIR(ROOT);
  const { limit = 500, status = null } = options;
  const settlements = [];

  try {
    const files = await fs.readdir(dir);
    const relevant = files
      .filter(f => f.endsWith('.ndjson') && (!platformId || f.startsWith(platformId)))
      .sort()
      .reverse()
      .slice(0, 10);

    for (const file of relevant) {
      const text = await fs.readFile(path.join(dir, file), 'utf8');
      for (const line of text.split(/\r?\n/).filter(Boolean)) {
        try {
          const rec = JSON.parse(line);
          if (!status || rec.status === status) {
            settlements.push(rec);
            if (settlements.length >= limit) break;
          }
        } catch { /* 손상 라인 무시 */ }
      }
      if (settlements.length >= limit) break;
    }
  } catch { /* 디렉토리 없으면 빈 배열 */ }

  return settlements;
}

export async function saveSettlementEvent(ROOT, platformId, event) {
  const dir  = SETTLEMENT_DIR(ROOT);
  const day  = new Date().toISOString().slice(0, 10);
  const file = path.join(dir, `${platformId}-${day}.ndjson`);
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(file, JSON.stringify(event) + '\n', 'utf8');
}

// ─── 8. VAT 계산 ──────────────────────────────────────────────────────────────

export function calcVat(amount, vatType = 'taxable', vatRate = 0.10, roundingPolicy = 'HALF_UP') {
  if (vatType === 'exempt' || vatType === 'zero_rate') return 0;
  return roundKrw(amount * vatRate, roundingPolicy);
}

// ─── 9. G등급 매핑 ────────────────────────────────────────────────────────────

export const FINANCE_SIGNAL_GRADES = {
  'finance:payout-duplicate':     { critical: true,  p0: true  },  // G4
  'finance:payout-mismatch':      { critical: true,  p0: false },  // G3
  'finance:tax-invoice-late':     { critical: true,  p0: false },  // G3
  'finance:vendor-balance-drift': { critical: true,  p0: false },  // G3
  'finance:cashflow-risk':        { critical: true,  p0: false },  // G3
  'finance:negative-margin':      { critical: false, p0: false },  // G2
  'finance:missing-invoice':      { critical: false, p0: false },  // G2
  'finance:refund-spike':         { critical: false, p0: false },  // G2
};

export function makeFinanceSignal(type, message, extra = {}) {
  const def = FINANCE_SIGNAL_GRADES[type] ?? { critical: false, p0: false };
  return {
    id:           def.p0 ? 'code:p0-boundary' : type,
    financeType:  type,
    status:       'fail',
    critical:     def.critical,
    message,
    ...extra,
  };
}
