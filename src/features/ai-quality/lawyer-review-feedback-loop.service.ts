/**
 * Product Phase 23-B — Lawyer review feedback loop service.
 */
import { writeAuditLog } from "@/lib/audit-log";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  assertLawyerCanSubmitFeedback,
  buildLawyerReviewFeedbackCatalogSummary,
  shouldTriggerQualityRegression,
} from "./lawyer-review-feedback-loop.policy";
import {
  createAiLawyerReviewFeedback,
  listAiLawyerReviewFeedbacksByCase,
  mapPrismaLawyerReviewFeedback,
} from "./lawyer-review-feedback-loop.repository";
import type {
  LawyerReviewFeedbackCatalogSummary,
  LawyerReviewFeedbackCreateInput,
  LawyerReviewFeedbackRecord,
} from "./lawyer-review-feedback-loop.schema";
import { lawyerReviewFeedbackCreateSchema } from "./lawyer-review-feedback-loop.schema";

export const LAWYER_REVIEW_FEEDBACK_LOOP_SERVICE_MARKER_PHASE23B =
  "phase23b-lawyer-review-feedback-loop-service" as const;

export async function recordLawyerReviewFeedback(
  currentUser: SessionUser,
  body: LawyerReviewFeedbackCreateInput,
): Promise<{
  feedback: LawyerReviewFeedbackRecord;
  triggerQualityRegression: boolean;
}> {
  assertLawyerCanSubmitFeedback(currentUser.role);

  const parsed = lawyerReviewFeedbackCreateSchema.parse(body);
  const access = await getCaseAccessContext(currentUser, parsed.caseId);

  if (!access.isAssignedLawyer && !access.isAdmin) {
    throw new ForbiddenError("변호사 리뷰 피드백 작성 권한이 없습니다.");
  }

  const row = await createAiLawyerReviewFeedback({
    lawyerUserId: currentUser.id,
    body: parsed,
  });

  const feedback = mapPrismaLawyerReviewFeedback(row);
  const triggerQualityRegression = shouldTriggerQualityRegression(feedback.rating);

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "AI_LAWYER_REVIEW_FEEDBACK_RECORDED",
    entityType: "AI_LAWYER_REVIEW_FEEDBACK",
    entityId: feedback.id,
    message: "변호사 AI 출력 리뷰 피드백 기록",
    metadata: {
      caseId: feedback.caseId,
      feature: feedback.feature,
      rating: feedback.rating,
      evaluationCode: feedback.evaluationCode ?? null,
      triggerQualityRegression,
    },
  });

  return { feedback, triggerQualityRegression };
}

export async function getLawyerReviewFeedbackForCase(
  currentUser: SessionUser,
  caseId: string,
): Promise<{
  feedbacks: LawyerReviewFeedbackRecord[];
  summary: LawyerReviewFeedbackCatalogSummary;
}> {
  const access = await getCaseAccessContext(currentUser, caseId);
  if (!access.canRead) {
    throw new NotFoundError();
  }

  const rows = await listAiLawyerReviewFeedbacksByCase(caseId);
  const feedbacks = rows.map(mapPrismaLawyerReviewFeedback);

  return {
    feedbacks,
    summary: buildLawyerReviewFeedbackCatalogSummary(feedbacks),
  };
}
