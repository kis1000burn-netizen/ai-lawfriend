/**
 * Product Phase 44-A — CaseSummaryPack schema (Zod SSOT).
 */
import { z } from "zod";

export const CASE_SUMMARY_PACK_SCHEMA_MARKER_44A =
  "phase44a-case-summary-pack-schema" as const;

export const CASE_SUMMARY_PACK_VERSION = "44-A.1" as const;

export const CASE_SUMMARY_PACK_ITEM_IDS = [
  "CASE_FACTS_SUMMARY",
  "PARTY_ROLES_SUMMARY",
  "PROCEDURAL_POSTURE",
  "NEUTRAL_TONE_CHECK",
  "SUMMARY_LAWYER_REVIEW",
] as const;

export const case_summary_packItemSchema = z.object({
  itemId: z.enum(CASE_SUMMARY_PACK_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const case_summary_packResultSchema = z.object({
  version: z.literal("44-A.1"),
  casePackScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(case_summary_packItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  caseSummaryPackReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type CaseSummaryPackItemId = (typeof CASE_SUMMARY_PACK_ITEM_IDS)[number];
export type CaseSummaryPackResult = z.infer<typeof case_summary_packResultSchema>;
