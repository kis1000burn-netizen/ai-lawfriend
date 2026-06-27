/**
 * gas-health: actions.mjs
 * 허용된 자동조치: GAS_MAINTENANCE_BANNER 플래그, 알림
 * 금지: GAS 코드 수정, Spreadsheet 데이터 변경, 재배포
 */

export async function runActions(skillSignals, context) {
  const { config, apply } = context;
  const actions = [];

  const endpointFail = skillSignals.find(s => s.id.endsWith(':endpoint') && s.status === 'fail');
  const latencyWarn  = skillSignals.find(s => s.id.endsWith(':latency')  && s.status === 'warn');

  if (!endpointFail && !latencyWarn) return actions;

  const reason = endpointFail
    ? `GAS 엔드포인트 오류: ${endpointFail.message}`
    : `GAS 응답 지연: ${latencyWarn.message}`;

  // 조치 1: 알림
  actions.push({
    type: 'notify',
    message: `[gas-health] ${reason}`,
    executed: true,
  });

  // 조치 2: GAS_MAINTENANCE_BANNER 플래그 (엔드포인트 실패 시에만)
  if (endpointFail) {
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
            key: 'GAS_MAINTENANCE_BANNER',
            value: '1',
            platformId: config.platformId,
            skill: 'gas-health',
            reason,
          }),
        });
        actions.push({
          type: 'set_flag',
          key: 'GAS_MAINTENANCE_BANNER',
          value: '1',
          executed: res.ok,
          httpStatus: res.status,
          message: res.ok ? 'GAS_MAINTENANCE_BANNER=1 전송 완료' : `전송 실패 (HTTP ${res.status})`,
        });
      } catch (error) {
        actions.push({
          type: 'set_flag',
          key: 'GAS_MAINTENANCE_BANNER',
          value: '1',
          executed: false,
          error: String(error?.message || error),
          message: 'GAS_MAINTENANCE_BANNER 전송 오류',
        });
      }
    } else {
      actions.push({
        type: 'set_flag',
        key: 'GAS_MAINTENANCE_BANNER',
        value: '1',
        executed: false,
        dryRun: true,
        message: 'GAS_MAINTENANCE_BANNER=1 (dry-run)',
      });
    }
  }

  return actions;
}
