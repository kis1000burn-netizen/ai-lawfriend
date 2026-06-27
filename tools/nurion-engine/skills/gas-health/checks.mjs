/**
 * gas-health: checks.mjs
 * GAS URL 응답, latency, 유지보수 배너 상태를 검사합니다.
 */

async function fetchWithTimeout(url, timeoutMs = 5000) {
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
  const opts = profile?.skillOptions?.['gas-health'] ?? {};
  const results = [];

  // GAS health URL: skillOptions 또는 config.probes 에서 gas 관련 probe 추출
  const gasHealthUrl = opts.gasHealthUrl
    ?? (config.probes ?? []).find(p => p.id?.startsWith('gas:'))?.url
    ?? null;

  const latencyWarnMs = opts.latencyWarnMs ?? 4000;

  // ── 1. GAS URL 설정 여부 ─────────────────────────────────────────────────────
  if (!gasHealthUrl) {
    results.push({
      id: 'url-configured',
      status: 'warn',
      critical: false,
      message: 'GAS health URL 미설정 (skillOptions.gas-health.gasHealthUrl 또는 id가 gas:* 인 probe 필요)',
    });
    return results;
  }

  // ── 2. GAS health 엔드포인트 HTTP 응답 ──────────────────────────────────────
  const res = await fetchWithTimeout(gasHealthUrl, opts.timeoutMs ?? 6000);

  if (!res.ok) {
    results.push({
      id: 'endpoint',
      status: 'fail',
      critical: true,
      message: `GAS health 응답 실패 — HTTP ${res.status}${res.error ? ' / ' + res.error : ''}`,
      httpStatus: res.status,
      latencyMs: res.latencyMs,
    });
    return results;
  }

  results.push({
    id: 'endpoint',
    status: 'pass',
    critical: true,
    message: `GAS health OK — HTTP ${res.status}, ${res.latencyMs}ms`,
    httpStatus: res.status,
    latencyMs: res.latencyMs,
  });

  // ── 3. latency 경고 ──────────────────────────────────────────────────────────
  if (res.latencyMs > latencyWarnMs) {
    results.push({
      id: 'latency',
      status: 'warn',
      critical: false,
      message: `GAS 응답 지연: ${res.latencyMs}ms (기준: ${latencyWarnMs}ms)`,
      latencyMs: res.latencyMs,
    });
  } else {
    results.push({
      id: 'latency',
      status: 'pass',
      critical: false,
      message: `GAS 응답 시간 정상: ${res.latencyMs}ms`,
      latencyMs: res.latencyMs,
    });
  }

  // ── 4. 응답 body status 확인 ─────────────────────────────────────────────────
  if (res.body !== null) {
    const bodyOk = res.body?.status === 'ok' || res.body?.ok === true;
    results.push({
      id: 'body-status',
      status: bodyOk ? 'pass' : 'warn',
      critical: false,
      message: bodyOk
        ? 'GAS body status OK'
        : `GAS body에 status:"ok" 없음 — 응답: ${JSON.stringify(res.body).slice(0, 120)}`,
    });
  }

  return results;
}
