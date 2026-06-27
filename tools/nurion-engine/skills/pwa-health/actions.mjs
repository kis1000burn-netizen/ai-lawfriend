/**
 * pwa-health: actions.mjs
 * 허용된 조치: 알림(notify)
 * 금지: manifest·sw.js 내용 수정, 파일 재업로드
 */

export async function runActions(skillSignals, context) {
  const actions = [];
  const criticalFails = skillSignals.filter(s => s.status === 'fail' && s.critical);
  const warnings      = skillSignals.filter(s => s.status === 'warn');

  if (criticalFails.length === 0 && warnings.length === 0) return actions;

  const failList = criticalFails.map(s => `  ❌ ${s.id}: ${s.message}`).join('\n');
  const warnList = warnings.map(s => `  ⚠️  ${s.id}: ${s.message}`).join('\n');
  const parts = [failList, warnList].filter(Boolean).join('\n');

  actions.push({
    type: 'notify',
    message: `[pwa-health] PWA 검사 이상 감지\n${parts}`,
    executed: true,
  });

  return actions;
}
