/**
 * media-review: actions.mjs
 * 허용된 조치: MEDIA_HIDDEN 플래그, 검수 이벤트 기록, 알림
 * 금지: 미디어 파일 삭제, 승인 처리
 */
import path from 'node:path';

export async function runActions(skillSignals, context) {
  const { config, apply, ROOT, writeJson, isoNow } = context;
  const actions = [];

  const exposedFails = skillSignals.filter(s =>
    s.id.includes(':exposed:') && s.status === 'fail'
  );

  if (exposedFails.length === 0) return actions;

  // 조치 1: 알림
  const exposedList = exposedFails.map(s => `  • ${s.url ?? s.message}`).join('\n');
  actions.push({
    type: 'notify',
    message: `[media-review] 미승인 미디어 공개 노출 감지\n${exposedList}\n\n미디어 삭제·승인은 운영자가 직접 처리하세요.`,
    executed: true,
  });

  // 조치 2: 검수 이벤트 기록 (항상 허용)
  const eventPath = path.join(ROOT, '_nurion_events', 'media-review-events.ndjson');
  try {
    const { appendNdjson } = await import('../../scripts/nurion-utils.mjs');
    await appendNdjson(eventPath, {
      type: 'media-exposed',
      exposedUrls: exposedFails.map(s => s.url).filter(Boolean),
      detectedAt: isoNow(),
      platformId: config.platformId,
    });
    actions.push({
      type: 'record-event',
      message: `미디어 노출 이벤트 기록 완료: ${eventPath}`,
      executed: true,
    });
  } catch (error) {
    actions.push({
      type: 'record-event',
      message: `이벤트 기록 실패: ${error.message}`,
      executed: false,
      error: String(error.message),
    });
  }

  // 조치 3: MEDIA_HIDDEN 플래그 (apply + remoteActions)
  const remoteEnabled =
    apply &&
    config.remoteActions?.enabled &&
    process.env.NURION_REMOTE_ACTIONS === '1' &&
    config.remoteActions?.actionWebhook;

  if (remoteEnabled) {
    try {
      const res = await fetch(config.remoteActions.actionWebhook, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'set_flag',
          key: 'MEDIA_HIDDEN',
          value: '1',
          platformId: config.platformId,
          skill: 'media-review',
          reason: '미승인 미디어 공개 노출',
          affectedUrls: exposedFails.map(s => s.url).filter(Boolean),
        }),
      });
      actions.push({
        type: 'set_flag',
        key: 'MEDIA_HIDDEN',
        value: '1',
        executed: res.ok,
        httpStatus: res.status,
        message: res.ok ? 'MEDIA_HIDDEN=1 전송 완료' : `전송 실패 (HTTP ${res.status})`,
      });
    } catch (error) {
      actions.push({
        type: 'set_flag',
        key: 'MEDIA_HIDDEN',
        value: '1',
        executed: false,
        error: String(error?.message || error),
        message: 'MEDIA_HIDDEN 전송 오류',
      });
    }
  } else {
    actions.push({
      type: 'set_flag',
      key: 'MEDIA_HIDDEN',
      value: '1',
      executed: false,
      dryRun: true,
      message: 'MEDIA_HIDDEN=1 (dry-run)',
    });
  }

  return actions;
}
