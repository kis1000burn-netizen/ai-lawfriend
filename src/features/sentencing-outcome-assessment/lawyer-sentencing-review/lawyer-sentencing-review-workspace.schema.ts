/**
 * Product Phase 41-E — LawyerSentencingReviewWorkspace schema (Zod SSOT).
 */
import { z } from "zod";

export const LAWYER_SENTENCING_REVIEW_WORKSPACE_SCHEMA_MARKER_41E =
  "phase41e-lawyer-sentencing-review-workspace-schema" as const;

export const LAWYER_SENTENCING_REVIEW_WORKSPACE_VERSION = "41-E.1" as const;

export const LAWYER_SENTENCING_REVIEW_WORKSPACE_ITEM_IDS = [
  "JUDGMENT_CARD_OPEN",
  "ORIGINAL_AND_SENTENCE_VIEW",
  "SENTENCING_REASON_VIEW",
  "FACT_PARAGRAPH_VIEW",
  "SIMILARITY_COMPARISON_VIEW",
  "SENTENCING_FACTOR_TABLE",
  "REVIEW_CONFIRM_REJECT",
  "LAWYER_MEMO_CAPTURE",
] as const;

export const lawyerSentencingReviewWorkspaceItemSchema = z.object({
  itemId: z.enum(LAWYER_SENTENCING_REVIEW_WORKSPACE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const lawyerSentencingReviewWorkspaceResultSchema = z.object({
  version: z.literal("41-E.1"),
  sentencingAssessmentScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(lawyerSentencingReviewWorkspaceItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  lawyerSentencingReviewWorkspaceReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
  clientVisibleBeforeReview: z.literal(false),
});

export type LawyerSentencingReviewWorkspaceItemId = (typeof LAWYER_SENTENCING_REVIEW_WORKSPACE_ITEM_IDS)[number];
export type LawyerSentencingReviewWorkspaceResult = z.infer<typeof lawyerSentencingReviewWorkspaceResultSchema>;
