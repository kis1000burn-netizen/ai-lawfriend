/**
 * 누리온 스킬 레지스트리 (v1.4)
 *
 * 플랫폼 프로필에 선언된 enabledSkills 목록을 기반으로
 * 각 스킬의 checks.mjs / actions.mjs 를 동적으로 로드하고 실행합니다.
 *
 * 설계 원칙:
 *  - core/ (엔진)  : 판단·안전정책 담당
 *  - skills/       : 실제 업무 기능 담당
 *  - 스킬은 서로 독립적이며, 엔진 코어를 수정하지 않고 꽂아 쓸 수 있습니다.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { isoNow, readJson, writeJson, ROOT } from '../scripts/nurion-utils.mjs';

const GRADE_RANK = Object.freeze({ G0: 0, G1: 1, G2: 2, G3: 3, G4: 4 });

export function shouldGateSkillAction(skillId, context = {}) {
  const policy = context.profile?.autoActionPolicy ?? {};
  const grade = context.grade ?? 'G0';
  const maxGrade = policy.maxGradeForAutoAction ?? 'G4';
  const requiresApproval = new Set(policy.requireHumanApproval ?? []);
  const gradeBlocked = (GRADE_RANK[grade] ?? 0) > (GRADE_RANK[maxGrade] ?? 4);
  const skillBlocked = requiresApproval.has(skillId);

  if (!context.apply || (!gradeBlocked && !skillBlocked)) {
    return { gated: false };
  }

  const reasons = [];
  if (gradeBlocked) reasons.push(`등급 ${grade}가 자동조치 허용 상한 ${maxGrade}를 초과`);
  if (skillBlocked) reasons.push(`스킬 ${skillId}는 사람 승인 필요`);
  return { gated: true, reasons };
}

// ─── 플랫폼 프로필 ────────────────────────────────────────────────────────────

export async function loadPlatformProfile(platformId) {
  const profilePath = path.join(ROOT, 'platform-profiles', platformId, 'profile.json');
  try {
    const raw = await readFile(profilePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    throw new Error(
      `플랫폼 프로필이 없습니다: platform-profiles/${platformId}/profile.json\n` +
      `platform-profiles/future-template/profile.json 을 복사해 platformId를 변경하세요.`
    );
  }
}

// ─── 스킬 로더 ────────────────────────────────────────────────────────────────

async function loadSkillModule(skillId, filename) {
  const skillPath = path.join(ROOT, 'skills', skillId, filename);
  const url = pathToFileURL(skillPath).href;
  try {
    return await import(url);
  } catch (error) {
    throw new Error(`스킬 모듈 로드 실패 [${skillId}/${filename}]: ${error.message}`);
  }
}

// ─── 검사 실행 ────────────────────────────────────────────────────────────────

/**
 * 플랫폼 프로필의 enabledSkills 에 대해 checks.mjs 를 순서대로 실행합니다.
 *
 * @param {string[]} enabledSkills
 * @param {object}   context  - config, profile, signals, apply, ROOT, isoNow, readJson, writeJson
 * @returns {Promise<SkillCheckResult[]>}
 */
export async function runSkillChecks(enabledSkills, context) {
  const allResults = [];

  for (const skillId of enabledSkills) {
    let mod;
    try {
      mod = await loadSkillModule(skillId, 'checks.mjs');
    } catch (loadError) {
      allResults.push({
        id: `${skillId}:_load-error`,
        skill: skillId,
        status: 'warn',
        critical: false,
        message: `checks.mjs 로드 실패: ${loadError.message}`,
        observedAt: isoNow(),
      });
      continue;
    }

    let results;
    try {
      results = await mod.runChecks({ ...context, skillId });
    } catch (runError) {
      results = [{
        id: `${skillId}:_run-error`,
        skill: skillId,
        status: 'fail',
        critical: false,
        message: `runChecks 실행 오류: ${runError.message}`,
        observedAt: isoNow(),
      }];
    }

    // id에 스킬 prefix 보장, skill 필드 주입
    for (const r of results ?? []) {
      allResults.push({
        observedAt: isoNow(),
        ...r,
        id: r.id.startsWith(`${skillId}:`) ? r.id : `${skillId}:${r.id}`,
        skill: skillId,
      });
    }
  }

  return allResults;
}

// ─── 조치 실행 ────────────────────────────────────────────────────────────────

/**
 * 검사 결과와 등급을 기반으로 허용된 자동조치를 실행합니다.
 * 각 스킬의 actions.mjs 는 자신에 해당하는 신호만 받습니다.
 *
 * @param {string[]}          enabledSkills
 * @param {SkillCheckResult[]} checkResults
 * @param {object}             context  - config, profile, grade, apply, ROOT, isoNow, readJson, writeJson
 * @returns {Promise<SkillActionResult[]>}
 */
export async function runSkillActions(enabledSkills, checkResults, context) {
  const allActions = [];

  for (const skillId of enabledSkills) {
    const gate = shouldGateSkillAction(skillId, context);
    const actionContext = gate.gated ? { ...context, apply: false, approvalRequired: true } : context;

    let mod;
    try {
      mod = await loadSkillModule(skillId, 'actions.mjs');
    } catch {
      continue; // 액션 모듈 없으면 건너뜀
    }

    // 해당 스킬의 신호만 전달
    const skillSignals = checkResults.filter(r => r.skill === skillId);

    let results;
    try {
      results = await mod.runActions(skillSignals, { ...actionContext, skillId });
    } catch (runError) {
      results = [{
        skill: skillId,
        type: 'error',
        message: `runActions 실행 오류: ${runError.message}`,
        executed: false,
      }];
    }

    if (gate.gated && (results?.length ?? 0) > 0) {
      allActions.push({
        skill: skillId,
        type: 'approval_required',
        executed: false,
        dryRun: true,
        approvalRequired: true,
        reasons: gate.reasons,
        message: `자동조치 차단 — ${gate.reasons.join(', ')}`,
      });
    }

    for (const r of results ?? []) {
      allActions.push({
        ...r,
        skill: r.skill ?? skillId,
        approvalRequired: r.approvalRequired ?? gate.gated,
      });
    }
  }

  return allActions;
}

// ─── 통합 스킬 파이프라인 ──────────────────────────────────────────────────────

/**
 * 플랫폼 프로필을 읽어 검사 → 신호 병합 → 조치까지 한 번에 실행합니다.
 *
 * @param {object} engineContext  - config, signals(기존 수집 신호), grade, apply, ROOT
 * @returns {Promise<{skillSignals, skillActions, profile}>}
 */
export async function runSkillPipeline(engineContext) {
  const { config, signals = [], grade, apply = false } = engineContext;

  const platformId = config.platformId;
  let profile;
  try {
    profile = await loadPlatformProfile(platformId);
  } catch {
    // 프로필 없으면 스킬 없이 진행 (v1.3 하위호환)
    return { skillSignals: [], skillActions: [], profile: null };
  }

  const enabledSkills = profile.enabledSkills ?? [];
  if (enabledSkills.length === 0) {
    return { skillSignals: [], skillActions: [], profile };
  }

  const sharedContext = {
    config,
    profile,
    signals,      // 기존 collector 신호 참조용
    grade,
    apply,
    ROOT,
    isoNow,
    readJson,
    writeJson,
  };

  const skillSignals = await runSkillChecks(enabledSkills, sharedContext);
  const skillActions = await runSkillActions(
    enabledSkills,
    skillSignals,
    { ...sharedContext, grade }
  );

  return { skillSignals, skillActions, profile };
}
