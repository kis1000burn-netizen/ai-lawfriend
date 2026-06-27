/**
 * vendor-flow: actions.mjs
 * 허용된 조치: 격리 알림, notify
 * 금지: 업체 데이터 수정·삭제, 결제 변경
 */

export async function runActions(skillSignals, context) {
  const actions = [];
  const endpointFails = skillSignals.filter(s => s.id.includes(':endpoint:') && s.status === 'fail');
  const fieldFails    = skillSignals.filter(s => s.id.includes(':fields:')   && s.status === 'fail');

  if (endpointFails.length === 0 && fieldFails.length === 0) return actions;

  const issues = [...endpointFails, ...fieldFails].map(s => `  • ${s.message}`).join('\n');

  actions.push({
    type: 'notify',
    message: `[vendor-flow] 업체 데이터 이상 감지\n${issues}\n\n업체 데이터 수정은 운영자가 직접 처리하세요.`,
    executed: true,
  });

  if (fieldFails.length > 0) {
    actions.push({
      type: 'quarantine-notice',
      message: `[vendor-flow] 필수 필드 누락 업체 격리 필요 — 관리자 검토 요청`,
      executed: true,
    });
  }

  return actions;
}
