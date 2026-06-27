/** finance-settlement/approval-matrix: actions.mjs */
export async function runActions(skillSignals, context) {
  const actions = [];
  const criticals = skillSignals.filter(s => s.status === 'fail' && s.critical);
  const warns     = skillSignals.filter(s => s.status === 'warn');
  if (criticals.length === 0 && warns.length === 0) return actions;
  if (criticals.length > 0) {
    actions.push({ type: 'escalate', message: `[approval-matrix] 미승인 고액·예외 지급 대기\n${criticals.map(s=>`  • ${s.message}`).join('\n')}\n\n⚠️ 승인 없이 지급 실행 절대 금지`, executed: true });
  } else {
    actions.push({ type: 'notify', message: `[approval-matrix] 승인 대기 ${warns.length}건\n${warns.map(s=>`  • ${s.message}`).join('\n')}`, executed: true });
  }
  return actions;
}
