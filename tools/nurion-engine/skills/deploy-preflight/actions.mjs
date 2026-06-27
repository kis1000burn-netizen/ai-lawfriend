/**
 * deploy-preflight: actions.mjs
 * 허용된 자동조치: 배포 차단 알림, DEPLOY_BLOCK 플래그 전송
 * 금지: 실제 배포 실행·취소, 인프라 변경
 */

export async function runActions(skillSignals, context) {
  const { config, grade, apply } = context;
  const actions = [];

  const hasCriticalFail = skillSignals.some(s => s.status === 'fail' && s.critical);
  const hasGradeBlock = skillSignals.some(s => s.id.endsWith(':grade-gate') && s.status === 'fail');

  if (!hasCriticalFail && !hasGradeBlock) return actions;

  // 조치 1: 알림
  const failList = skillSignals
    .filter(s => s.status === 'fail')
    .map(s => `  • ${s.id}: ${s.message}`)
    .join('\n');

  actions.push({
    type: 'notify',
    message: `[deploy-preflight] 배포 전 검사 실패\n${failList}`,
    executed: true,
  });

  // 조치 2: DEPLOY_BLOCK 플래그 (apply + remoteActions 활성화 시)
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
          key: 'DEPLOY_BLOCK',
          value: '1',
          platformId: config.platformId,
          skill: 'deploy-preflight',
          reason: hasGradeBlock ? `${grade} 등급 차단` : '빌드/smoke 검사 실패',
        }),
      });
      actions.push({
        type: 'set_flag',
        key: 'DEPLOY_BLOCK',
        value: '1',
        executed: res.ok,
        httpStatus: res.status,
        message: res.ok ? 'DEPLOY_BLOCK=1 전송 완료' : `DEPLOY_BLOCK 전송 실패 (HTTP ${res.status})`,
      });
    } catch (error) {
      actions.push({
        type: 'set_flag',
        key: 'DEPLOY_BLOCK',
        value: '1',
        executed: false,
        error: String(error?.message || error),
        message: 'DEPLOY_BLOCK 전송 오류',
      });
    }
  } else {
    actions.push({
      type: 'set_flag',
      key: 'DEPLOY_BLOCK',
      value: '1',
      executed: false,
      dryRun: true,
      message: 'DEPLOY_BLOCK=1 (dry-run — apply 모드 및 remoteActions 활성화 시 실행)',
    });
  }

  return actions;
}
