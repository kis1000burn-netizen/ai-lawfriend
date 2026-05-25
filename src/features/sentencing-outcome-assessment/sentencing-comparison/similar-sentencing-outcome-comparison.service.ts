/**
 * Product Phase 41-C — SimilarSentencingOutcomeComparison service.
 */
import {
  SENTENCING_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
  SIMILAR_SENTENCING_OUTCOME_COMPARISON_ITEMS,
} from "./similar-sentencing-outcome-comparison.registry";
import { assembleSimilarSentencingOutcomeComparison } from "./similar-sentencing-outcome-comparison.policy";
import type { SimilarSentencingOutcomeComparisonResult } from "./similar-sentencing-outcome-comparison.schema";

export const SIMILAR_SENTENCING_OUTCOME_COMPARISON_SERVICE_MARKER_41C =
  "phase41c-similar-sentencing-outcome-comparison-service" as const;

export function buildSimilarSentencingOutcomeComparison(input?: {
  sentencingAssessmentScopeSlug?: string;
  definedItemIds?: string[];
}): SimilarSentencingOutcomeComparisonResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      SIMILAR_SENTENCING_OUTCOME_COMPARISON_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleSimilarSentencingOutcomeComparison({
    sentencingAssessmentScopeSlug: input?.sentencingAssessmentScopeSlug ?? SENTENCING_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
