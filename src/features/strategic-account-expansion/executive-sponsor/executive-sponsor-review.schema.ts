/**
 * Product Phase 39-D — Executive sponsor review schema (Zod SSOT).
 */
import { z } from "zod";

export const EXECUTIVE_SPONSOR_REVIEW_SCHEMA_MARKER_PHASE39D =
  "phase39d-executive-sponsor-review-schema" as const;

export const EXECUTIVE_SPONSOR_REVIEW_VERSION = "39-D.1" as const;

export const EXECUTIVE_SPONSOR_REVIEW_ITEM_IDS = [
  "SPONSOR_ASSIGNMENT",
  "EXECUTIVE_ALIGNMENT",
  "QUARTERLY_SPONSOR_TOUCH",
  "ESCALATION_PATH",
  "SPONSOR_SIGNOFF",
] as const;

export const executiveSponsorReviewItemSchema = z.object({
  itemId: z.enum(EXECUTIVE_SPONSOR_REVIEW_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const executiveSponsorReviewResultSchema = z.object({
  version: z.literal(EXECUTIVE_SPONSOR_REVIEW_VERSION),
  strategicAccountScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(executiveSponsorReviewItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  executiveSponsorReviewReady: z.boolean(),
});

export type ExecutiveSponsorReviewItemId = (typeof EXECUTIVE_SPONSOR_REVIEW_ITEM_IDS)[number];
export type ExecutiveSponsorReviewResult = z.infer<typeof executiveSponsorReviewResultSchema>;
