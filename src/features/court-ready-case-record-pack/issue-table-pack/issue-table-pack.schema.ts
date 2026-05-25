/**
 * Product Phase 44-B — IssueTablePack schema (Zod SSOT).
 */
import { z } from "zod";

export const ISSUE_TABLE_PACK_SCHEMA_MARKER_44B =
  "phase44b-issue-table-pack-schema" as const;

export const ISSUE_TABLE_PACK_VERSION = "44-B.1" as const;

export const ISSUE_TABLE_PACK_ITEM_IDS = [
  "ISSUE_TABLE_ROWS",
  "BURDEN_OF_PROOF_COLUMN",
  "DISPUTED_UNDISPUTED_FLAGS",
  "ISSUE_TABLE_LAWYER_REVIEW",
] as const;

export const issue_table_packItemSchema = z.object({
  itemId: z.enum(ISSUE_TABLE_PACK_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const issue_table_packResultSchema = z.object({
  version: z.literal("44-B.1"),
  casePackScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(issue_table_packItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  issueTablePackReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type IssueTablePackItemId = (typeof ISSUE_TABLE_PACK_ITEM_IDS)[number];
export type IssueTablePackResult = z.infer<typeof issue_table_packResultSchema>;
