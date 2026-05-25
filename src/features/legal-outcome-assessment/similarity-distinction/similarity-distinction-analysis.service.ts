/**
 * Product Phase 40-D — SimilarityDistinctionAnalysis service.
 */
import {
  JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
  SIMILARITY_DISTINCTION_ANALYSIS_ITEMS,
} from "./similarity-distinction-analysis.registry";
import { assembleSimilarityDistinctionAnalysis } from "./similarity-distinction-analysis.policy";
import type { SimilarityDistinctionAnalysisResult } from "./similarity-distinction-analysis.schema";

export const SIMILARITY_DISTINCTION_ANALYSIS_SERVICE_MARKER_40D =
  "phase40d-similarity-distinction-analysis-service" as const;

export function buildSimilarityDistinctionAnalysis(input?: {
  caseAssessmentScopeSlug?: string;
  definedItemIds?: string[];
}): SimilarityDistinctionAnalysisResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      SIMILARITY_DISTINCTION_ANALYSIS_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleSimilarityDistinctionAnalysis({
    caseAssessmentScopeSlug: input?.caseAssessmentScopeSlug ?? JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
