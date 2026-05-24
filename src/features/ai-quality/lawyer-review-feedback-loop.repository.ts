/**
 * Product Phase 23-B — Lawyer review feedback loop repository.
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashAiOutputText } from "./lawyer-review-feedback-loop.policy";
import type { LawyerReviewFeedbackCreateInput } from "./lawyer-review-feedback-loop.schema";
import { lawyerReviewFeedbackRecordSchema } from "./lawyer-review-feedback-loop.schema";

export const LAWYER_REVIEW_FEEDBACK_LOOP_REPOSITORY_MARKER_PHASE23B =
  "phase23b-lawyer-review-feedback-loop-repository" as const;

export async function createAiLawyerReviewFeedback(input: {
  lawyerUserId: string;
  body: LawyerReviewFeedbackCreateInput;
}) {
  const aiOutputHash = hashAiOutputText(input.body.aiOutputText);

  return prisma.aiLawyerReviewFeedback.create({
    data: {
      caseId: input.body.caseId,
      lawyerUserId: input.lawyerUserId,
      feature: input.body.feature,
      evaluationCode: input.body.evaluationCode ?? null,
      aiOutputHash,
      rating: input.body.rating,
      feedbackNotes: input.body.feedbackNotes ?? null,
      correctionHints: (input.body.correctionHints ?? null) as Prisma.InputJsonValue,
    },
  });
}

export async function listAiLawyerReviewFeedbacksByCase(caseId: string, limit = 50) {
  return prisma.aiLawyerReviewFeedback.findMany({
    where: { caseId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export function mapPrismaLawyerReviewFeedback(
  row: Awaited<ReturnType<typeof listAiLawyerReviewFeedbacksByCase>>[number],
) {
  return lawyerReviewFeedbackRecordSchema.parse({
    id: row.id,
    caseId: row.caseId,
    lawyerUserId: row.lawyerUserId,
    feature: row.feature,
    evaluationCode: row.evaluationCode ?? undefined,
    aiOutputHash: row.aiOutputHash,
    rating: row.rating,
    feedbackNotes: row.feedbackNotes ?? undefined,
    correctionHints: Array.isArray(row.correctionHints)
      ? (row.correctionHints as string[])
      : undefined,
    createdAt: row.createdAt.toISOString(),
  });
}
