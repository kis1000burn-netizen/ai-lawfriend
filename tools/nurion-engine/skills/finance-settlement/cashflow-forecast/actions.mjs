/** finance-settlement/cashflow-forecast: actions.mjs */
export async function runActions(skillSignals, context) {
  const actions = [];
  const risks = skillSignals.filter(s => s.status === 'fail' || s.status === 'warn');
  if (risks.length === 0) return actions;
  actions.push({ type: risks.some(s=>s.critical) ? 'escalate' : 'notify', message: `[cashflow-forecast] 현금흐름 이상\n${risks.map(s=>`  • ${s.message}`).join('\n')}\n\n자금 조달·지급 일정 조정은 운영자가 직접 처리하세요.`, executed: true });
  return actions;
}
