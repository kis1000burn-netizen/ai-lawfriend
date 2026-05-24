/**
 * Product Phase 27-C — Lawyer / client satisfaction review service.
 */
import { assembleLawyerClientSatisfactionReview } from "./lawyer-client-satisfaction-review.policy";
import { SATISFACTION_REVIEW_AXES } from "./lawyer-client-satisfaction-review.registry";
import type { LawyerClientSatisfactionReviewResult } from "./lawyer-client-satisfaction-review.schema";

export const LAWYER_CLIENT_SATISFACTION_REVIEW_SERVICE_MARKER_PHASE27C =
  "phase27c-lawyer-client-satisfaction-review-service" as const;

export function buildLawyerClientSatisfactionReview(input?: {
  axisScores?: Record<string, number>;
  assumePilotSatisfactionPass?: boolean;
}): LawyerClientSatisfactionReviewResult {
  const axisScores: Record<string, number> = {};

  for (const axis of SATISFACTION_REVIEW_AXES) {
    if (input?.axisScores?.[axis.axisId] != null) {
      axisScores[axis.axisId] = input.axisScores[axis.axisId]!;
    } else if (input?.assumePilotSatisfactionPass !== false) {
      axisScores[axis.axisId] = 80;
    } else {
      axisScores[axis.axisId] = 0;
    }
  }

  return assembleLawyerClientSatisfactionReview({ axisScores });
}
