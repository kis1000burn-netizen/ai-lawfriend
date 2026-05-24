/**
 * Product Phase 28-E — Scale risk review policy SSOT.
 */
import { SCALE_RISK_AXES, SCALE_RISK_PASS_THRESHOLD } from "./scale-risk-review.registry";
import type { ScaleRiskReviewResult } from "./scale-risk-review.schema";
import { SCALE_RISK_REVIEW_VERSION } from "./scale-risk-review.schema";

export const SCALE_RISK_REVIEW_POLICY_MARKER_PHASE28E = "phase28e-scale-risk-review-policy" as const;

export function assembleScaleRiskReview(input: {
  axisScores: Record<string, number>;
  blockers?: string[];
  generatedAt?: string;
}): ScaleRiskReviewResult {
  const axes = SCALE_RISK_AXES.map((axis) => ({
    ...axis,
    score: input.axisScores[axis.axisId] ?? 0,
  }));

  const totalWeight = axes.reduce((sum, axis) => sum + axis.weight, 0);
  const weightedScore =
    totalWeight === 0
      ? 0
      : Math.round(axes.reduce((sum, axis) => sum + axis.score * axis.weight, 0) / totalWeight);

  const blockers = input.blockers ?? [];

  return {
    version: SCALE_RISK_REVIEW_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    axes,
    weightedScore,
    blockers,
    scaleRiskAcceptable:
      weightedScore >= SCALE_RISK_PASS_THRESHOLD && blockers.length === 0,
  };
}
