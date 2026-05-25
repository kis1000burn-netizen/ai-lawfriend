/**
 * Product Phase 48-D — Judgment Drawer / Precedent Viewer schema SSOT.
 */
import { z } from "zod";

export const JUDGMENT_DRAWER_PRECEDENT_VIEWER_VERSION = "48-D.1" as const;

export const JUDGMENT_DRAWER_PRECEDENT_VIEWER_ITEM_IDS = ["JUDGMENT_ORIGINAL_TEXT", "CASE_NUMBER", "COURT", "JUDGMENT_DATE", "KEY_HOLDING", "RELEVANT_PARAGRAPH", "SIMILARITY_DIFFERENCE", "APPLICATION_RISK", "LINKED_CLAIM_EVIDENCE", "LAWYER_MEMO", "CROSS_PANEL_CLICKTHROUGH"] as const;

export const judgmentDrawerPrecedentViewerItemIdSchema = z.enum(JUDGMENT_DRAWER_PRECEDENT_VIEWER_ITEM_IDS);

export const judgmentDrawerPrecedentViewerItemSchema = z.object({
  itemId: judgmentDrawerPrecedentViewerItemIdSchema,
  label: z.string(),
  required: z.boolean(),
  defined: z.boolean(),
  uiRoute: z.string().optional(),
});

export const judgmentDrawerPrecedentViewerResultSchema = z.object({
  version: z.literal(JUDGMENT_DRAWER_PRECEDENT_VIEWER_VERSION),
  workbenchScopeSlug: z.string(),
  generatedAt: z.string(),
  uiRoute: z.string(),
  items: z.array(judgmentDrawerPrecedentViewerItemSchema),
  completionRate: z.number(),
  judgmentDrawerPrecedentViewerReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type JudgmentDrawerPrecedentViewerResult = z.infer<typeof judgmentDrawerPrecedentViewerResultSchema>;
