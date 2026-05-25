/**
 * Product Phase 45-D — LawyerCorrectionFinalReviewerTrace schema (Zod SSOT).
 */
import { z } from "zod";

export const LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_SCHEMA_MARKER_45D =
  "phase45d-lawyer-correction-final-reviewer-trace-schema" as const;

export const LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_VERSION = "45-D.1" as const;

export const LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_ITEM_IDS = [
  "LAWYER_CORRECTION_HISTORY",
  "FINAL_REVIEWER_RECORD",
  "CORRECTION_DIFF_VIEW",
  "CORRECTION_REVIEWER_LAWYER_REVIEW",
] as const;

export const lawyercorrectionfinalreviewertraceItemSchema = z.object({
  itemId: z.enum(LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const lawyercorrectionfinalreviewertraceResultSchema = z.object({
  version: z.literal("45-D.1"),
  explainabilityScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(lawyercorrectionfinalreviewertraceItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  lawyerCorrectionFinalReviewerTraceReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type LawyerCorrectionFinalReviewerTraceItemId = (typeof LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_ITEM_IDS)[number];
export type LawyerCorrectionFinalReviewerTraceResult = z.infer<typeof lawyercorrectionfinalreviewertraceResultSchema>;
