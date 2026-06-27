/**
 * media-review: checks.mjs
 * 미승인 미디어 공개 노출 여부, 승인 이력 파일을 검사합니다.
 */
import path from 'node:path';

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
  const { config, profile, ROOT, readJson } = context;
  const opts = profile?.skillOptions?.['media-review'] ?? {};
  const results = [];

  // ── 1. 미승인 미디어 공개 노출 확인 ─────────────────────────────────────────
  const pendingMediaUrls = opts.pendingMediaUrls ?? [];

  if (pendingMediaUrls.length === 0) {
    results.push({
      id: 'pending-configured',
      status: 'warn',
      critical: false,
      message: '미승인 미디어 URL 미설정 (skillOptions.media-review.pendingMediaUrls 필요)',
    });
  } else {
    for (const url of pendingMediaUrls) {
      const res = await fetchHead(url);
      if (res.ok) {
        results.push({
          id: `exposed:${encodeURIComponent(url).slice(0, 40)}`,
          status: 'fail',
          critical: true,
          message: `미승인 미디어 공개 노출 감지 — ${url} (HTTP ${res.status})`,
          url,
        });
      } else {
        results.push({
          id: `exposed:${encodeURIComponent(url).slice(0, 40)}`,
          status: 'pass',
          critical: false,
          message: `미승인 미디어 비공개 확인 — ${url} (HTTP ${res.status})`,
          url,
        });
      }
    }
  }

  // ── 2. 승인 이력 파일 존재 확인 ──────────────────────────────────────────────
  const historyPath = opts.historyFile
    ?? path.join(ROOT, '_nurion_events', 'media-review-history.json');
  const history = await readJson(historyPath, null);

  if (!history) {
    results.push({
      id: 'approval-history',
      status: 'warn',
      critical: false,
      message: '미디어 승인 이력 파일 없음 — 첫 실행이거나 이력 누락',
    });
    return results;
  }

  // ── 3. reviewedBy 누락 항목 확인 ─────────────────────────────────────────────
  const entries = Array.isArray(history) ? history : (history.entries ?? []);
  const missingReviewer = entries.filter(e => !e.reviewedBy);
  if (missingReviewer.length > 0) {
    results.push({
      id: 'approval-reviewer',
      status: 'warn',
      critical: false,
      message: `승인 이력 ${missingReviewer.length}건에 reviewedBy 없음 — 검수자 미기록`,
    });
  } else {
    results.push({
      id: 'approval-history',
      status: 'pass',
      critical: false,
      message: `미디어 승인 이력 정상 (${entries.length}건, 모두 reviewedBy 존재)`,
    });
  }

  return results;
}
