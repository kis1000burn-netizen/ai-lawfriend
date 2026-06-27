/**
 * finance-settlement/payout-control: actions.mjs
 * 허용: PAYOUT_BLOCK 플래그, 알림·에스컬레이션
 * 금지: 계좌번호 변경, 실제 송금, 지급 취소 실행
 */
export async function runActions(skillSignals, context) {
  const { config, grade, apply } = context;
  const actions = [];
  const criticalFails = skillSignals.filter(s => s.status === 'fail' && s.critical);
  if (criticalFails.length === 0) return actions;
  actions.push({
    type: 'escalate',
    message: `[payout-control] 지급 무결성 위반 감지\n${criticalFails.map(s => `  • ${s.message}`).join('\n')}\n\n⚠️ 계좌변경·송금·지급취소는 운영자가 직접 처리하세요.`,
    executed: true,
  });
  const remoteEnabled = apply && config.remoteActions?.enabled && process.env.NURION_REMOTE_ACTIONS === '1' && config.remoteActions?.actionWebhook;
  if (remoteEnabled) {
    try {
      const res = await fetch(config.remoteActions.actionWebhook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'set_flag', key: 'PAYOUT_BLOCK', value: '1', platformId: config.platformId, skill: 'finance-settlement/payout-control', reason: '지급 무결성 위반' }) });
      actions.push({ type: 'set_flag', key: 'PAYOUT_BLOCK', value: '1', executed: res.ok, httpStatus: res.status, message: res.ok ? 'PAYOUT_BLOCK=1 전송 완료' : `전송 실패 (HTTP ${res.status})` });
    } catch (err) { actions.push({ type: 'set_flag', key: 'PAYOUT_BLOCK', value: '1', executed: false, error: String(err.message) }); }
  } else {
    actions.push({ type: 'set_flag', key: 'PAYOUT_BLOCK', value: '1', executed: false, dryRun: true, message: `PAYOUT_BLOCK=1 (dry-run — ${grade} 등급)` });
  }
  return actions;
}
