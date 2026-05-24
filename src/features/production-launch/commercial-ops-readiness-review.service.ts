/**
 * Product Phase 25-E — Commercial ops readiness review service.
 */
import { assembleCommercialOpsReadinessReview } from "./commercial-ops-readiness-review.policy";
import { COMMERCIAL_OPS_READINESS_AXES } from "./commercial-ops-readiness-review.registry";
import type { CommercialOpsReadinessReviewResult } from "./commercial-ops-readiness-review.schema";

export const COMMERCIAL_OPS_READINESS_REVIEW_SERVICE_MARKER_PHASE25E =
  "phase25e-commercial-ops-readiness-review-service" as const;

export function buildCommercialOpsReadinessReview(input?: {
  axisScores?: Record<string, number>;
  assumeProductRcPass?: boolean;
}): CommercialOpsReadinessReviewResult {
  const axisScores: Record<string, number> = {};

  for (const axis of COMMERCIAL_OPS_READINESS_AXES) {
    if (input?.axisScores?.[axis.axisId] != null) {
      axisScores[axis.axisId] = input.axisScores[axis.axisId]!;
    } else if (input?.assumeProductRcPass !== false) {
      axisScores[axis.axisId] = axis.axisId === "operator-training" ? 0 : 100;
    } else {
      axisScores[axis.axisId] = 0;
    }
  }

  return assembleCommercialOpsReadinessReview({ axisScores });
}
