/**
 * Product Phase 41-C — SimilarSentencingOutcomeComparison schema (Zod SSOT).
 */
import { z } from "zod";
import { sentencingAssessmentSectionSchema } from "../shared/sentencing-grounded-types.schema";

export const SIMILAR_SENTENCING_OUTCOME_COMPARISON_SCHEMA_MARKER_41C =
  "phase41c-similar-sentencing-outcome-comparison-schema" as const;

export const SIMILAR_SENTENCING_OUTCOME_COMPARISON_VERSION = "41-C.1" as const;

export const SIMILAR_SENTENCING_OUTCOME_COMPARISON_ITEM_IDS = [
  "OUTCOME_DISTRIBUTION",
  "IMPRISONMENT_COUNT",
  "SUSPENDED_COUNT",
  "FINE_COUNT",
  "SENTENCING_RANGE_BAND",
  "COMPARISON_LAWYER_REVIEW",
] as const;

export const similarSentencingOutcomeComparisonItemSchema = z.object({
  itemId: z.enum(SIMILAR_SENTENCING_OUTCOME_COMPARISON_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const similarSentencingOutcomeComparisonResultSchema = z.object({
  version: z.literal("41-C.1"),
  sentencingAssessmentScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(similarSentencingOutcomeComparisonItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  similarSentencingOutcomeComparisonReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
  clientVisibleBeforeReview: z.literal(false),
  sections: z.array(sentencingAssessmentSectionSchema).min(1),
});

export type SimilarSentencingOutcomeComparisonItemId = (typeof SIMILAR_SENTENCING_OUTCOME_COMPARISON_ITEM_IDS)[number];
export type SimilarSentencingOutcomeComparisonResult = z.infer<typeof similarSentencingOutcomeComparisonResultSchema>;
