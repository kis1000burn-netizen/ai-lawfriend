import {
  CASE_LAWYER_MATCHING_FIXTURES,
  CASE_LAWYER_MATCHING_SERVICE_MARKER,
  CASE_LAWYER_MATCHING_STEPS,
  type CaseLawyerMatchingFixture,
  type CaseLawyerMatchingFixtureKey,
} from "./case-lawyer-matching.registry";
import type {
  CaseLawyerMatchingProfile,
  CaseLawyerMatchingStep,
  CaseLawyerMatchingWorkflowResult,
} from "./case-lawyer-matching.schema";

export { CASE_LAWYER_MATCHING_SERVICE_MARKER };

type ResolveCaseLawyerMatchingProfileInput = {
  caseId: string;
  category?: string | null;
  mappedCaseType?: string | null;
  gongbuhoCode?: string | null;
};

function normalize(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

function findFixtureByCaseId(caseId: string): CaseLawyerMatchingFixture | null {
  return (
    Object.values(CASE_LAWYER_MATCHING_FIXTURES).find(
      (fixture) => fixture.caseId === caseId,
    ) ?? null
  );
}

function findFixtureBySignals(input: ResolveCaseLawyerMatchingProfileInput) {
  const byCaseId = findFixtureByCaseId(input.caseId);
  if (byCaseId) {
    return byCaseId;
  }

  const category = normalize(input.category);
  const mappedCaseType = normalize(input.mappedCaseType);
  const gongbuhoCode = normalize(input.gongbuhoCode);

  return (
    Object.values(CASE_LAWYER_MATCHING_FIXTURES).find((fixture) => {
      const fixtureCategory = normalize(fixture.category);
      const fixtureMappedCaseType = normalize(fixture.mappedCaseType);
      const fixtureGongbuhoCode = normalize(fixture.gongbuhoCode);

      return (
        (category.length > 0 && category === fixtureCategory) ||
        (mappedCaseType.length > 0 && mappedCaseType === fixtureMappedCaseType) ||
        (gongbuhoCode.length > 0 && gongbuhoCode === fixtureGongbuhoCode)
      );
    }) ?? null
  );
}

export function resolveCaseLawyerMatchingProfile(
  input: ResolveCaseLawyerMatchingProfileInput,
): CaseLawyerMatchingProfile {
  const fixture = findFixtureBySignals(input);

  if (fixture) {
    return {
      fixtureKey: fixture.fixtureKey,
      caseId: input.caseId,
      category: fixture.category,
      mappedCaseType: fixture.mappedCaseType,
      gongbuhoCode: fixture.gongbuhoCode,
      practiceAreaLabels: [...fixture.practiceAreaLabels],
      matchingRationale: fixture.matchingRationale,
    };
  }

  return {
    fixtureKey: null,
    caseId: input.caseId,
    category: input.category?.trim() || null,
    mappedCaseType: input.mappedCaseType?.trim() || null,
    gongbuhoCode: input.gongbuhoCode?.trim() || null,
    practiceAreaLabels: [],
    matchingRationale:
      "등록된 fixture 프로필이 없어 일반 변호사 배정 기준으로 검토합니다.",
  };
}

function buildStep(
  stepId: (typeof CASE_LAWYER_MATCHING_STEPS)[number]["stepId"],
  status: CaseLawyerMatchingStep["status"],
  summary: string,
): CaseLawyerMatchingStep {
  const definition = CASE_LAWYER_MATCHING_STEPS.find((step) => step.stepId === stepId);

  return {
    stepId,
    label: definition?.label ?? stepId,
    status,
    summary,
  };
}

export function buildCaseLawyerMatchingWorkflow(
  profile: CaseLawyerMatchingProfile,
): CaseLawyerMatchingWorkflowResult {
  const fixture = profile.fixtureKey
    ? CASE_LAWYER_MATCHING_FIXTURES[profile.fixtureKey]
    : null;
  const hasPracticeAreas = profile.practiceAreaLabels.length > 0;
  const assignmentReady = Boolean(fixture && hasPracticeAreas);

  const steps: CaseLawyerMatchingStep[] = [
    buildStep(
      "IDENTIFY_CASE_PROFILE",
      profile.fixtureKey ? "READY" : "PENDING",
      profile.fixtureKey
        ? `${profile.fixtureKey} fixture 프로필을 확인했습니다.`
        : "사건 분류 정보가 부족해 fixture 프로필을 특정하지 못했습니다.",
    ),
    buildStep(
      "MAP_PRACTICE_AREAS",
      hasPracticeAreas ? "READY" : "BLOCKED",
      hasPracticeAreas
        ? `권장 전문 분야: ${profile.practiceAreaLabels.join(", ")}`
        : "전문 분야 매핑을 위해 category 또는 mappedCaseType 입력이 필요합니다.",
    ),
    buildStep(
      "CHECK_ASSIGNMENT_READINESS",
      assignmentReady ? "READY" : "PENDING",
      assignmentReady
        ? "관리자 검토 패널에서 매칭 권고안을 확인할 수 있습니다."
        : "사건 프로필 확인 후 관리자 검토용 권고 메모를 작성할 수 있습니다.",
    ),
    buildStep(
      "RECOMMEND_LAWYER_MATCH",
      assignmentReady ? "READY" : "BLOCKED",
      assignmentReady
        ? `${profile.matchingRationale} (자동 배정 없음, 관리자 승인 필요)`
        : "매칭 권고를 생성하려면 사건 프로필과 전문 분야 매핑이 필요합니다.",
    ),
  ];

  return {
    marker: CASE_LAWYER_MATCHING_SERVICE_MARKER,
    profile,
    steps,
    recommendedAssignmentNote: fixture?.assignmentNoteTemplate ?? null,
    assignmentReady,
  };
}

export function listKnownCaseLawyerMatchingFixtureKeys(): CaseLawyerMatchingFixtureKey[] {
  return Object.keys(CASE_LAWYER_MATCHING_FIXTURES) as CaseLawyerMatchingFixtureKey[];
}
