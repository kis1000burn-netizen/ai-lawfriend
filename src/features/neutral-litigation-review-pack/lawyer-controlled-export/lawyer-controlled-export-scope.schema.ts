/**
 * Product Phase 46-C — LawyerControlledExportScope schema (Zod SSOT).
 */
import { z } from "zod";

export const LAWYER_CONTROLLED_EXPORT_SCOPE_SCHEMA_MARKER_46C =
  "phase46c-lawyer-controlled-export-scope-schema" as const;

export const LAWYER_CONTROLLED_EXPORT_SCOPE_VERSION = "46-C.2" as const;

export const LAWYER_CONTROLLED_EXPORT_SCOPE_ITEM_IDS = [
  "EXPORT_SCOPE_SELECTION",
  "OPPOSING_PARTY_SHARE_BLOCK",
  "EXPORT_AUDIT_TRAIL",
  "EXPORT_LAWYER_REVIEW",
] as const;

export const lawyercontrolledexportscopeItemSchema = z.object({
  itemId: z.enum(LAWYER_CONTROLLED_EXPORT_SCOPE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const lawyercontrolledexportscopeResultSchema = z.object({
  version: z.literal("46-C.2"),
  neutralPackScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(lawyercontrolledexportscopeItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  lawyerControlledExportScopeReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type LawyerControlledExportScopeItemId = (typeof LAWYER_CONTROLLED_EXPORT_SCOPE_ITEM_IDS)[number];
export type LawyerControlledExportScopeResult = z.infer<typeof lawyercontrolledexportscopeResultSchema>;
