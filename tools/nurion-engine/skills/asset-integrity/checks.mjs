/**
 * asset-integrity: checks.mjs
 * CSS·JS·이미지 자산의 HTTP 200 응답 및 redirect를 검사합니다.
 */

async function fetchHead(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    // redirect: 'manual' 로 직접 리다이렉트 감지
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal, redirect: 'manual' });
    return { ok: res.ok, status: res.status, latencyMs: Date.now() - started, redirected: res.status >= 300 && res.status < 400 };
  } catch (error) {
    return { ok: false, status: 0, latencyMs: Date.now() - started, error: String(error?.message || error) };
  } finally {
    clearTimeout(timer);
  }
}

export async function runChecks(context) {
  const { config, profile } = context;
  const opts = profile?.skillOptions?.['asset-integrity'] ?? {};
  const results = [];
  const latencyWarnMs = opts.latencyWarnMs ?? 2500;

  // 자산 URL 목록: skillOptions 우선, 그 다음 config.probes 에서 asset:* 추출
  const assetUrls = opts.assetUrls ?? (config.probes ?? [])
    .filter(p => p.type === 'http' && p.id?.startsWith('asset:'))
    .map(p => ({ url: p.url, id: p.id }));

  const assetList = assetUrls.map(item =>
    typeof item === 'string' ? { url: item, id: item.split('/').pop() } : item
  );

  if (assetList.length === 0) {
    results.push({
      id: 'assets-configured',
      status: 'warn',
      critical: false,
      message: '자산 probe 미설정 (id: asset:* 인 probe 또는 skillOptions.asset-integrity.assetUrls 필요)',
    });
    return results;
  }

  let failCount = 0;

  for (const asset of assetList) {
    const res = await fetchHead(asset.url);

    if (!res.ok && !res.redirected) {
      failCount++;
      results.push({
        id: `asset:${asset.id}`,
        status: 'fail',
        critical: false,
        message: `자산 응답 오류 — ${asset.url} HTTP ${res.status}${res.error ? ' / ' + res.error : ''}`,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
        url: asset.url,
      });
    } else if (res.redirected) {
      results.push({
        id: `asset:${asset.id}`,
        status: 'warn',
        critical: false,
        message: `자산 리다이렉트 감지 — ${asset.url} HTTP ${res.status} (영구 URL 직접 참조 권고)`,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
        url: asset.url,
      });
    } else {
      results.push({
        id: `asset:${asset.id}`,
        status: res.latencyMs > latencyWarnMs ? 'warn' : 'pass',
        critical: false,
        message: res.latencyMs > latencyWarnMs
          ? `자산 응답 지연 — ${asset.url} ${res.latencyMs}ms (기준: ${latencyWarnMs}ms)`
          : `자산 정상 — ${asset.url} HTTP ${res.status}, ${res.latencyMs}ms`,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
        url: asset.url,
      });
    }
  }

  // 다수 자산 실패 시 종합 신호
  if (failCount >= 2) {
    results.push({
      id: 'bulk-fail',
      status: 'fail',
      critical: true,
      message: `다수 자산 응답 실패 (${failCount}/${assetList.length}) — 배포 또는 CDN 이상 가능성`,
      failCount,
      totalCount: assetList.length,
    });
  }

  return results;
}
