/**
 * Product Phase 40-D — SimilarityDistinctionAnalysis schema (Zod SSOT).
 */
import { z } from "zod";

export const SIMILARITY_DISTINCTION_ANALYSIS_SCHEMA_MARKER_40D =
  "phase40d-similarity-distinction-analysis-schema" as const;

export const SIMILARITY_DISTINCTION_ANALYSIS_VERSION = "40-D.2" as const;

export const SIMILARITY_DISTINCTION_ANALYSIS_ITEM_IDS = [
  "SIMILAR_FACT_PATTERN",
  "DISTINCT_FACT_PATTERN",
  "SAME_LEGAL_HOLDING",
  "DIFFERENT_LEGAL_HOLDING",
  "APPLICATION_RISK_FLAG",
  "SIMILARITY_LAWYER_REVIEW",
] as const;

export const similarityDistinctionAnalysisItemSchema = z.object({
  itemId: z.enum(SIMILARITY_DISTINCTION_ANALYSIS_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const similarityDistinctionAnalysisResultSchema = z.object({
  version: z.literal("40-D.2"),
  caseAssessmentScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(similarityDistinctionAnalysisItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  similarityDistinctionAnalysisReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type SimilarityDistinctionAnalysisItemId = (typeof SIMILARITY_DISTINCTION_ANALYSIS_ITEM_IDS)[number];
export type SimilarityDistinctionAnalysisResult = z.infer<typeof similarityDistinctionAnalysisResultSchema>;
