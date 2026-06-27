/**
 * asset-integrity: actions.mjs
 * 허용된 조치: 알림, 다수 실패 시 GAS_MAINTENANCE_BANNER 플래그
 * 금지: 자산 파일 수정·재업로드, CDN 조작
 */

export async function runActions(skillSignals, context) {
  const { config, apply } = context;
  const actions = [];

  const assetFails = skillSignals.filter(s => s.status === 'fail');
  const bulkFail   = skillSignals.find(s => s.id.endsWith(':bulk-fail') && s.status === 'fail');

  if (assetFails.length === 0) return actions;

  const failList = assetFails
    .filter(s => !s.id.endsWith(':bulk-fail'))
    .map(s => `  • ${s.url ?? s.message}`)
    .join('\n');

  actions.push({
    type: 'notify',
    message: `[asset-integrity] 자산 응답 오류 감지\n${failList}`,
    executed: true,
  });

  // 다수 실패 시 유지보수 배너 플래그
  if (bulkFail) {
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
            action: 'enable_banner',
            key: 'GAS_MAINTENANCE_BANNER',
            value: '1',
            platformId: config.platformId,
            skill: 'asset-integrity',
            reason: `다수 자산 실패 (${bulkFail.failCount}/${bulkFail.totalCount})`,
          }),
        });
        actions.push({
          type: 'enable_banner',
          key: 'GAS_MAINTENANCE_BANNER',
          value: '1',
          executed: res.ok,
          httpStatus: res.status,
          message: res.ok ? '유지보수 배너 활성화 완료' : `배너 활성화 실패 (HTTP ${res.status})`,
        });
      } catch (error) {
        actions.push({
          type: 'enable_banner',
          key: 'GAS_MAINTENANCE_BANNER',
          value: '1',
          executed: false,
          error: String(error?.message || error),
        });
      }
    } else {
      actions.push({
        type: 'enable_banner',
        key: 'GAS_MAINTENANCE_BANNER',
        value: '1',
        executed: false,
        dryRun: true,
        message: `GAS_MAINTENANCE_BANNER=1 (dry-run — 다수 자산 실패: ${bulkFail.failCount}건)`,
      });
    }
  }

  return actions;
}
