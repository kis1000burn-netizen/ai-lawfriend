/**
 * tests/finance-lib.test.mjs
 *
 * skills/finance-settlement/_lib.mjs 핵심 함수 단위 테스트
 * Node.js 내장 test runner (node:test) 사용 — 외부 의존성 없음
 *
 * 실행:
 *   node --test tests/finance-lib.test.mjs
 *   npm run nurion:test
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertKrwInt,
  roundKrw,
  calcExpectedPayout,
  detectMismatch,
  buildPayoutIdempotencyKey,
  isAlreadyProcessed,
  buildHashChainEntry,
  GENESIS_HASH,
  isValidTransition,
  IMMUTABLE_STATES,
  makeFinanceSignal,
  calcVat,
} from '../skills/finance-settlement/_lib.mjs';

// ─── 1. KRW 정수 강제 ────────────────────────────────────────────────────────

test('assertKrwInt: 정수는 그대로 반환', () => {
  assert.equal(assertKrwInt(10000), 10000);
  assert.equal(assertKrwInt(0), 0);
  assert.equal(assertKrwInt(-500), -500);
});

test('assertKrwInt: 부동소수점이면 TypeError 발생', () => {
  assert.throws(() => assertKrwInt(10000.5, 'fee'), TypeError);
  assert.throws(() => assertKrwInt(0.1), TypeError);
});

test('roundKrw: HALF_UP 반올림', () => {
  assert.equal(roundKrw(100.5), 101);
  assert.equal(roundKrw(100.4), 100);
  assert.equal(roundKrw(1234.56), 1235);
});

test('roundKrw: FLOOR 내림', () => {
  assert.equal(roundKrw(100.9, 'FLOOR'), 100);
  assert.equal(roundKrw(100.1, 'FLOOR'), 100);
});

test('roundKrw: CEIL 올림', () => {
  assert.equal(roundKrw(100.1, 'CEIL'), 101);
  assert.equal(roundKrw(100.0, 'CEIL'), 100);
});

// ─── 2. 정산 금액 계산 ────────────────────────────────────────────────────────

const VENDOR_001 = { commissionRate: 0.12, deliveryFeeRule: 'vendor_borne', holdDays: 7 };
const VENDOR_002 = { commissionRate: 0.10, deliveryFeeRule: 'platform_borne', holdDays: 14 };

test('calcExpectedPayout: 정상 계산 (vendor_001 — 배달비 업체 부담)', () => {
  const order = { orderAmount: 100000, discountAmount: 0, cancelAmount: 0, pgFee: 3000, deliveryFee: 5000 };
  const result = calcExpectedPayout(order, VENDOR_001);
  // base = 100000, commission = round(100000 * 0.12) = 12000, delivery = 5000 (vendor_borne)
  // payout = 100000 - 3000 - 12000 - 5000 = 80000
  assert.equal(result.expectedPayout, 80000);
  assert.equal(result.platformCommission, 12000);
  assert.equal(result.deliveryFeeCharged, 5000);
});

test('calcExpectedPayout: platform_borne — 플랫폼이 배달비 부담', () => {
  const order = { orderAmount: 100000, discountAmount: 0, cancelAmount: 0, pgFee: 3000, deliveryFee: 5000 };
  const result = calcExpectedPayout(order, VENDOR_002);
  // commission = round(100000 * 0.10) = 10000, delivery = 0 (platform_borne)
  // payout = 100000 - 3000 - 10000 - 0 = 87000
  assert.equal(result.expectedPayout, 87000);
  assert.equal(result.deliveryFeeCharged, 0);
});

test('calcExpectedPayout: 부분 환불 반영', () => {
  const order = { orderAmount: 50000, discountAmount: 0, cancelAmount: 10000, pgFee: 1500, deliveryFee: 3000 };
  const result = calcExpectedPayout(order, VENDOR_001);
  // base = 50000 - 10000 = 40000, commission = round(40000*0.12) = 4800, delivery = 3000
  // payout = 40000 - 1500 - 4800 - 3000 = 30700
  assert.equal(result.expectedPayout, 30700);
});

test('calcExpectedPayout: 소수점 커미션 HALF_UP 반올림', () => {
  // 0.12 * 10005 = 1200.6 → 반올림 1201
  const order = { orderAmount: 10005, discountAmount: 0, cancelAmount: 0, pgFee: 0, deliveryFee: 0 };
  const result = calcExpectedPayout(order, VENDOR_001);
  assert.equal(result.platformCommission, 1201);
  assert.equal(result.expectedPayout, 10005 - 1201);
});

// ─── 3. 불일치 감지 ───────────────────────────────────────────────────────────

test('detectMismatch: 동일 금액 → null', () => {
  assert.equal(detectMismatch(80000, 80000), null);
});

test('detectMismatch: actual null → null', () => {
  assert.equal(detectMismatch(80000, null), null);
});

test('detectMismatch: 과소지급 감지', () => {
  const result = detectMismatch(80000, 75000);
  assert.notEqual(result, null);
  assert.equal(result.sign, 'underpaid');
  assert.equal(result.absDiff, 5000);
});

test('detectMismatch: 과다지급 감지', () => {
  const result = detectMismatch(80000, 85000);
  assert.equal(result?.sign, 'overpaid');
});

test('detectMismatch: allowedDifferenceKrw 내 차이 → 허용', () => {
  assert.equal(detectMismatch(80000, 80000 - 500, { allowedDifferenceKrw: 500 }), null);
  assert.notEqual(detectMismatch(80000, 80000 - 501, { allowedDifferenceKrw: 500 }), null);
});

test('detectMismatch: allocationToleranceKrw — 1원 안분 허용', () => {
  const result = detectMismatch(80000, 79999, { allocationToleranceKrw: 1 });
  assert.equal(result?.withinAllocationTolerance, true);
  assert.equal(result?.absDiff, 1);
});

// ─── 4. Idempotency Key ───────────────────────────────────────────────────────

test('buildPayoutIdempotencyKey: 같은 입력 → 같은 키', () => {
  const a = buildPayoutIdempotencyKey('S-001', 'vendor_001', '2026-06', 1);
  const b = buildPayoutIdempotencyKey('S-001', 'vendor_001', '2026-06', 1);
  assert.equal(a.idempotencyKey, b.idempotencyKey);
  assert.equal(a.payoutId, b.payoutId);
});

test('buildPayoutIdempotencyKey: revision 다르면 다른 키', () => {
  const a = buildPayoutIdempotencyKey('S-001', 'vendor_001', '2026-06', 1);
  const b = buildPayoutIdempotencyKey('S-001', 'vendor_001', '2026-06', 2);
  assert.notEqual(a.idempotencyKey, b.idempotencyKey);
});

test('buildPayoutIdempotencyKey: SHA-256 hex 64자리', () => {
  const { idempotencyKey } = buildPayoutIdempotencyKey('X', 'Y', 'Z', 1);
  assert.match(idempotencyKey, /^[0-9a-f]{64}$/);
});

test('isAlreadyProcessed: paid/reconciled/closed/processing → true', () => {
  for (const status of ['paid', 'reconciled', 'closed', 'processing']) {
    assert.equal(isAlreadyProcessed({ status }), true, `status=${status}이어야 true`);
  }
});

test('isAlreadyProcessed: draft/approved → false', () => {
  assert.equal(isAlreadyProcessed({ status: 'draft' }), false);
  assert.equal(isAlreadyProcessed({ status: 'approved' }), false);
});

// ─── 5. 해시체인 ──────────────────────────────────────────────────────────────

test('buildHashChainEntry: GENESIS_HASH 는 0 × 64', () => {
  assert.equal(GENESIS_HASH.length, 64);
  assert.match(GENESIS_HASH, /^0+$/);
});

test('buildHashChainEntry: previousHash + payload → currentHash 결정적', () => {
  const payload = { amount: 80000, vendorId: 'vendor_001' };
  const a = buildHashChainEntry(GENESIS_HASH, payload);
  const b = buildHashChainEntry(GENESIS_HASH, payload);
  assert.equal(a.currentHash, b.currentHash);
});

test('buildHashChainEntry: payload 변경 시 hash 변경', () => {
  const a = buildHashChainEntry(GENESIS_HASH, { amount: 80000 });
  const b = buildHashChainEntry(GENESIS_HASH, { amount: 80001 });
  assert.notEqual(a.currentHash, b.currentHash);
});

test('buildHashChainEntry: 체인 연결 — 이전 currentHash → 다음 previousHash', () => {
  const e1 = buildHashChainEntry(GENESIS_HASH, { seq: 1 });
  const e2 = buildHashChainEntry(e1.currentHash, { seq: 2 });
  assert.equal(e2.previousHash, e1.currentHash);
});

test('buildHashChainEntry: 중간 이벤트 변조 탐지', () => {
  const e1 = buildHashChainEntry(GENESIS_HASH, { seq: 1 });
  const e1tampered = buildHashChainEntry(GENESIS_HASH, { seq: 1, tampered: true });
  const e2_legit   = buildHashChainEntry(e1.currentHash, { seq: 2 });
  const e2_broken  = buildHashChainEntry(e1tampered.currentHash, { seq: 2 });
  assert.notEqual(e2_legit.currentHash, e2_broken.currentHash);
});

// ─── 6. 정산 상태 머신 ────────────────────────────────────────────────────────

test('isValidTransition: draft → approved 허용', () => {
  assert.equal(isValidTransition('draft', 'approved'), true);
});

test('isValidTransition: paid → draft 불가', () => {
  assert.equal(isValidTransition('paid', 'draft'), false);
});

test('isValidTransition: closed → (모든 상태) 불가', () => {
  for (const to of ['draft', 'approved', 'paid', 'reconciled', 'hold', 'failed']) {
    assert.equal(isValidTransition('closed', to), false, `closed → ${to} 는 불가여야 함`);
  }
});

test('isValidTransition: failed → (모든 상태) 불가', () => {
  assert.equal(isValidTransition('failed', 'draft'), false);
  assert.equal(isValidTransition('failed', 'approved'), false);
});

test('IMMUTABLE_STATES: paid/reconciled/closed 포함', () => {
  assert.ok(IMMUTABLE_STATES.has('paid'));
  assert.ok(IMMUTABLE_STATES.has('reconciled'));
  assert.ok(IMMUTABLE_STATES.has('closed'));
  assert.ok(!IMMUTABLE_STATES.has('draft'));
});

// ─── 7. Finance 신호 생성 ────────────────────────────────────────────────────

test('makeFinanceSignal: 중복 지급 → P-0 경계 신호', () => {
  const sig = makeFinanceSignal('finance:payout-duplicate', '중복 지급 감지');
  assert.equal(sig.id, 'code:p0-boundary');
  assert.equal(sig.financeType, 'finance:payout-duplicate');
  assert.equal(sig.critical, true);
  assert.equal(sig.status, 'fail');
});

test('makeFinanceSignal: 불일치 → G3 critical 신호', () => {
  const sig = makeFinanceSignal('finance:payout-mismatch', '5000원 차이');
  assert.equal(sig.id, 'finance:payout-mismatch');
  assert.equal(sig.critical, true);
  assert.notEqual(sig.id, 'code:p0-boundary');
});

test('makeFinanceSignal: 음수 마진 → G2 non-critical 신호', () => {
  const sig = makeFinanceSignal('finance:negative-margin', '음수 마진');
  assert.equal(sig.critical, false);
  assert.equal(sig.status, 'fail');
});

test('makeFinanceSignal: extra 필드 병합', () => {
  const sig = makeFinanceSignal('finance:cashflow-risk', '현금 부족', { pendingPayout7d: 1000000 });
  assert.equal(sig.pendingPayout7d, 1000000);
});

// ─── 8. VAT 계산 ─────────────────────────────────────────────────────────────

test('calcVat: taxable 10%', () => {
  assert.equal(calcVat(100000, 'taxable'), 10000);
});

test('calcVat: exempt → 0', () => {
  assert.equal(calcVat(100000, 'exempt'), 0);
});

test('calcVat: zero_rate → 0', () => {
  assert.equal(calcVat(100000, 'zero_rate'), 0);
});

test('calcVat: 소수점 반올림 적용', () => {
  // 10005 * 0.10 = 1000.5 → HALF_UP → 1001
  assert.equal(calcVat(10005, 'taxable', 0.10, 'HALF_UP'), 1001);
});
