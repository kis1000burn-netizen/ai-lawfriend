/**
 * Product Phase 48-E — Court-ready Pack Builder UX schema SSOT.
 */
import { z } from "zod";

export const COURT_READY_PACK_BUILDER_UX_VERSION = "48-E.1" as const;

export const COURT_READY_PACK_BUILDER_UX_ITEM_IDS = ["CASE_SUMMARY_SECTION", "ISSUE_TABLE", "EVIDENCE_LIST", "JUDGMENT_BASIS_TABLE", "PROCEDURE_HISTORY", "REVIEW_STATUS", "NEUTRAL_PACK_GENERATE", "EXPORT_CANDIDATE"] as const;

export const courtReadyPackBuilderUxItemIdSchema = z.enum(COURT_READY_PACK_BUILDER_UX_ITEM_IDS);

export const courtReadyPackBuilderUxItemSchema = z.object({
  itemId: courtReadyPackBuilderUxItemIdSchema,
  label: z.string(),
  required: z.boolean(),
  defined: z.boolean(),
  uiRoute: z.string().optional(),
});

export const courtReadyPackBuilderUxResultSchema = z.object({
  version: z.literal(COURT_READY_PACK_BUILDER_UX_VERSION),
  workbenchScopeSlug: z.string(),
  generatedAt: z.string(),
  uiRoute: z.string(),
  items: z.array(courtReadyPackBuilderUxItemSchema),
  completionRate: z.number(),
  courtReadyPackBuilderUxReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type CourtReadyPackBuilderUxResult = z.infer<typeof courtReadyPackBuilderUxResultSchema>;
