/**
 * rollback: actions.mjs
 * 허용된 조치: 롤백 후보 알림, rollbackWebhook 호출 (G4 + apply + remoteActions)
 * 금지: 코드 변경, 데이터 마이그레이션, 배포 파이프라인 직접 조작
 */

export async function runActions(skillSignals, context) {
  const { config, profile, grade, apply } = context;
  const opts = profile?.skillOptions?.['rollback'] ?? {};
  const actions = [];

  const candidate = skillSignals.find(
    s => s.id.endsWith(':rollback-candidate') && s.status === 'fail'
  );

  if (!candidate) return actions;

  const tag = candidate.tag ?? '(태그 없음)';
  const releasedAt = candidate.releasedAt ?? '(날짜 없음)';

  // 조치 1: 알림 (항상)
  actions.push({
    type: 'rollback_candidate',
    message: `[rollback] 롤백 후보 활성화 — ${grade} 등급\n  복구 기준: tag=${tag} (${releasedAt})\n  자동 롤백은 apply 모드 + remoteActions 활성화 시 실행됩니다.`,
    executed: true,
  });

  // 조치 2: rollbackWebhook 호출 (엄격한 조건 하에서만)
  const rollbackWebhook =
    opts.rollbackWebhook ??
    config.remoteActions?.rollbackWebhook ??
    null;

  const remoteEnabled =
    apply &&
    config.remoteActions?.enabled &&
    process.env.NURION_REMOTE_ACTIONS === '1' &&
    rollbackWebhook;

  if (remoteEnabled) {
    try {
      const res = await fetch(rollbackWebhook, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'rollback',
          tag,
          releasedAt,
          grade,
          platformId: config.platformId,
          skill: 'rollback',
          reason: `${grade} 등급 조건 충족 — 롤백 자동 실행`,
        }),
      });
      actions.push({
        type: 'rollback',
        tag,
        executed: res.ok,
        httpStatus: res.status,
        message: res.ok
          ? `롤백 webhook 실행 완료 — tag: ${tag}`
          : `롤백 webhook 실패 (HTTP ${res.status})`,
      });
    } catch (error) {
      actions.push({
        type: 'rollback',
        tag,
        executed: false,
        error: String(error?.message || error),
        message: '롤백 webhook 호출 오류',
      });
    }
  } else {
    actions.push({
      type: 'rollback',
      tag,
      executed: false,
      dryRun: true,
      message: `롤백 대상: ${tag} (dry-run — apply + NURION_REMOTE_ACTIONS=1 + rollbackWebhook 설정 시 실행)`,
    });
  }

  return actions;
}
