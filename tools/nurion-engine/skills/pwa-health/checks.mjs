/**
 * pwa-health: checks.mjs
 * manifest.json, 아이콘 192x192, sw.js, scope/start_url을 검사합니다.
 */

const REQUIRED_MANIFEST_FIELDS = ['name', 'start_url', 'icons'];

async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    let body = null;
    try { body = await res.json(); } catch { /* non-JSON */ }
    return { ok: res.ok, status: res.status, latencyMs: Date.now() - started, body };
  } catch (error) {
    return { ok: false, status: 0, latencyMs: Date.now() - started, body: null, error: String(error?.message || error) };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHead(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
    return { ok: res.ok, status: res.status };
  } catch (error) {
    return { ok: false, status: 0, error: String(error?.message || error) };
  } finally {
    clearTimeout(timer);
  }
}

export async function runChecks(context) {
  const { config, profile } = context;
  const opts = profile?.skillOptions?.['pwa-health'] ?? {};
  const results = [];

  // URL 결정: skillOptions 우선, 그 다음 config.probes에서 추출
  const baseUrl = opts.baseUrl ?? (() => {
    const indexProbe = (config.probes ?? []).find(p => p.url?.endsWith('/') || p.url?.endsWith('index.html'));
    if (!indexProbe?.url) return null;
    return new URL(indexProbe.url).origin;
  })();

  const manifestUrl = opts.manifestUrl ?? (baseUrl ? `${baseUrl}/manifest.json` : null);
  const swUrl       = opts.swUrl       ?? (baseUrl ? `${baseUrl}/sw.js`          : null);

  if (!manifestUrl) {
    results.push({
      id: 'config',
      status: 'warn',
      critical: false,
      message: 'PWA URL 미설정 — skillOptions.pwa-health.manifestUrl 또는 baseUrl 필요',
    });
    return results;
  }

  // ── 1. manifest.json ─────────────────────────────────────────────────────────
  const manifestRes = await fetchWithTimeout(manifestUrl);

  if (!manifestRes.ok) {
    results.push({
      id: 'manifest',
      status: 'fail',
      critical: true,
      message: `manifest.json 없음 또는 오류 — ${manifestUrl} HTTP ${manifestRes.status}`,
      httpStatus: manifestRes.status,
    });
  } else {
    results.push({
      id: 'manifest',
      status: 'pass',
      critical: true,
      message: `manifest.json 정상 — HTTP ${manifestRes.status}`,
    });

    // 필수 필드 확인
    const manifest = manifestRes.body ?? {};
    const missingFields = REQUIRED_MANIFEST_FIELDS.filter(f => !manifest[f]);
    if (missingFields.length > 0) {
      results.push({
        id: 'manifest-fields',
        status: 'fail',
        critical: false,
        message: `manifest 필수 필드 누락: ${missingFields.join(', ')}`,
      });
    } else {
      results.push({
        id: 'manifest-fields',
        status: 'pass',
        critical: false,
        message: 'manifest 필수 필드 정상 (name, start_url, icons)',
      });
    }

    // 192x192 아이콘 확인
    const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
    const has192 = icons.some(i => String(i.sizes ?? '').includes('192x192'));
    results.push({
      id: 'icon-192',
      status: has192 ? 'pass' : 'warn',
      critical: false,
      message: has192
        ? '192x192 아이콘 선언 확인'
        : `192x192 아이콘 없음 — 선언된 아이콘: ${icons.map(i => i.sizes).join(', ') || '없음'}`,
    });

    // scope 확인
    if (!manifest.scope) {
      results.push({
        id: 'manifest-scope',
        status: 'warn',
        critical: false,
        message: 'manifest scope 미설정 — 설치 범위 명시 권고',
      });
    }
  }

  // ── 2. service worker ────────────────────────────────────────────────────────
  if (swUrl) {
    const swRes = await fetchHead(swUrl);
    results.push({
      id: 'sw-js',
      status: swRes.ok ? 'pass' : 'fail',
      critical: true,
      message: swRes.ok
        ? `sw.js 정상 — HTTP ${swRes.status}`
        : `sw.js 없음 또는 오류 — ${swUrl} HTTP ${swRes.status}`,
      httpStatus: swRes.status,
    });
  }

  return results;
}
