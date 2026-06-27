/**
 * rollback: checks.mjs
 * LAST_RELEASE.json 유효성, rollbackWebhook 설정, G4 등급 조건을 확인합니다.
 */
import path from 'node:path';

export async function runChecks(context) {
  const { config, profile, grade, ROOT, readJson } = context;
  const opts = profile?.skillOptions?.['rollback'] ?? {};
  const results = [];

  // ── 1. LAST_RELEASE.json 확인 ─────────────────────────────────────────────
  const releaseFile = config.releaseTagFile ?? 'release/LAST_RELEASE.json';
  const releasePath = path.join(ROOT, releaseFile);
  const release = await readJson(releasePath, null);

  if (!release) {
    results.push({
      id: 'release-file',
      status: 'warn',
      critical: false,
      message: `롤백 기준 파일 없음 — ${releaseFile} (배포 시 생성 필요)`,
    });
    return results;
  }

  const hasTag        = !!release.tag;
  const hasReleasedAt = !!release.releasedAt;

  results.push({
    id: 'release-file',
    status: (hasTag && hasReleasedAt) ? 'pass' : 'fail',
    critical: false,
    message: (hasTag && hasReleasedAt)
      ? `롤백 기준 확인 — tag: ${release.tag}, releasedAt: ${release.releasedAt}`
      : `LAST_RELEASE.json 불완전 — tag: ${release.tag ?? '없음'}, releasedAt: ${release.releasedAt ?? '없음'}`,
    tag: release.tag,
    releasedAt: release.releasedAt,
  });

  // ── 2. rollbackWebhook 설정 확인 ─────────────────────────────────────────
  const rollbackWebhook = opts.rollbackWebhook ?? config.remoteActions?.rollbackWebhook ?? null;
  results.push({
    id: 'webhook-configured',
    status: rollbackWebhook ? 'pass' : 'warn',
    critical: false,
    message: rollbackWebhook
      ? '롤백 webhook 설정 확인'
      : '롤백 webhook 미설정 — 자동 롤백 불가 (skillOptions.rollback.rollbackWebhook 필요)',
  });

  // ── 3. G4 등급 시 롤백 후보 신호 ─────────────────────────────────────────
  const requireGrade = opts.requireGrade ?? 'G4';
  const gradeRank = { G0: 0, G1: 1, G2: 2, G3: 3, G4: 4 };
  const currentRank = gradeRank[grade] ?? 0;
  const requireRank = gradeRank[requireGrade] ?? 4;

  if (currentRank >= requireRank) {
    results.push({
      id: 'rollback-candidate',
      status: 'fail',
      critical: true,
      message: `${grade} 등급 — 롤백 후보 활성화 (기준: ${requireGrade} 이상)`,
      tag: release.tag,
      releasedAt: release.releasedAt,
    });
  } else {
    results.push({
      id: 'rollback-candidate',
      status: 'pass',
      critical: false,
      message: `${grade ?? 'G?'} 등급 — 롤백 조건 미충족 (정상 범위)`,
    });
  }

  return results;
}
