/**
 * nurion-skill-run.mjs  — 누리온 엔진 v1.4 통합 실행 엔트리포인트
 *
 * "npm run nurion" 의 기본 실행 대상입니다.
 * 코어 신호 + 스킬 검사를 모두 합친 뒤 최종 G등급을 한 번에 판단하고,
 * 그 등급을 기준으로 자동조치를 실행합니다.
 *
 * ─ 올바른 실행 순서 ──────────────────────────────────────────────────────────
 *  1. 설정·릴리스 파일 로드
 *  2. 코어 신호 수집 (collector probes)
 *  3. 스킬 검사 실행 (checks.mjs × enabledSkills)
 *  4. 코어 + 스킬 신호 병합
 *  5. 최종 G등급 계산  ← 스킬 신호까지 반영된 단일 판단
 *  6. 최종 보고서 아카이브
 *  7. 자동조치 실행  ← 최종 등급 기준
 *  8. 결과 출력
 *
 * 이 순서가 보장되어야 SLO, P-0, GAS, 접수 흐름 등 모든 신호가
 * 동일한 판단 체계 안에서 움직입니다.
 *
 * 사용법:
 *   node scripts/nurion-skill-run.mjs
 *   node scripts/nurion-skill-run.mjs --apply
 */
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { collectSignals, loadConfig } from './nurion-collector.mjs';
import { archiveRun, loadLastReport } from './nurion-state.mjs';
import { evaluatePolicy } from './nurion-policy.mjs';
import { parseArgs, ROOT, isMainScript } from './nurion-utils.mjs';
import { deriveGrade } from './nurion-engine.mjs';
import {
  loadPlatformProfile,
  runSkillChecks,
  runSkillActions,
} from '../core/skill-registry.mjs';

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

async function loadRelease(config) {
  try {
    const p = path.join(ROOT, config.releaseTagFile ?? 'release/LAST_RELEASE.json');
    return JSON.parse(await readFile(p, 'utf8'));
  } catch { return null; }
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  const args  = parseArgs(process.argv);
  const apply = args.has('--apply');

  // ── 1. 설정·릴리스·이전 보고서 로드 ─────────────────────────────────────
  const config         = await loadConfig();
  const release        = await loadRelease(config);
  const previousReport = await loadLastReport(config.platformId);

  // ── 2. 코어 신호 수집 ─────────────────────────────────────────────────────
  const { observedAt, signals: coreSignals } = await collectSignals(config);

  // ── 3. 플랫폼 프로필 로드 + 스킬 검사 ────────────────────────────────────
  let profile       = null;
  let skillSignals  = [];
  let enabledSkills = [];

  try {
    profile = await loadPlatformProfile(config.platformId);
    enabledSkills = profile.enabledSkills ?? [];
  } catch {
    // 프로필 없으면 코어 전용으로 진행 (v1.3 하위 호환)
  }

  if (enabledSkills.length > 0) {
    // 스킬 검사에는 코어 신호와 예비 등급(코어 기준)을 전달.
    // 단, 자동조치는 아직 실행하지 않음 — 최종 등급 계산 후 실행.
    const coreGrade = deriveGrade(coreSignals, previousReport, release?.releasedAt ?? null).grade;

    skillSignals = await runSkillChecks(enabledSkills, {
      config,
      profile,
      signals: coreSignals,
      grade: coreGrade,    // 스킬 내부 판단 참조용 (예비 등급)
      apply,
      ROOT,
    });
  }

  // ── 4. 코어 + 스킬 신호 병합 ─────────────────────────────────────────────
  const allSignals = [...coreSignals, ...skillSignals];

  // ── 5. 최종 G등급 계산 (모든 신호 포함) ──────────────────────────────────
  const finalDerived = deriveGrade(allSignals, previousReport, release?.releasedAt ?? null);
  const finalGrade   = finalDerived.grade;

  // ── 6. 최종 보고서 아카이브 ──────────────────────────────────────────────
  const report = {
    schemaVersion: '1.5',
    platformId:    config.platformId,
    platformName:  config.platformName,
    observedAt,
    grade:         finalGrade,
    reason:        finalDerived.reason,
    signals:       allSignals,
    scope: {
      coverage:    'nurion-v1.5 (코어+스킬+Finance 통합)',
      disclaimer:  '플랫폼 전체 무결성 보장 아님',
      skillsRun:   enabledSkills,
    },
  };

  await archiveRun(report, config.retentionDays ?? config.historyDays ?? 7);

  // ── 7. 자동조치 실행 (최종 등급 기준) ────────────────────────────────────
  // 7-a. 코어 정책 (기존 policy.mjs)
  const corePolicy = await evaluatePolicy(report, config, { apply, profile });

  // 7-b. 스킬 자동조치 (최종 등급을 context에 주입)
  let skillActions = [];
  if (enabledSkills.length > 0) {
    skillActions = await runSkillActions(enabledSkills, skillSignals, {
      config,
      profile,
      signals: allSignals,
      grade: finalGrade,   // ← 최종 등급 기준으로 조치
      apply,
      ROOT,
    });
  }

  // ── 8. 결과 출력 ─────────────────────────────────────────────────────────
  const result = {
    report,
    corePolicy,
    skillPipeline: {
      platformId:   config.platformId,
      profile:      profile
        ? { enabledSkills: profile.enabledSkills, riskLevel: profile.riskLevel }
        : null,
      mode:         apply ? 'apply' : 'dryRun',
      skillSignals,
      skillActions,
      summary: {
        skillsRun:       enabledSkills.length,
        coreSignals:     coreSignals.length,
        skillChecks:     skillSignals.length,
        totalSignals:    allSignals.length,
        failCount:       allSignals.filter(s => s.status === 'fail').length,
        warnCount:       allSignals.filter(s => s.status === 'warn').length,
        finalGrade,
        actionsExecuted: skillActions.filter(a => a.executed === true).length,
      },
    },
  };

  console.log(JSON.stringify(result, null, 2));

  if (['G3', 'G4'].includes(finalGrade)) process.exitCode = 2;
}

if (isMainScript(import.meta.url)) {
  main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
}
