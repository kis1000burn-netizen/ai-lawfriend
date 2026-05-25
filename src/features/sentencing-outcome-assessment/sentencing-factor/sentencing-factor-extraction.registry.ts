/**
 * Product Phase 41-B — SentencingFactorExtraction SSOT.
 */
import type { SentencingFactorExtractionResult } from "./sentencing-factor-extraction.schema";

export const SENTENCING_FACTOR_EXTRACTION_REGISTRY_MARKER_41B =
  "phase41b-sentencing-factor-extraction-registry" as const;

export const SENTENCING_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG = "sentencing-outcome-assessment-001" as const;

type SentencingFactorExtractionItem = Omit<SentencingFactorExtractionResult["items"][number], "defined">;

export const SENTENCING_FACTOR_EXTRACTION_ITEMS: SentencingFactorExtractionItem[] = [
  { itemId: "FAVORABLE_FACTOR_EXTRACT", label: "Favorable sentencing factor extraction", required: true },
  { itemId: "UNFAVORABLE_FACTOR_EXTRACT", label: "Unfavorable sentencing factor extraction", required: true },
  { itemId: "NEUTRAL_FACTOR_EXTRACT", label: "Neutral sentencing factor extraction", required: true },
  { itemId: "COMPARABLE_FACTOR_MAP", label: "Comparable factor mapping", required: true },
  { itemId: "SENTENCING_REASON_EXTRACT", label: "Sentencing reason paragraph extraction", required: true },
  { itemId: "FACTOR_LAWYER_REVIEW", label: "Lawyer review of factor extraction", required: true },
];
