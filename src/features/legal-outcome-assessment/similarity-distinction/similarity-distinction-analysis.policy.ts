/**
 * Product Phase 40-D — SimilarityDistinctionAnalysis policy SSOT.
 */
import { SIMILARITY_DISTINCTION_ANALYSIS_ITEMS } from "./similarity-distinction-analysis.registry";
import type { SimilarityDistinctionAnalysisResult } from "./similarity-distinction-analysis.schema";
import { SIMILARITY_DISTINCTION_ANALYSIS_VERSION } from "./similarity-distinction-analysis.schema";

export const SIMILARITY_DISTINCTION_ANALYSIS_POLICY_MARKER_40D =
  "phase40d-similarity-distinction-analysis-policy" as const;

export const SIMILARITY_DISTINCTION_ANALYSIS_GATE_MARKER_40D =
  "phase40d-similarity-distinction-analysis-gate" as const;

export const JUDGMENT_GROUNDED_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;


export function assembleSimilarityDistinctionAnalysis(input: {
  caseAssessmentScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): SimilarityDistinctionAnalysisResult {
  const items = SIMILARITY_DISTINCTION_ANALYSIS_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: SIMILARITY_DISTINCTION_ANALYSIS_VERSION,
    caseAssessmentScopeSlug: input.caseAssessmentScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    similarityDistinctionAnalysisReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
