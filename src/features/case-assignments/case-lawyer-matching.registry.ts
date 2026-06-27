export const CASE_LAWYER_MATCHING_SERVICE_MARKER =
  "case-lawyer-matching-workflow-v1" as const;

export type CaseLawyerMatchingFixtureKey =
  | "JOOHWAN_LAND_ACCESS"
  | "CONSTRUCTION_INJURY_COMPENSATION";

export type CaseLawyerMatchingFixture = {
  fixtureKey: CaseLawyerMatchingFixtureKey;
  caseId: string;
  category: string;
  mappedCaseType: string;
  gongbuhoCode: string;
  practiceAreaLabels: string[];
  matchingRationale: string;
  assignmentNoteTemplate: string;
  prohibitedExposureFields: string[];
};

export const CASE_LAWYER_MATCHING_FIXTURES: Record<
  CaseLawyerMatchingFixtureKey,
  CaseLawyerMatchingFixture
> = {
  JOOHWAN_LAND_ACCESS: {
    fixtureKey: "JOOHWAN_LAND_ACCESS",
    caseId: "case-joohwan-land-access",
    category: "LAND_ACCESS_EASEMENT",
    mappedCaseType: "LAND_ACCESS_EASEMENT",
    gongbuhoCode: "LAND_ACCESS_EASEMENT",
    practiceAreaLabels: ["부동산·토지", "통행·지역권", "민사소송"],
    matchingRationale:
      "토지 분할 후 통행로 제공 약정, 토지사용승낙서 해석, 통행지역권·주위토지통행권 검토가 필요한 사건입니다.",
    assignmentNoteTemplate:
      "부동산 관련 분쟁 — 관리자 검토용 권고. 부동산·통행권 경험 변호사 후보 검토. 자동 배정 없음.",
    prohibitedExposureFields: [
      "ownerUserId",
      "opponentName",
      "title",
      "clientName",
      "assignee.name",
      "assignee.email",
    ],
  },
  CONSTRUCTION_INJURY_COMPENSATION: {
    fixtureKey: "CONSTRUCTION_INJURY_COMPENSATION",
    caseId: "case-recent-construction-injury-20260618",
    category: "CONSTRUCTION_INJURY_COMPENSATION",
    mappedCaseType: "CONSTRUCTION_INJURY_COMPENSATION",
    gongbuhoCode: "LAW-CONSTRUCTION-INJURY-001",
    practiceAreaLabels: ["산재·손해배상", "건설현장 안전", "원청·하청 책임"],
    matchingRationale:
      "건설현장 중량물 추락 산재 손해배상 사건으로, 작업계획 준수·관리감독·향후 치료비 산정 경험이 필요합니다.",
    assignmentNoteTemplate:
      "산업재해·손해배상 — 관리자 검토용 권고. 산재·원청·하청 경험 변호사 후보 검토. 자동 배정 없음.",
    prohibitedExposureFields: [
      "ownerUserId",
      "opponentName",
      "title",
      "clientName",
      "assignee.name",
      "assignee.email",
    ],
  },
};

export const CASE_LAWYER_MATCHING_STEPS = [
  {
    stepId: "IDENTIFY_CASE_PROFILE",
    label: "사건 프로필 식별",
    required: true,
  },
  {
    stepId: "MAP_PRACTICE_AREAS",
    label: "전문 분야 매핑",
    required: true,
  },
  {
    stepId: "CHECK_ASSIGNMENT_READINESS",
    label: "배정 준비 상태 확인",
    required: true,
  },
  {
    stepId: "RECOMMEND_LAWYER_MATCH",
    label: "변호사 매칭 권고",
    required: true,
  },
] as const;
