/**
 * Product Phase 27-E — Conversion readiness review policy SSOT.
 */
import {
  CONVERSION_READINESS_AXES,
  CONVERSION_READINESS_PASS_THRESHOLD,
} from "./conversion-readiness-review.registry";
import type { ConversionReadinessReviewResult } from "./conversion-readiness-review.schema";
import { CONVERSION_READINESS_REVIEW_VERSION } from "./conversion-readiness-review.schema";

export const CONVERSION_READINESS_REVIEW_POLICY_MARKER_PHASE27E =
  "phase27e-conversion-readiness-review-policy" as const;

export function assembleConversionReadinessReview(input: {
  axisScores: Record<string, number>;
  blockers?: string[];
  generatedAt?: string;
}): ConversionReadinessReviewResult {
  const axes = CONVERSION_READINESS_AXES.map((axis) => ({
    ...axis,
    score: input.axisScores[axis.axisId] ?? 0,
  }));

  const totalWeight = axes.reduce((sum, axis) => sum + axis.weight, 0);
  const weightedScore =
    totalWeight === 0
      ? 0
      : Math.round(axes.reduce((sum, axis) => sum + axis.score * axis.weight, 0) / totalWeight);

  const blockers = input.blockers ?? [];
  const lowAxes = axes.filter((axis) => axis.score < 70).map((axis) => axis.axisId);

  return {
    version: CONVERSION_READINESS_REVIEW_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    axes,
    weightedScore,
    blockers: [...blockers, ...lowAxes.map((id) => `low-score:${id}`)].filter(
      (value, index, array) => array.indexOf(value) === index,
    ),
    conversionReady:
      weightedScore >= CONVERSION_READINESS_PASS_THRESHOLD && blockers.length === 0,
  };
}
