/** finance-settlement/revenue-leak-watch: actions.mjs */
export async function runActions(skillSignals, context) {
  const actions = [];
  const fails = skillSignals.filter(s => s.status === 'fail');
  if (fails.length === 0) return actions;
  actions.push({ type: fails.some(s => s.critical) ? 'escalate' : 'notify', message: `[revenue-leak-watch] 수익 이상 감지\n${fails.map(s=>`  • ${s.message}`).join('\n')}\n\n수수료·환불 설정 수정은 운영자가 직접 처리하세요.`, executed: true });
  return actions;
}
