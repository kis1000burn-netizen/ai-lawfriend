/**
 * Product Phase 41-B — SentencingFactorExtraction schema (Zod SSOT).
 */
import { z } from "zod";

export const SENTENCING_FACTOR_EXTRACTION_SCHEMA_MARKER_41B =
  "phase41b-sentencing-factor-extraction-schema" as const;

export const SENTENCING_FACTOR_EXTRACTION_VERSION = "41-B.1" as const;

export const SENTENCING_FACTOR_EXTRACTION_ITEM_IDS = [
  "FAVORABLE_FACTOR_EXTRACT",
  "UNFAVORABLE_FACTOR_EXTRACT",
  "NEUTRAL_FACTOR_EXTRACT",
  "COMPARABLE_FACTOR_MAP",
  "SENTENCING_REASON_EXTRACT",
  "FACTOR_LAWYER_REVIEW",
] as const;

export const sentencingFactorExtractionItemSchema = z.object({
  itemId: z.enum(SENTENCING_FACTOR_EXTRACTION_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const sentencingFactorExtractionResultSchema = z.object({
  version: z.literal("41-B.1"),
  sentencingAssessmentScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(sentencingFactorExtractionItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  sentencingFactorExtractionReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
  clientVisibleBeforeReview: z.literal(false),
});

export type SentencingFactorExtractionItemId = (typeof SENTENCING_FACTOR_EXTRACTION_ITEM_IDS)[number];
export type SentencingFactorExtractionResult = z.infer<typeof sentencingFactorExtractionResultSchema>;
