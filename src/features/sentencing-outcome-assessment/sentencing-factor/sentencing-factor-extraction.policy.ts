/**
 * Product Phase 41-B — SentencingFactorExtraction policy SSOT.
 */
import { SENTENCING_FACTOR_EXTRACTION_ITEMS } from "./sentencing-factor-extraction.registry";
import type { SentencingFactorExtractionResult } from "./sentencing-factor-extraction.schema";
import { SENTENCING_FACTOR_EXTRACTION_VERSION } from "./sentencing-factor-extraction.schema";

export const SENTENCING_FACTOR_EXTRACTION_POLICY_MARKER_41B =
  "phase41b-sentencing-factor-extraction-policy" as const;

export const SENTENCING_FACTOR_EXTRACTION_GATE_MARKER_41B =
  "phase41b-sentencing-factor-extraction-gate" as const;

export const SENTENCING_GROUNDED_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;

export const SENTENCING_FACTOR_BOUNDARY_SENTENCING_REASON_REQUIRED =
  "SENTENCING_REASON_REQUIRED" as const;

export function assembleSentencingFactorExtraction(input: {
  sentencingAssessmentScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): SentencingFactorExtractionResult {
  const items = SENTENCING_FACTOR_EXTRACTION_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: SENTENCING_FACTOR_EXTRACTION_VERSION,
    sentencingAssessmentScopeSlug: input.sentencingAssessmentScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    sentencingFactorExtractionReady: definedRequired === required.length,
    lawyerReviewRequired: true,
    clientVisibleBeforeReview: false,
  };
}
