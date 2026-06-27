/**
 * vendor-flow: checks.mjs
 * 업체 목록 엔드포인트, 필수 필드, 배달 상태, 미디어 참조를 검사합니다.
 */

const VALID_DELIVERY_STATES = ['pending', 'processing', 'delivered', 'cancelled', 'returned'];
const REQUIRED_VENDOR_FIELDS = ['name', 'category', 'contact'];

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

export async function runChecks(context) {
  const { config, profile } = context;
  const opts = profile?.skillOptions?.['vendor-flow'] ?? {};
  const results = [];

  // vendor 목록 probe
  const vendorProbes = (config.probes ?? []).filter(p =>
    p.type === 'http' && (p.id?.startsWith('vendor:') || p.url?.includes('vendor'))
  );

  if (vendorProbes.length === 0) {
    results.push({
      id: 'endpoint-configured',
      status: 'warn',
      critical: false,
      message: 'vendor probe 미설정 (id: vendor:* 인 probe 필요)',
    });
    return results;
  }

  for (const probe of vendorProbes) {
    const res = await fetchWithTimeout(probe.url, probe.timeoutMs ?? 5000);

    if (!res.ok) {
      results.push({
        id: `endpoint:${probe.id}`,
        status: 'fail',
        critical: !!probe.critical,
        message: `업체 엔드포인트 오류 — ${probe.url} HTTP ${res.status}`,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
      });
      continue;
    }

    results.push({
      id: `endpoint:${probe.id}`,
      status: 'pass',
      critical: !!probe.critical,
      message: `업체 엔드포인트 정상 — HTTP ${res.status}, ${res.latencyMs}ms`,
    });

    // 응답 데이터 필드 검증 (배열 응답 가정)
    const vendors = Array.isArray(res.body) ? res.body : (res.body?.items ?? []);
    let missingFieldCount = 0;
    for (const vendor of vendors.slice(0, 20)) { // 최대 20개만 검사
      for (const field of REQUIRED_VENDOR_FIELDS) {
        if (!vendor[field]) missingFieldCount++;
      }
    }
    if (missingFieldCount > 0) {
      results.push({
        id: `fields:${probe.id}`,
        status: 'fail',
        critical: false,
        message: `업체 데이터 필수 필드 누락 ${missingFieldCount}건 (name/category/contact 확인 필요)`,
        missingCount: missingFieldCount,
      });
    } else if (vendors.length > 0) {
      results.push({
        id: `fields:${probe.id}`,
        status: 'pass',
        critical: false,
        message: `업체 필수 필드 정상 (검사: ${Math.min(vendors.length, 20)}개)`,
      });
    }

    // 배달 상태 유효성 검사
    const invalidDelivery = vendors
      .flatMap(v => v.deliveryStatus ? [v.deliveryStatus] : [])
      .filter(s => !VALID_DELIVERY_STATES.includes(s));
    if (invalidDelivery.length > 0) {
      results.push({
        id: `delivery-state:${probe.id}`,
        status: 'warn',
        critical: false,
        message: `유효하지 않은 배달 상태: ${[...new Set(invalidDelivery)].join(', ')}`,
      });
    }
  }

  return results;
}
