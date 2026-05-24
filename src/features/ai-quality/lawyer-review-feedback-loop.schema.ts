/**
 * Product Phase 23-B — Lawyer review feedback loop schema (Zod SSOT).
 */
import { z } from "zod";
import { AI_GOVERNANCE_FEATURES } from "@/features/ai-core/ai-governance-control.schema";

export const LAWYER_REVIEW_FEEDBACK_LOOP_SCHEMA_MARKER_PHASE23B =
  "phase23b-lawyer-review-feedback-loop-schema" as const;

export const AI_LAWYER_REVIEW_FEEDBACK_RATINGS = [
  "ACCEPT",
  "MINOR_EDIT",
  "MAJOR_EDIT",
  "REJECT",
] as const;

export const aiLawyerReviewFeedbackRatingSchema = z.enum(AI_LAWYER_REVIEW_FEEDBACK_RATINGS);
export const lawyerReviewFeedbackFeatureSchema = z.enum(AI_GOVERNANCE_FEATURES);

export const lawyerReviewFeedbackCreateSchema = z.object({
  caseId: z.string().min(1),
  feature: lawyerReviewFeedbackFeatureSchema,
  evaluationCode: z.string().min(3).max(120).optional(),
  aiOutputText: z.string().min(1).max(16000),
  rating: aiLawyerReviewFeedbackRatingSchema,
  feedbackNotes: z.string().trim().max(4000).optional(),
  correctionHints: z.array(z.string().trim().min(1).max(500)).max(20).optional(),
});

export const lawyerReviewFeedbackRecordSchema = lawyerReviewFeedbackCreateSchema
  .omit({ aiOutputText: true })
  .extend({
    id: z.string().min(1),
    lawyerUserId: z.string().min(1),
    aiOutputHash: z.string().min(8).max(128),
    createdAt: z.string().datetime(),
  });

export type AiLawyerReviewFeedbackRating = z.infer<
  typeof aiLawyerReviewFeedbackRatingSchema
>;
export type LawyerReviewFeedbackCreateInput = z.infer<
  typeof lawyerReviewFeedbackCreateSchema
>;
export type LawyerReviewFeedbackRecord = z.infer<typeof lawyerReviewFeedbackRecordSchema>;

export type LawyerReviewFeedbackCatalogSummary = {
  totalFeedbacks: number;
  byRating: Record<AiLawyerReviewFeedbackRating, number>;
  byFeature: Record<(typeof AI_GOVERNANCE_FEATURES)[number], number>;
};
