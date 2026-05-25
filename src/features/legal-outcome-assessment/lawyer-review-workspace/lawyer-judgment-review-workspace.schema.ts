/**
 * Product Phase 40-E — LawyerJudgmentReviewWorkspace schema (Zod SSOT).
 */
import { z } from "zod";

export const LAWYER_JUDGMENT_REVIEW_WORKSPACE_SCHEMA_MARKER_40E =
  "phase40e-lawyer-judgment-review-workspace-schema" as const;

export const LAWYER_JUDGMENT_REVIEW_WORKSPACE_VERSION = "40-E.2" as const;

export const LAWYER_JUDGMENT_REVIEW_WORKSPACE_ITEM_IDS = [
  "JUDGMENT_DRAWER_OPEN",
  "ORIGINAL_TEXT_VIEW",
  "RELEVANT_PARAGRAPH_VIEW",
  "APPLICATION_ANALYSIS_VIEW",
  "REVIEW_CONFIRM_ACTION",
  "REVIEW_CORRECT_ACTION",
  "REVIEW_REJECT_ACTION",
  "LAWYER_MEMO_CAPTURE",
] as const;

export const lawyerJudgmentReviewWorkspaceItemSchema = z.object({
  itemId: z.enum(LAWYER_JUDGMENT_REVIEW_WORKSPACE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const lawyerJudgmentReviewWorkspaceResultSchema = z.object({
  version: z.literal("40-E.2"),
  caseAssessmentScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(lawyerJudgmentReviewWorkspaceItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  lawyerJudgmentReviewWorkspaceReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type LawyerJudgmentReviewWorkspaceItemId = (typeof LAWYER_JUDGMENT_REVIEW_WORKSPACE_ITEM_IDS)[number];
export type LawyerJudgmentReviewWorkspaceResult = z.infer<typeof lawyerJudgmentReviewWorkspaceResultSchema>;
