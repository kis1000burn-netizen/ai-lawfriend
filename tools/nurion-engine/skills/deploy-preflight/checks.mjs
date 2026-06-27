/**
 * deploy-preflight: checks.mjs
 * 빌드 출력·smoke probe·현재 G등급을 검사합니다.
 */
import path from 'node:path';
import fs from 'node:fs/promises';

async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    return { ok: res.ok, status: res.status, latencyMs: Date.now() - started };
  } catch (error) {
    return { ok: false, status: 0, latencyMs: Date.now() - started, error: String(error?.message || error) };
  } finally {
    clearTimeout(timer);
  }
}

export async function runChecks(context) {
  const { config, profile, signals = [], ROOT, isoNow } = context;
  const results = [];
  const opts = profile?.skillOptions?.['deploy-preflight'] ?? {};

  // ── 1. 빌드 출력 디렉토리 확인 ──────────────────────────────────────────────
  const buildDirs = opts.buildDirs ?? ['dist', '_site', 'build', 'out', 'public'];
  let buildDirFound = false;
  let foundDir = '';
  for (const dir of buildDirs) {
    try {
      const stat = await fs.stat(path.join(ROOT, dir));
      if (stat.isDirectory()) { buildDirFound = true; foundDir = dir; break; }
    } catch { /* 없으면 다음 */ }
  }
  results.push({
    id: 'build-output',
    status: buildDirFound ? 'pass' : 'fail',
    critical: true,
    message: buildDirFound
      ? `빌드 출력 디렉토리 확인: ${foundDir}/`
      : `빌드 출력 디렉토리 없음 (${buildDirs.join(', ')} 중 없음) — 빌드 미실행 또는 경로 오류`,
  });

  // ── 2. index.html 존재 확인 ─────────────────────────────────────────────────
  if (buildDirFound) {
    const indexPath = path.join(ROOT, foundDir, 'index.html');
    let indexExists = false;
    try { await fs.access(indexPath); indexExists = true; } catch { /* 없음 */ }
    results.push({
      id: 'index-html',
      status: indexExists ? 'pass' : 'fail',
      critical: true,
      message: indexExists ? `${foundDir}/index.html 존재` : `${foundDir}/index.html 없음 — 빌드 결과 불완전`,
    });
  }

  // ── 3. smoke probe 실행 ─────────────────────────────────────────────────────
  const smokeProbes = (config.probes ?? []).filter(p =>
    p.type === 'http' && (p.smoke === true || (opts.smokeAll !== false && p.critical))
  );
  for (const probe of smokeProbes) {
    const res = await fetchWithTimeout(probe.url, probe.timeoutMs ?? 5000);
    results.push({
      id: `smoke:${probe.id}`,
      status: res.ok ? 'pass' : 'fail',
      critical: !!probe.critical,
      message: res.ok
        ? `smoke OK — ${probe.url} (HTTP ${res.status}, ${res.latencyMs}ms)`
        : `smoke FAIL — ${probe.url} (HTTP ${res.status}${res.error ? ', ' + res.error : ''})`,
      latencyMs: res.latencyMs,
    });
  }

  // ── 4. 현재 G등급 기반 배포 가능 여부 판단 ──────────────────────────────────
  const gradeSignal = signals.find(s => s.grade) ?? null;
  const currentGrade = context.grade ?? null;
  if (currentGrade === 'G4') {
    results.push({
      id: 'grade-gate',
      status: 'fail',
      critical: true,
      message: 'G4 등급 — 롤백 우선, 신규 배포 금지',
    });
  } else if (currentGrade === 'G3') {
    results.push({
      id: 'grade-gate',
      status: 'warn',
      critical: false,
      message: 'G3 등급 — 핵심 장애 해소 후 배포 권고',
    });
  } else if (currentGrade) {
    results.push({
      id: 'grade-gate',
      status: 'pass',
      critical: false,
      message: `${currentGrade} 등급 — 배포 진행 가능`,
    });
  }

  return results;
}
