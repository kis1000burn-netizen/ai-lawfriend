/** finance-settlement/vendor-settlement: actions.mjs */
export async function runActions(skillSignals, context) {
  const actions = [];
  const issues = skillSignals.filter(s => s.status !== 'pass');
  if (issues.length === 0) return actions;
  actions.push({ type: 'notify', message: `[vendor-settlement] 업체 프로필 이상\n${issues.map(s => `  • ${s.message}`).join('\n')}\n\n업체 데이터 수정은 운영자가 직접 처리하세요.`, executed: true });
  return actions;
}
