/**
 * Product Phase 38-B — Quarterly business review pack schema (Zod SSOT).
 */
import { z } from "zod";

export const QUARTERLY_BUSINESS_REVIEW_SCHEMA_MARKER_PHASE38B =
  "phase38b-quarterly-business-review-schema" as const;

export const QUARTERLY_BUSINESS_REVIEW_VERSION = "38-B.1" as const;

export const QUARTERLY_BUSINESS_REVIEW_ITEM_IDS = [
  "QBR_AGENDA_TEMPLATE",
  "USAGE_METRICS_DASHBOARD",
  "VALUE_REALIZATION_STORY",
  "ACTION_ITEMS_TRACKER",
  "EXECUTIVE_SUMMARY",
] as const;

export const quarterlyBusinessReviewItemSchema = z.object({
  itemId: z.enum(QUARTERLY_BUSINESS_REVIEW_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const quarterlyBusinessReviewPackResultSchema = z.object({
  version: z.literal(QUARTERLY_BUSINESS_REVIEW_VERSION),
  customerSuccessScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(quarterlyBusinessReviewItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  quarterlyBusinessReviewPackReady: z.boolean(),
});

export type QuarterlyBusinessReviewItemId = (typeof QUARTERLY_BUSINESS_REVIEW_ITEM_IDS)[number];
export type QuarterlyBusinessReviewPackResult = z.infer<
  typeof quarterlyBusinessReviewPackResultSchema
>;
