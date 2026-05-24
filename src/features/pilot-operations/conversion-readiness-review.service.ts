/**
 * Product Phase 27-E — Conversion readiness review service.
 */
import { assembleConversionReadinessReview } from "./conversion-readiness-review.policy";
import { CONVERSION_READINESS_AXES } from "./conversion-readiness-review.registry";
import type { ConversionReadinessReviewResult } from "./conversion-readiness-review.schema";

export const CONVERSION_READINESS_REVIEW_SERVICE_MARKER_PHASE27E =
  "phase27e-conversion-readiness-review-service" as const;

export function buildConversionReadinessReview(input?: {
  axisScores?: Record<string, number>;
  blockers?: string[];
  assumeConversionPass?: boolean;
}): ConversionReadinessReviewResult {
  const axisScores: Record<string, number> = {};

  for (const axis of CONVERSION_READINESS_AXES) {
    if (input?.axisScores?.[axis.axisId] != null) {
      axisScores[axis.axisId] = input.axisScores[axis.axisId]!;
    } else if (input?.assumeConversionPass !== false) {
      axisScores[axis.axisId] = 90;
    } else {
      axisScores[axis.axisId] = 0;
    }
  }

  return assembleConversionReadinessReview({
    axisScores,
    blockers: input?.blockers,
  });
}
