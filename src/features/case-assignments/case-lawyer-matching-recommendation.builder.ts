import { randomUUID } from "node:crypto";

import {
  CASE_LAWYER_MATCHING_SERVICE_MARKER,
} from "./case-lawyer-matching.registry";
import {
  buildCaseLawyerMatchingRecommendation,
  CASE_LAWYER_MATCHING_SAFE_SPECIALTY_LABELS,
  type CaseLawyerMatchingCandidate,
} from "./case-lawyer-matching-recommendation.policy";
import type { CaseLawyerMatchingRecommendation } from "./case-lawyer-matching.schema";
import {
  buildCaseLawyerMatchingWorkflow,
  resolveCaseLawyerMatchingProfile,
} from "./case-lawyer-matching.service";

type BuildRecommendationInput = {
  caseId: string;
  category?: string | null;
  mappedCaseType?: string | null;
  gongbuhoCode?: string | null;
  conflictLawyerIds?: string[];
  candidates: CaseLawyerMatchingCandidate[];
};

export function buildCaseLawyerMatchingRecommendationForCase(
  input: BuildRecommendationInput,
): CaseLawyerMatchingRecommendation {
  const profile = resolveCaseLawyerMatchingProfile(input);
  const workflow = buildCaseLawyerMatchingWorkflow(profile);
  const matchedSpecialties =
    profile.fixtureKey != null
      ? [...CASE_LAWYER_MATCHING_SAFE_SPECIALTY_LABELS[profile.fixtureKey]]
      : profile.practiceAreaLabels.map((label) => `${label} 관련 검토`);

  const note =
    workflow.recommendedAssignmentNote ??
    "관리자 검토용 매칭 권고안입니다. 자동 배정되지 않습니다.";

  return buildCaseLawyerMatchingRecommendation({
    recommendationId: randomUUID(),
    caseId: input.caseId,
    fixtureKey: profile.fixtureKey,
    matchedSpecialties,
    recommendedAssignmentNote: note,
    candidates: input.candidates,
    conflictLawyerIds: input.conflictLawyerIds,
    generatedBy: "RULE_ENGINE",
  });
}

export function buildCaseLawyerMatchingWorkflowForCase(input: {
  caseId: string;
  category?: string | null;
  mappedCaseType?: string | null;
  gongbuhoCode?: string | null;
  candidates?: CaseLawyerMatchingCandidate[];
  conflictLawyerIds?: string[];
}) {
  const profile = resolveCaseLawyerMatchingProfile(input);
  const recommendation = buildCaseLawyerMatchingRecommendationForCase({
    caseId: input.caseId,
    category: input.category,
    mappedCaseType: input.mappedCaseType,
    gongbuhoCode: input.gongbuhoCode,
    conflictLawyerIds: input.conflictLawyerIds,
    candidates: input.candidates ?? [],
  });
  const workflow = buildCaseLawyerMatchingWorkflow(profile);

  return {
    ...workflow,
    marker: CASE_LAWYER_MATCHING_SERVICE_MARKER,
    assignmentReady: recommendation.status === "ASSIGNMENT_READY",
    recommendation,
  };
}
