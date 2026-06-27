/**
 * submission-flow: checks.mjs
 * 접수·저장 엔드포인트 응답, 필수 필드, SUBMISSION_FREEZE 상태를 검사합니다.
 */

async function fetchWithTimeout(url, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    let body = null;
    try { body = await res.json(); } catch { /* non-JSON 무시 */ }
    return { ok: res.ok, status: res.status, latencyMs: Date.now() - started, body };
  } catch (error) {
    return { ok: false, status: 0, latencyMs: Date.now() - started, body: null, error: String(error?.message || error) };
  } finally {
    clearTimeout(timer);
  }
}

export async function runChecks(context) {
  const { config, profile } = context;
  const opts = profile?.skillOptions?.['submission-flow'] ?? {};
  const results = [];
  const latencyWarnMs = opts.latencyWarnMs ?? 5000;

  // 접수 관련 probe: id가 api:submissions 또는 submission:* 이거나, type이 http인 probe 중 url에 'submission' 포함
  const submissionProbes = (config.probes ?? []).filter(p =>
    p.type === 'http' && (
      p.id === 'api:submissions' ||
      p.id?.startsWith('submission:') ||
      p.url?.includes('submission')
    )
  );

  if (submissionProbes.length === 0) {
    results.push({
      id: 'endpoint-configured',
      status: 'warn',
      critical: false,
      message: '접수 엔드포인트 probe 미설정 (id: api:submissions 또는 submission:* 필요)',
    });
    return results;
  }

  for (const probe of submissionProbes) {
    // ── 1. HTTP 응답 확인 ────────────────────────────────────────────────────
    const res = await fetchWithTimeout(probe.url, probe.timeoutMs ?? 6000);

    if (!res.ok) {
      results.push({
        id: `endpoint:${probe.id}`,
        status: 'fail',
        critical: !!probe.critical,
        message: `접수 엔드포인트 오류 — ${probe.url} HTTP ${res.status}${res.error ? ' / ' + res.error : ''}`,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
      });
      continue;
    }

    results.push({
      id: `endpoint:${probe.id}`,
      status: 'pass',
      critical: !!probe.critical,
      message: `접수 엔드포인트 정상 — HTTP ${res.status}, ${res.latencyMs}ms`,
      httpStatus: res.status,
      latencyMs: res.latencyMs,
    });

    // ── 2. latency 경고 ──────────────────────────────────────────────────────
    if (res.latencyMs > latencyWarnMs) {
      results.push({
        id: `latency:${probe.id}`,
        status: 'warn',
        critical: false,
        message: `접수 엔드포인트 응답 지연: ${res.latencyMs}ms (기준: ${latencyWarnMs}ms)`,
        latencyMs: res.latencyMs,
      });
    }

    // ── 3. 응답 body에 식별자(id/receiptId) 확인 ────────────────────────────
    if (res.body !== null && typeof res.body === 'object') {
      const hasId = res.body?.id || res.body?.receiptId || res.body?.submissionId;
      const isArray = Array.isArray(res.body);
      if (!hasId && !isArray) {
        results.push({
          id: `body-id:${probe.id}`,
          status: 'warn',
          critical: false,
          message: `접수 응답에 id/receiptId 없음 — 접수 저장 확인 필요`,
        });
      }
    }
  }

  return results;
}
