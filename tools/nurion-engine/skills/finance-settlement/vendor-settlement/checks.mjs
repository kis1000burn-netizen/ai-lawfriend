/**
 * finance-settlement/vendor-settlement: checks.mjs
 * 업체 정산 프로필 완성도, 계좌 검증 상태, 수수료 계산 정합성을 확인합니다.
 */
import { loadSettlements, calcExpectedPayout, makeFinanceSignal } from '../_lib.mjs';

const REQUIRED_PROFILE_FIELDS = ['vendorId', 'settlementCycle', 'commissionRate', 'vatType'];

export async function runChecks(context) {
  const { config, profile } = context;
  const opts = profile?.skillOptions?.['finance-settlement/vendor-settlement'] ?? {};
  const vendorProfiles = opts.vendorProfiles ?? {};
  const results = [];

  if (Object.keys(vendorProfiles).length === 0) {
    results.push({ id: 'vendor-profiles-configured', status: 'warn', critical: false, message: '업체 정산 프로필 미설정 — skillOptions.vendor-settlement.vendorProfiles 필요' });
    return results;
  }

  let incompleteCount = 0, unverifiedCount = 0;

  for (const [vendorId, vp] of Object.entries(vendorProfiles)) {
    // 필수 필드 확인
    const missing = REQUIRED_PROFILE_FIELDS.filter(f => vp[f] == null);
    if (missing.length > 0) {
      incompleteCount++;
      results.push({ id: `vendor-profile:${vendorId}`, status: 'fail', critical: false, message: `업체 프로필 필수 필드 누락 — ${vendorId}: ${missing.join(', ')}` });
    }

    // 계좌 검증 상태
    if (vp.bankAccountVerified === false) {
      unverifiedCount++;
      results.push({ id: `vendor-bank:${vendorId}`, status: 'warn', critical: false, message: `업체 계좌 미검증 — ${vendorId} (지급 전 검증 필요)` });
    }

    // 수수료율 범위 확인
    if (vp.commissionRate != null && (vp.commissionRate < 0 || vp.commissionRate > 0.5)) {
      results.push(makeFinanceSignal('finance:payout-mismatch', `업체 수수료율 이상 — ${vendorId}: ${(vp.commissionRate * 100).toFixed(1)}% (정상 범위: 0~50%)`, { vendorId }));
    }

    // 정산 주기 검증
    const validCycles = ['daily', 'weekly', 'biweekly', 'monthly'];
    if (vp.settlementCycle && !validCycles.includes(vp.settlementCycle)) {
      results.push({ id: `vendor-cycle:${vendorId}`, status: 'warn', critical: false, message: `업체 정산 주기 값 확인 필요 — ${vendorId}: '${vp.settlementCycle}'` });
    }
  }

  if (incompleteCount === 0 && unverifiedCount === 0) {
    results.push({ id: 'vendor-profiles-ok', status: 'pass', critical: false, message: `업체 정산 프로필 정상 (${Object.keys(vendorProfiles).length}개 업체)` });
  } else {
    results.push({ id: 'vendor-summary', status: 'warn', critical: false, message: `업체 프로필 검사: 미완성 ${incompleteCount}개, 계좌 미검증 ${unverifiedCount}개` });
  }

  return results;
}
