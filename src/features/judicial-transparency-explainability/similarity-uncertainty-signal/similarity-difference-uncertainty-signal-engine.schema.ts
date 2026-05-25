/**
 * Product Phase 45-C — SimilarityDifferenceUncertaintySignalEngine schema (Zod SSOT).
 */
import { z } from "zod";

export const SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_SCHEMA_MARKER_45C =
  "phase45c-similarity-difference-uncertainty-signal-engine-schema" as const;

export const SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_VERSION = "45-C.1" as const;

export const SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_ITEM_IDS = [
  "SIMILARITY_ANALYSIS_TRACE",
  "DIFFERENCE_ANALYSIS_TRACE",
  "UNCERTAINTY_SIGNAL_INDEX",
  "SIMILARITY_UNCERTAINTY_LAWYER_REVIEW",
] as const;

export const similaritydifferenceuncertaintysignalengineItemSchema = z.object({
  itemId: z.enum(SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const similaritydifferenceuncertaintysignalengineResultSchema = z.object({
  version: z.literal("45-C.1"),
  explainabilityScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(similaritydifferenceuncertaintysignalengineItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  similarityDifferenceUncertaintySignalEngineReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type SimilarityDifferenceUncertaintySignalEngineItemId = (typeof SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_ITEM_IDS)[number];
export type SimilarityDifferenceUncertaintySignalEngineResult = z.infer<typeof similaritydifferenceuncertaintysignalengineResultSchema>;
