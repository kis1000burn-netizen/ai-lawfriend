/**
 * submission-flow: actions.mjs
 * 허용된 자동조치: SUBMISSION_FREEZE 플래그(G3 이상), 알림
 * 금지: 접수 데이터 수정·삭제, 주문 상태 변경
 */

export async function runActions(skillSignals, context) {
  const { config, grade, apply } = context;
  const actions = [];

  const endpointFails = skillSignals.filter(s =>
    s.id.includes(':endpoint:') && s.status === 'fail' && s.critical
  );

  if (endpointFails.length === 0) return actions;

  const failList = endpointFails.map(s => `  • ${s.message}`).join('\n');

  // 조치 1: 알림
  actions.push({
    type: 'notify',
    message: `[submission-flow] 접수 엔드포인트 장애 감지\n${failList}`,
    executed: true,
  });

  // 조치 2: SUBMISSION_FREEZE (G3 이상에서만)
  const gradeBlocks = ['G3', 'G4'];
  if (grade && gradeBlocks.includes(grade)) {
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
            key: 'SUBMISSION_FREEZE',
            value: '1',
            platformId: config.platformId,
            skill: 'submission-flow',
            reason: '접수 엔드포인트 장애',
          }),
        });
        actions.push({
          type: 'set_flag',
          key: 'SUBMISSION_FREEZE',
          value: '1',
          executed: res.ok,
          httpStatus: res.status,
          message: res.ok ? 'SUBMISSION_FREEZE=1 전송 완료' : `전송 실패 (HTTP ${res.status})`,
        });
      } catch (error) {
        actions.push({
          type: 'set_flag',
          key: 'SUBMISSION_FREEZE',
          value: '1',
          executed: false,
          error: String(error?.message || error),
          message: 'SUBMISSION_FREEZE 전송 오류',
        });
      }
    } else {
      actions.push({
        type: 'set_flag',
        key: 'SUBMISSION_FREEZE',
        value: '1',
        executed: false,
        dryRun: true,
        message: `SUBMISSION_FREEZE=1 (dry-run — ${grade} 등급, apply + remoteActions 시 실행)`,
      });
    }
  }

  return actions;
}
