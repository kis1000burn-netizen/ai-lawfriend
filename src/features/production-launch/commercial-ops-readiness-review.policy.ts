/**
 * Product Phase 25-E — Commercial ops readiness review policy SSOT.
 */
import {
  COMMERCIAL_OPS_READINESS_AXES,
  COMMERCIAL_OPS_READINESS_PASS_THRESHOLD,
} from "./commercial-ops-readiness-review.registry";
import type { CommercialOpsReadinessReviewResult } from "./commercial-ops-readiness-review.schema";
import { COMMERCIAL_OPS_READINESS_REVIEW_VERSION } from "./commercial-ops-readiness-review.schema";

export const COMMERCIAL_OPS_READINESS_REVIEW_POLICY_MARKER_PHASE25E =
  "phase25e-commercial-ops-readiness-review-policy" as const;

export function computeWeightedReadinessScore(
  axes: CommercialOpsReadinessReviewResult["axes"],
): number {
  const totalWeight = axes.reduce((sum, axis) => sum + axis.weight, 0);
  if (totalWeight === 0) {
    return 0;
  }
  const weighted = axes.reduce((sum, axis) => sum + (axis.score * axis.weight) / 100, 0);
  return Math.round((weighted / totalWeight) * 100);
}

export function assembleCommercialOpsReadinessReview(input: {
  axisScores: Record<string, number>;
  generatedAt?: string;
}): CommercialOpsReadinessReviewResult {
  const axes = COMMERCIAL_OPS_READINESS_AXES.map((axis) => ({
    ...axis,
    score: Math.max(0, Math.min(100, input.axisScores[axis.axisId] ?? 0)),
  }));

  const weightedScore = computeWeightedReadinessScore(axes);
  const blockers = axes
    .filter((axis) => axis.score < 100)
    .map((axis) => `${axis.label}: score ${axis.score}`);

  return {
    version: COMMERCIAL_OPS_READINESS_REVIEW_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    axes,
    weightedScore,
    commercialReady: weightedScore >= COMMERCIAL_OPS_READINESS_PASS_THRESHOLD && blockers.length === 0,
    blockers,
  };
}
