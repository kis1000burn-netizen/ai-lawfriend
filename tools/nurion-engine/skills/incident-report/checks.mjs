/**
 * incident-report: checks.mjs
 * 활성 인시던트, 아카이브 이벤트 수, 등급 조건을 확인합니다.
 */
import path from 'node:path';
import fs from 'node:fs/promises';

export async function runChecks(context) {
  const { config, grade, ROOT, readJson } = context;
  const results = [];

  // ── 1. 현재 등급 확인 (G2 이상만 보고서 생성 의미 있음) ────────────────────
  const gradeRank = { G0: 0, G1: 1, G2: 2, G3: 3, G4: 4 };
  const currentRank = gradeRank[grade] ?? 0;

  if (currentRank < 2) {
    results.push({
      id: 'grade-sufficient',
      status: 'pass',
      critical: false,
      message: `${grade ?? 'G?'} 등급 — 인시던트 보고서 불필요 (G2 이상 시 생성)`,
    });
    return results;
  }

  results.push({
    id: 'grade-sufficient',
    status: 'fail',
    critical: false,
    message: `${grade} 등급 — 인시던트 보고서 생성 조건 충족`,
    grade,
  });

  // ── 2. 활성 인시던트 확인 ────────────────────────────────────────────────────
  const activeIncidentPath = path.join(ROOT, '_nurion_events', 'active-incident.json');
  const incident = await readJson(activeIncidentPath, null);

  results.push({
    id: 'active-incident',
    status: incident ? 'fail' : 'warn',
    critical: false,
    message: incident
      ? `활성 인시던트 존재 — incidentId: ${incident.incidentId}, openedAt: ${incident.openedAt}`
      : '활성 인시던트 없음 — 보고서 생성 시 수동 인시던트 ID 사용',
    incidentId: incident?.incidentId,
    openedAt: incident?.openedAt,
    grade: incident?.grade,
  });

  // ── 3. 아카이브 이벤트 수 확인 ──────────────────────────────────────────────
  const archiveDir = path.join(ROOT, '_nurion_events', 'archive');
  let archiveCount = 0;
  try {
    const files = await fs.readdir(archiveDir);
    archiveCount = files.filter(f => f.endsWith('.ndjson')).length;
  } catch { /* 디렉토리 없음 */ }

  results.push({
    id: 'archive-events',
    status: archiveCount >= 5 ? 'fail' : 'warn',
    critical: false,
    message: archiveCount >= 5
      ? `아카이브 이벤트 충분 (${archiveCount}개) — 보고서 생성 가능`
      : `아카이브 이벤트 부족 (${archiveCount}개, 최소 5개 권고) — 보고서 근거 부족`,
    archiveCount,
  });

  return results;
}
