/**
 * finance-settlement/tax-invoice-watch: actions.mjs
 * 허용: 기한 알림. 금지: 세금계산서 자동 발행·확정·수정 발행.
 */
export async function runActions(skillSignals, context) {
  const actions = [];
  const issues = skillSignals.filter(s => s.status === 'fail' || s.status === 'warn');
  if (issues.length === 0) return actions;
  const lates = issues.filter(s => s.financeType === 'finance:tax-invoice-late');
  const type = lates.length > 0 ? 'escalate' : 'notify';
  actions.push({
    type,
    message: `[tax-invoice-watch] 세금계산서 이상 감지\n${issues.map(s => `  • ${s.message}`).join('\n')}\n\n⚠️ 세금계산서 발행·수정은 운영자가 직접 처리하세요.`,
    executed: true,
  });
  return actions;
}
