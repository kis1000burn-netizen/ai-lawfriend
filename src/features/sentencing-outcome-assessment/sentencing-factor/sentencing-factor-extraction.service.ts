/**
 * Product Phase 41-B — SentencingFactorExtraction service.
 */
import {
  SENTENCING_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
  SENTENCING_FACTOR_EXTRACTION_ITEMS,
} from "./sentencing-factor-extraction.registry";
import { assembleSentencingFactorExtraction } from "./sentencing-factor-extraction.policy";
import type { SentencingFactorExtractionResult } from "./sentencing-factor-extraction.schema";

export const SENTENCING_FACTOR_EXTRACTION_SERVICE_MARKER_41B =
  "phase41b-sentencing-factor-extraction-service" as const;

export function buildSentencingFactorExtraction(input?: {
  sentencingAssessmentScopeSlug?: string;
  definedItemIds?: string[];
}): SentencingFactorExtractionResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      SENTENCING_FACTOR_EXTRACTION_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleSentencingFactorExtraction({
    sentencingAssessmentScopeSlug: input?.sentencingAssessmentScopeSlug ?? SENTENCING_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
