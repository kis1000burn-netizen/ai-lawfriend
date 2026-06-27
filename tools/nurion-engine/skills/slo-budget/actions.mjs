/**
 * slo-budget: actions.mjs
 *
 * 허용된 자동조치:
 *  ✅ DEPLOY_RESTRICT=1 (CRITICAL — 에러버짓 위험 수준)
 *  ✅ DEPLOY_FREEZE=1   (EXHAUSTED — 에러버짓 소진)
 *  ✅ 알림·에스컬레이션
 *
 * 금지:
 *  ❌ 배포 파이프라인 직접 조작 (GitHub Actions 게이트로 위임)
 *  ❌ SLO 목표 자동 변경
 */

export async function runActions(skillSignals, context) {
  const { config, apply } = context;
  const actions = [];

  const policySignal = skillSignals.find(s => s.id.endsWith(':deploy-policy'));
  const freezeSignal = skillSignals.find(s =>
    s.id.endsWith(':deploy-policy') &&
    s.deployPolicy?.code === 'FREEZE'
  );
  const restrictSignal = skillSignals.find(s =>
    s.id.endsWith(':deploy-policy') &&
    s.deployPolicy?.code === 'RESTRICTED'
  );
  const fastBurns = skillSignals.filter(s => s.id.includes(':fast-burn:'));

  // 빠른 소진 즉시 에스컬레이션
  if (fastBurns.length > 0) {
    const burnList = fastBurns.map(s => `  ⚡ ${s.message}`).join('\n');
    actions.push({
      type: 'escalate',
      message: `[slo-budget] 빠른 소진(Fast Burn) 감지 — 즉시 확인 필요\n${burnList}`,
      executed: true,
    });
  }

  // FREEZE: 에러버짓 소진 → DEPLOY_FREEZE 플래그
  if (freezeSignal) {
    actions.push({
      type: 'notify',
      message: `[slo-budget] ${freezeSignal.deployPolicy?.message}\n\n권고 조치:\n${
        (freezeSignal.deployPolicy?.actions ?? []).map(a => `  • ${a}`).join('\n')
      }`,
      executed: true,
    });

    await sendFlag('DEPLOY_FREEZE', '1', config, apply, 'slo-budget', '에러버짓 소진 — 신규 기능 배포 차단', actions);
    return actions;
  }

  // RESTRICTED: 에러버짓 위험 → DEPLOY_RESTRICT 플래그
  if (restrictSignal) {
    actions.push({
      type: 'notify',
      message: `[slo-budget] ${restrictSignal.deployPolicy?.message}\n\n권고 조치:\n${
        (restrictSignal.deployPolicy?.actions ?? []).map(a => `  • ${a}`).join('\n')
      }`,
      executed: true,
    });

    await sendFlag('DEPLOY_RESTRICT', '1', config, apply, 'slo-budget', '에러버짓 위험 — 승인자 필수', actions);
    return actions;
  }

  // CAUTION: 배포 주의 알림만
  if (policySignal?.status === 'warn') {
    actions.push({
      type: 'notify',
      message: `[slo-budget] ${policySignal.deployPolicy?.message ?? '배포 주의'}`,
      executed: true,
    });
  }

  return actions;
}

async function sendFlag(key, value, config, apply, skill, reason, actions) {
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
        body: JSON.stringify({ action: 'set_flag', key, value, platformId: config.platformId, skill, reason }),
      });
      actions.push({
        type: 'set_flag', key, value,
        executed: res.ok, httpStatus: res.status,
        message: res.ok ? `${key}=${value} 전송 완료` : `전송 실패 (HTTP ${res.status})`,
      });
    } catch (error) {
      actions.push({ type: 'set_flag', key, value, executed: false, error: String(error?.message || error) });
    }
  } else {
    actions.push({
      type: 'set_flag', key, value, executed: false, dryRun: true,
      message: `${key}=${value} (dry-run — apply + remoteActions 활성화 시 실행)`,
    });
  }
}
