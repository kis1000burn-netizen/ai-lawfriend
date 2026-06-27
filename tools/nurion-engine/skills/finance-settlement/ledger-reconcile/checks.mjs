/**
 * finance-settlement/ledger-reconcile: checks.mjs  (v2)
 *
 * 강화 내역:
 *   - reconciliationPolicy (허용 오차, 반올림 정책) 적용
 *   - 정수 금액 검증
 *   - allocationTolerance: 할인 안분·배송비 절사 오차 별도 처리
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import {
  loadSettlements,
  calcExpectedPayout,
  detectMismatch,
  makeFinanceSignal,
  roundKrw,
} from '../_lib.mjs';

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: controller.signal });
    let body = null;
    try { body = await res.json(); } catch { /* non-JSON */ }
    return { ok: res.ok, status: res.status, latencyMs: Date.now() - started, body };
  } catch (err) {
    return { ok: false, status: 0, latencyMs: Date.now() - started, body: null, error: String(err?.message || err) };
  } finally { clearTimeout(timer); }
}

async function loadReconciliationPolicy(ROOT, opts) {
  // skillOptions 우선, 없으면 config/reconciliation-policy.json 로드
  if (opts.reconciliation) return opts.reconciliation;
  try {
    const raw = await fs.readFile(path.join(ROOT, 'config', 'reconciliation-policy.json'), 'utf8');
    return JSON.parse(raw);
  } catch {
    return { allowedDifferenceKrw: 0, allocationToleranceKrw: 1, requireReasonForTolerance: true, roundingPolicy: 'HALF_UP' };
  }
}

export async function runChecks(context) {
  const { config, profile, ROOT } = context;
  const opts   = profile?.skillOptions?.['finance-settlement/ledger-reconcile'] ?? {};
  const results = [];

  // 오차 정책 로드
  const policy = await loadReconciliationPolicy(ROOT, opts);

  // ── 데이터 소스 결정 ─────────────────────────────────────────────────────────
  const settlementProbes = (config.probes ?? []).filter(p =>
    p.type === 'http' && (p.id?.startsWith('finance:settlement') || p.id?.startsWith('finance:payout'))
  );

  let settlements = [];
  let dataSource  = 'none';

  if (opts.settlementApiUrl) {
    const res = await fetchWithTimeout(opts.settlementApiUrl, opts.timeoutMs ?? 8000);
    if (res.ok && Array.isArray(res.body)) {
      settlements = res.body;
      dataSource  = 'api';
    } else {
      results.push({ id: 'data-source', status: 'fail', critical: true, message: `정산 API 오류 — HTTP ${res.status}` });
      return results;
    }
  } else if (settlementProbes.length > 0) {
    for (const probe of settlementProbes) {
      const res = await fetchWithTimeout(probe.url, probe.timeoutMs ?? 8000);
      if (res.ok && res.body) {
        settlements.push(...(Array.isArray(res.body) ? res.body : (res.body.items ?? [])));
        dataSource = 'probe';
      }
    }
  } else {
    settlements = await loadSettlements(ROOT, config.platformId);
    dataSource  = 'local';
  }

  if (settlements.length === 0) {
    results.push({ id: 'data-available', status: 'warn', critical: false, message: `정산 데이터 없음 (소스: ${dataSource})` });
    return results;
  }

  results.push({ id: 'data-available', status: 'pass', critical: false, message: `정산 데이터 로드 (${settlements.length}건, 소스: ${dataSource})` });
  results.push({ id: 'reconciliation-policy', status: 'pass', critical: false, message: `오차 정책 — 허용 ${policy.allowedDifferenceKrw}원, 안분 허용 ${policy.allocationToleranceKrw}원, 반올림: ${policy.roundingPolicy ?? 'HALF_UP'}` });

  // ── 대사 실행 ──────────────────────────────────────────────────────────────
  const vendorProfiles     = opts.vendorProfiles ?? {};
  const maxUnreconciledWarn = opts.maxUnreconciledWarn ?? 50;

  let mismatchCount = 0, unreconciledCount = 0;
  const seenIds = new Set();
  const duplicateIds = new Set();

  for (const s of settlements) {
    const sid = s.settlementId ?? s.id;

    // 중복 settlementId
    if (sid && seenIds.has(sid)) duplicateIds.add(sid);
    if (sid) seenIds.add(sid);

    // 미대사 카운트
    if (!['reconciled', 'closed'].includes(s.status)) unreconciledCount++;

    // 예상 지급액 자동 계산
    if (s.expectedVendorPayout == null) {
      const vp = vendorProfiles[s.vendorId] ?? null;
      if (vp && s.orderAmount != null) {
        const calc = calcExpectedPayout(s, vp, policy.roundingPolicy ?? 'HALF_UP');
        s.expectedVendorPayout = calc.expectedPayout;
      }
    }

    // 실제 vs 예상 대사
    if (s.expectedVendorPayout != null && s.actualVendorPayout != null) {
      const mismatch = detectMismatch(s.expectedVendorPayout, s.actualVendorPayout, policy);
      if (mismatch) {
        if (mismatch.withinAllocationTolerance && policy.requireReasonForTolerance) {
          // 안분 허용 범위 내 → 경고 수준 (사유 기록 촉구)
          results.push({
            id: `allocation-tolerance:${sid ?? '?'}`,
            status: 'warn',
            critical: false,
            message: `안분 오차 허용 범위 내 — settlementId: ${sid ?? '?'}, 차이: ${mismatch.absDiff}원 (사유 기록 필요)`,
            settlementId: sid, mismatch,
          });
        } else {
          mismatchCount++;
          results.push(makeFinanceSignal(
            'finance:payout-mismatch',
            `정산 불일치 — ${sid ?? '?'}: 예상 ${mismatch.expected.toLocaleString()}원, 실제 ${mismatch.actual.toLocaleString()}원, 차이 ${mismatch.absDiff.toLocaleString()}원 (${mismatch.sign})`,
            { settlementId: sid, orderId: s.orderId, vendorId: s.vendorId, traceId: s.traceId, mismatch }
          ));
        }
      }
    }
  }

  // 중복 정산 ID
  if (duplicateIds.size > 0) {
    results.push(makeFinanceSignal(
      'finance:payout-duplicate',
      `중복 settlementId 감지 (${duplicateIds.size}건) — ${[...duplicateIds].slice(0,3).join(', ')}`,
      { duplicateIds: [...duplicateIds] }
    ));
  }

  // 미대사 건수 경고
  if (unreconciledCount > maxUnreconciledWarn) {
    results.push({ id: 'unreconciled-count', status: 'warn', critical: false, message: `미대사 정산 ${unreconciledCount}건 (기준: ${maxUnreconciledWarn}건)`, unreconciledCount });
  }

  // 종합 요약
  if (mismatchCount === 0 && duplicateIds.size === 0) {
    results.push({ id: 'reconciliation-summary', status: 'pass', critical: false, message: `대사 완료 — ${settlements.length}건 중 불일치 없음 (오차 허용: ${policy.allowedDifferenceKrw}원)` });
  }

  return results;
}
