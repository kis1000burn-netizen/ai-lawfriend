/**
 * Product Phase 46-A — NeutralCaseSummaryView schema (Zod SSOT).
 */
import { z } from "zod";

export const NEUTRAL_CASE_SUMMARY_VIEW_SCHEMA_MARKER_46A =
  "phase46a-neutral-case-summary-view-schema" as const;

export const NEUTRAL_CASE_SUMMARY_VIEW_VERSION = "46-A.2" as const;

export const NEUTRAL_CASE_SUMMARY_VIEW_ITEM_IDS = [
  "NEUTRAL_SUMMARY_BODY",
  "NEUTRAL_TONE_CHECK",
  "PARTY_ROLE_NEUTRALITY",
  "SUMMARY_LAWYER_REVIEW",
] as const;

export const neutralcasesummaryviewItemSchema = z.object({
  itemId: z.enum(NEUTRAL_CASE_SUMMARY_VIEW_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const neutralcasesummaryviewResultSchema = z.object({
  version: z.literal("46-A.2"),
  neutralPackScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(neutralcasesummaryviewItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  neutralCaseSummaryViewReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type NeutralCaseSummaryViewItemId = (typeof NEUTRAL_CASE_SUMMARY_VIEW_ITEM_IDS)[number];
export type NeutralCaseSummaryViewResult = z.infer<typeof neutralcasesummaryviewResultSchema>;
