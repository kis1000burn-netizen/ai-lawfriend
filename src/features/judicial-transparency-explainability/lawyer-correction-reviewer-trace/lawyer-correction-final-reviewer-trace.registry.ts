/**
 * Product Phase 45-D — LawyerCorrectionFinalReviewerTrace SSOT.
 */
import type { LawyerCorrectionFinalReviewerTraceResult } from "./lawyer-correction-final-reviewer-trace.schema";

export const LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_REGISTRY_MARKER_45D =
  "phase45d-lawyer-correction-final-reviewer-trace-registry" as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG = "judicial-transparency-explainability-001" as const;

type LawyerCorrectionFinalReviewerTraceItem = Omit<LawyerCorrectionFinalReviewerTraceResult["items"][number], "defined">;

export const LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_ITEMS: LawyerCorrectionFinalReviewerTraceItem[] = [
  { itemId: "LAWYER_CORRECTION_HISTORY", label: "Lawyer correction history log", required: true },
  { itemId: "FINAL_REVIEWER_RECORD", label: "Final reviewer record", required: true },
  { itemId: "CORRECTION_DIFF_VIEW", label: "AI vs lawyer correction diff view", required: true },
  { itemId: "CORRECTION_REVIEWER_LAWYER_REVIEW", label: "Lawyer review of correction trace", required: true },
];
