/**
 * payment-boundary: actions.mjs
 *
 * 허용된 자동조치:
 *  ✅ 접수 차단 알림 (notify + escalate)
 *  ✅ PAYMENT_BLOCK=1 플래그 (G3 이상, apply 모드)
 *
 * 절대 금지 (이 파일에서 절대 구현하지 않음):
 *  ❌ 결제 금액 변경
 *  ❌ 환불 처리
 *  ❌ 가격 수정
 *  ❌ 결제 승인·취소 API 호출
 */

const BLOCKED_ACTION_TYPES = [
  'refund', 'change_price', 'update_payment', 'cancel_payment', 'approve_payment',
];

export async function runActions(skillSignals, context) {
  const { config, grade, apply } = context;
  const actions = [];

  const p0Fail = skillSignals.find(s => s.id.endsWith(':p0-signal') && s.status === 'fail');
  const authFail = skillSignals.find(s => s.id.includes(':auth-gate:') && s.status === 'fail');
  const hasViolation = !!(p0Fail || authFail);

  if (!hasViolation) return actions;

  const violations = skillSignals
    .filter(s => s.status === 'fail')
    .map(s => `  • ${s.id}: ${s.message}`)
    .join('\n');

  // 조치 1: escalate 알림 (항상)
  actions.push({
    type: 'escalate',
    message: `[payment-boundary] P-0 결제 경계 위반 감지\n${violations}\n\n⚠️ 결제 변경·환불·가격 수정은 운영자가 직접 확인 후 처리하세요.`,
    executed: true,
  });

  // 조치 2: PAYMENT_BLOCK 플래그 (G3 이상에서만)
  const gradeBlocks = ['G3', 'G4'];
  if (grade && gradeBlocks.includes(grade)) {
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
            key: 'PAYMENT_BLOCK',
            value: '1',
            platformId: config.platformId,
            skill: 'payment-boundary',
            reason: 'P-0 결제 경계 위반',
          }),
        });
        actions.push({
          type: 'set_flag',
          key: 'PAYMENT_BLOCK',
          value: '1',
          executed: res.ok,
          httpStatus: res.status,
          message: res.ok ? 'PAYMENT_BLOCK=1 전송 완료' : `전송 실패 (HTTP ${res.status})`,
        });
      } catch (error) {
        actions.push({
          type: 'set_flag',
          key: 'PAYMENT_BLOCK',
          value: '1',
          executed: false,
          error: String(error?.message || error),
          message: 'PAYMENT_BLOCK 전송 오류',
        });
      }
    } else {
      actions.push({
        type: 'set_flag',
        key: 'PAYMENT_BLOCK',
        value: '1',
        executed: false,
        dryRun: true,
        message: `PAYMENT_BLOCK=1 (dry-run — ${grade} 등급, apply + remoteActions 활성화 시 실행)`,
      });
    }
  }

  // 안전 보호: 금지 액션 요청 시 차단 기록
  for (const blocked of BLOCKED_ACTION_TYPES) {
    actions.push({
      type: 'blocked',
      blockedAction: blocked,
      executed: false,
      message: `[payment-boundary] '${blocked}' 조치는 AI 자동 실행 금지 — 운영자 직접 수행 필요`,
    });
  }

  return actions;
}
