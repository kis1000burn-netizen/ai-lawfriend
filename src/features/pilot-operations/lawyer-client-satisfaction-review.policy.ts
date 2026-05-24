/**
 * Product Phase 27-C — Lawyer / client satisfaction review policy SSOT.
 */
import {
  SATISFACTION_REVIEW_AXES,
  SATISFACTION_REVIEW_PASS_THRESHOLD,
} from "./lawyer-client-satisfaction-review.registry";
import type { LawyerClientSatisfactionReviewResult } from "./lawyer-client-satisfaction-review.schema";
import { LAWYER_CLIENT_SATISFACTION_REVIEW_VERSION } from "./lawyer-client-satisfaction-review.schema";

export const LAWYER_CLIENT_SATISFACTION_REVIEW_POLICY_MARKER_PHASE27C =
  "phase27c-lawyer-client-satisfaction-review-policy" as const;

export function assembleLawyerClientSatisfactionReview(input: {
  axisScores: Record<string, number>;
  generatedAt?: string;
}): LawyerClientSatisfactionReviewResult {
  const axes = SATISFACTION_REVIEW_AXES.map((axis) => ({
    ...axis,
    score: input.axisScores[axis.axisId] ?? 0,
  }));

  const totalWeight = axes.reduce((sum, axis) => sum + axis.weight, 0);
  const weightedScore =
    totalWeight === 0
      ? 0
      : Math.round(axes.reduce((sum, axis) => sum + axis.score * axis.weight, 0) / totalWeight);

  return {
    version: LAWYER_CLIENT_SATISFACTION_REVIEW_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    axes,
    weightedScore,
    satisfactionReviewComplete: weightedScore >= SATISFACTION_REVIEW_PASS_THRESHOLD,
  };
}
