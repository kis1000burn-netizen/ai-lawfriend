/**
 * Product Phase 23-B — Lawyer review feedback loop policy SSOT.
 */
import { createHash } from "node:crypto";
import { AI_GOVERNANCE_FEATURES } from "@/features/ai-core/ai-governance-control.schema";
import type {
  AiLawyerReviewFeedbackRating,
  LawyerReviewFeedbackCatalogSummary,
  LawyerReviewFeedbackRecord,
} from "./lawyer-review-feedback-loop.schema";
import { AI_LAWYER_REVIEW_FEEDBACK_RATINGS } from "./lawyer-review-feedback-loop.schema";

export const LAWYER_REVIEW_FEEDBACK_LOOP_POLICY_MARKER_PHASE23B =
  "phase23b-lawyer-review-feedback-loop-policy" as const;

export function hashAiOutputText(aiOutputText: string): string {
  return createHash("sha256").update(aiOutputText.trim()).digest("hex");
}

export function assertLawyerCanSubmitFeedback(role: string): void {
  if (!["LAWYER", "ADMIN", "STAFF", "SUPER_ADMIN"].includes(role)) {
    throw new Error("LAWYER_REVIEW_FEEDBACK_FORBIDDEN");
  }
}

export function buildLawyerReviewFeedbackCatalogSummary(
  records: LawyerReviewFeedbackRecord[],
): LawyerReviewFeedbackCatalogSummary {
  const byRating = Object.fromEntries(
    AI_LAWYER_REVIEW_FEEDBACK_RATINGS.map((rating) => [
      rating,
      records.filter((record) => record.rating === rating).length,
    ]),
  ) as Record<AiLawyerReviewFeedbackRating, number>;

  const byFeature = Object.fromEntries(
    AI_GOVERNANCE_FEATURES.map((feature) => [
      feature,
      records.filter((record) => record.feature === feature).length,
    ]),
  ) as LawyerReviewFeedbackCatalogSummary["byFeature"];

  return {
    totalFeedbacks: records.length,
    byRating,
    byFeature,
  };
}

export function shouldTriggerQualityRegression(rating: AiLawyerReviewFeedbackRating): boolean {
  return rating === "MAJOR_EDIT" || rating === "REJECT";
}
