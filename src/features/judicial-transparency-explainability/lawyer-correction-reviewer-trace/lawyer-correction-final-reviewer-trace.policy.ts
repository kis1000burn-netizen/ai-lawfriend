/**
 * Product Phase 45-D — LawyerCorrectionFinalReviewerTrace policy SSOT.
 */
import { LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_ITEMS, JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG } from "./lawyer-correction-final-reviewer-trace.registry";
import type { LawyerCorrectionFinalReviewerTraceResult } from "./lawyer-correction-final-reviewer-trace.schema";
import { LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_VERSION } from "./lawyer-correction-final-reviewer-trace.schema";

export const LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_POLICY_MARKER_45D =
  "phase45d-lawyer-correction-final-reviewer-trace-policy" as const;

export const LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_GATE_MARKER_45D =
  "phase45d-lawyer-correction-final-reviewer-trace-gate" as const;


export function assembleLawyerCorrectionFinalReviewerTrace(input: {
  explainabilityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): LawyerCorrectionFinalReviewerTraceResult {
  const items = LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_VERSION,
    explainabilityScopeSlug: input.explainabilityScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    lawyerCorrectionFinalReviewerTraceReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
