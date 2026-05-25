/**
 * Product Phase 45-D — LawyerCorrectionFinalReviewerTrace service.
 */
import {
  JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG,
  LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_ITEMS,
} from "./lawyer-correction-final-reviewer-trace.registry";
import { assembleLawyerCorrectionFinalReviewerTrace } from "./lawyer-correction-final-reviewer-trace.policy";
import type { LawyerCorrectionFinalReviewerTraceResult } from "./lawyer-correction-final-reviewer-trace.schema";

export const LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_SERVICE_MARKER_45D =
  "phase45d-lawyer-correction-final-reviewer-trace-service" as const;

export function buildLawyerCorrectionFinalReviewerTrace(input?: {
  explainabilityScopeSlug?: string;
  definedItemIds?: string[];
}): LawyerCorrectionFinalReviewerTraceResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleLawyerCorrectionFinalReviewerTrace({
    explainabilityScopeSlug:
      input?.explainabilityScopeSlug ?? JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
