/**
 * Product Phase 28-E — Scale risk review service.
 */
import { assembleScaleRiskReview } from "./scale-risk-review.policy";
import { SCALE_RISK_AXES } from "./scale-risk-review.registry";
import type { ScaleRiskReviewResult } from "./scale-risk-review.schema";

export const SCALE_RISK_REVIEW_SERVICE_MARKER_PHASE28E = "phase28e-scale-risk-review-service" as const;

export function buildScaleRiskReview(input?: {
  axisScores?: Record<string, number>;
  blockers?: string[];
  assumeScaleRiskPass?: boolean;
}): ScaleRiskReviewResult {
  const axisScores: Record<string, number> = {};

  for (const axis of SCALE_RISK_AXES) {
    if (input?.axisScores?.[axis.axisId] != null) {
      axisScores[axis.axisId] = input.axisScores[axis.axisId]!;
    } else if (input?.assumeScaleRiskPass !== false) {
      axisScores[axis.axisId] = 85;
    } else {
      axisScores[axis.axisId] = 0;
    }
  }

  return assembleScaleRiskReview({
    axisScores,
    blockers: input?.blockers,
  });
}
