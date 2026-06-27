import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import {
  assertAdminOnly,
  getCaseAccessContext,
} from "@/features/cases/case.permissions";
import {
  CASE_LAWYER_MATCHING_FIXTURES,
} from "./case-lawyer-matching.registry";
import { buildCaseLawyerMatchingRecommendationForCase } from "./case-lawyer-matching-recommendation.builder";
import type { CaseLawyerMatchingCandidate } from "./case-lawyer-matching-recommendation.policy";
import {
  approveCaseLawyerMatchingRecommendationInTransaction,
  createCaseLawyerMatchingRecommendation,
  findCaseLawyerMatchingRecommendationById,
  rejectCaseLawyerMatchingRecommendation,
  writeCaseLawyerMatchingRecommendationAudit,
} from "./case-lawyer-matching-recommendation.repository";

export const CASE_LAWYER_MATCHING_RECOMMENDATION_MARKER =
  "case-lawyer-matching-recommendation-v1" as const;

export {
  buildCaseLawyerMatchingRecommendationForCase,
  buildCaseLawyerMatchingWorkflowForCase,
} from "./case-lawyer-matching-recommendation.builder";

type GenerateRecommendationInput = {
  caseId: string;
  category?: string | null;
  mappedCaseType?: string | null;
  gongbuhoCode?: string | null;
  conflictLawyerIds?: string[];
  candidates: CaseLawyerMatchingCandidate[];
};

type ApproveRecommendationInput = {
  recommendationId: string;
  assigneeUserId: string;
  note?: string;
};

export async function generateCaseLawyerMatchingRecommendationService(
  currentUser: SessionUser,
  input: GenerateRecommendationInput,
) {
  assertAdminOnly(currentUser);
  await getCaseAccessContext(currentUser, input.caseId);

  const recommendation = buildCaseLawyerMatchingRecommendationForCase(input);
  const stored = await createCaseLawyerMatchingRecommendation({
    recommendation,
    createdByAdminId: currentUser.id,
  });

  await writeCaseLawyerMatchingRecommendationAudit({
    actorUserId: currentUser.id,
    action: "CASE_LAWYER_MATCHING_RECOMMEND_CREATE",
    recommendation: stored,
  });

  return stored;
}

export async function getCaseLawyerMatchingRecommendationForAdminService(
  currentUser: SessionUser,
  caseId: string,
  recommendationId: string,
) {
  assertAdminOnly(currentUser);
  await getCaseAccessContext(currentUser, caseId);

  const recommendation = await findCaseLawyerMatchingRecommendationById(
    recommendationId,
  );
  if (!recommendation || recommendation.caseId !== caseId) {
    throw new NotFoundError("매칭 권고안을 찾을 수 없습니다.");
  }

  return recommendation;
}

export async function approveCaseLawyerMatchingRecommendationService(
  currentUser: SessionUser,
  caseId: string,
  input: ApproveRecommendationInput,
) {
  assertAdminOnly(currentUser);
  await getCaseAccessContext(currentUser, caseId);

  const note =
    input.note?.trim() || undefined;
  const recommendation = await findCaseLawyerMatchingRecommendationById(
    input.recommendationId,
  );
  if (!recommendation || recommendation.caseId !== caseId) {
    throw new NotFoundError("매칭 권고안을 찾을 수 없습니다.");
  }

  const result = await approveCaseLawyerMatchingRecommendationInTransaction({
    recommendationId: input.recommendationId,
    caseId,
    assigneeUserId: input.assigneeUserId,
    note: note ?? recommendation.recommendedAssignmentNote,
    adminUserId: currentUser.id,
  });

  if (!result) {
    throw new NotFoundError("매칭 권고안을 찾을 수 없습니다.");
  }

  return {
    recommendation: result.recommendation,
    assignment: result.assignment,
    idempotent: result.idempotent,
  };
}

export async function rejectCaseLawyerMatchingRecommendationService(
  currentUser: SessionUser,
  caseId: string,
  recommendationId: string,
  reviewNote?: string,
) {
  assertAdminOnly(currentUser);
  await getCaseAccessContext(currentUser, caseId);

  const updated = await rejectCaseLawyerMatchingRecommendation({
    recommendationId,
    caseId,
    adminUserId: currentUser.id,
    reviewNote: reviewNote?.trim() || null,
  });

  if (!updated) {
    throw new NotFoundError("매칭 권고안을 찾을 수 없습니다.");
  }

  return updated;
}

export function listCaseLawyerMatchingFixtureCaseIdsForExclusion() {
  return Object.values(CASE_LAWYER_MATCHING_FIXTURES).map((fixture) => fixture.caseId);
}
