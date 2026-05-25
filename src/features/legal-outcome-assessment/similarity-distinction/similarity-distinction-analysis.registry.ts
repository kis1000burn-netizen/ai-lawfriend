/**
 * Product Phase 40-D — SimilarityDistinctionAnalysis SSOT.
 */
import type { SimilarityDistinctionAnalysisResult } from "./similarity-distinction-analysis.schema";

export const SIMILARITY_DISTINCTION_ANALYSIS_REGISTRY_MARKER_40D =
  "phase40d-similarity-distinction-analysis-registry" as const;

export const JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG = "judgment-grounded-outcome-assessment-001" as const;

type SimilarityDistinctionAnalysisItem = Omit<SimilarityDistinctionAnalysisResult["items"][number], "defined">;

export const SIMILARITY_DISTINCTION_ANALYSIS_ITEMS: SimilarityDistinctionAnalysisItem[] = [
  { itemId: "SIMILAR_FACT_PATTERN", label: "Similar fact pattern analysis", required: true },
  { itemId: "DISTINCT_FACT_PATTERN", label: "Distinct fact pattern analysis", required: true },
  { itemId: "SAME_LEGAL_HOLDING", label: "Same legal holding alignment", required: true },
  { itemId: "DIFFERENT_LEGAL_HOLDING", label: "Different legal holding distinction", required: true },
  { itemId: "APPLICATION_RISK_FLAG", label: "Application risk flag", required: true },
  { itemId: "SIMILARITY_LAWYER_REVIEW", label: "Lawyer review of similarity analysis", required: true },
];
