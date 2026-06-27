/**
 * payment-boundary: checks.mjs
 *
 * P-0 결제 경계 검사:
 *  1. code:p0-boundary 신호 상태 확인
 *  2. 결제 엔드포인트 인증 없이 접근 가능 여부 (unauthenticated probe)
 *  3. payment_waiting 상태 probe 존재 여부
 *
 * 이 스킬은 감지·차단만 담당합니다.
 * 결제 금액 변경·환불·가격 수정은 이 스킬의 범위 밖입니다.
 */

async function fetchWithTimeout(url, timeoutMs = 5000, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow', ...options });
    return { ok: res.ok, status: res.status, latencyMs: Date.now() - started };
  } catch (error) {
    return { ok: false, status: 0, latencyMs: Date.now() - started, error: String(error?.message || error) };
  } finally {
    clearTimeout(timer);
  }
}

export async function runChecks(context) {
  const { config, signals = [] } = context;
  const results = [];

  // ── 1. code:p0-boundary 신호 확인 ──────────────────────────────────────────
  const p0Signal = signals.find(s => s.id === 'code:p0-boundary');
  if (p0Signal) {
    results.push({
      id: 'p0-signal',
      status: p0Signal.status === 'pass' ? 'pass' : 'fail',
      critical: true,
      message: p0Signal.status === 'pass'
        ? 'P-0 경계 신호 정상 (code:p0-boundary pass)'
        : `P-0 경계 위반 — code:p0-boundary: ${p0Signal.message}`,
    });
  } else {
    results.push({
      id: 'p0-signal',
      status: 'warn',
      critical: false,
      message: 'code:p0-boundary probe 미설정 — config.probes 에 추가 권고',
    });
  }

  // ── 2. 결제 엔드포인트 미인증 접근 차단 확인 ──────────────────────────────
  const paymentProbes = (config.probes ?? []).filter(p =>
    p.id?.startsWith('payment:') || p.id?.includes('save_payment') || p.id?.includes('pay')
  );

  for (const probe of paymentProbes) {
    if (probe.type !== 'http') continue;
    // 인증 헤더 없이 요청 → 200 이면 경계 위반
    const res = await fetchWithTimeout(probe.url, probe.timeoutMs ?? 5000);
    const isOpenAccess = res.ok && res.status === 200;
    results.push({
      id: `auth-gate:${probe.id}`,
      status: isOpenAccess ? 'fail' : 'pass',
      critical: isOpenAccess,
      message: isOpenAccess
        ? `결제 엔드포인트 미인증 200 응답 — ${probe.url} (P-0 경계 위반)`
        : `결제 엔드포인트 인증 차단 확인 (HTTP ${res.status})`,
      httpStatus: res.status,
    });
  }

  // ── 3. payment_waiting 상태 probe 존재 여부 ─────────────────────────────────
  const waitingProbe = (config.probes ?? []).find(
    p => p.id === 'payment:waiting' || p.id?.includes('payment_waiting')
  );
  results.push({
    id: 'waiting-state',
    status: waitingProbe ? 'pass' : 'warn',
    critical: false,
    message: waitingProbe
      ? `payment_waiting 상태 probe 존재: ${waitingProbe.id}`
      : 'payment_waiting 상태 probe 미설정 — config.probes 에 추가 권고',
  });

  return results;
}
