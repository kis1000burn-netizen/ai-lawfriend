/**
 * Product Phase 41-C — SimilarSentencingOutcomeComparison SSOT.
 */
import type { SimilarSentencingOutcomeComparisonResult } from "./similar-sentencing-outcome-comparison.schema";

export const SIMILAR_SENTENCING_OUTCOME_COMPARISON_REGISTRY_MARKER_41C =
  "phase41c-similar-sentencing-outcome-comparison-registry" as const;

export const SENTENCING_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG = "sentencing-outcome-assessment-001" as const;

type SimilarSentencingOutcomeComparisonItem = Omit<SimilarSentencingOutcomeComparisonResult["items"][number], "defined">;

export const SIMILAR_SENTENCING_OUTCOME_COMPARISON_ITEMS: SimilarSentencingOutcomeComparisonItem[] = [
  { itemId: "OUTCOME_DISTRIBUTION", label: "Similar case sentencing outcome distribution", required: true },
  { itemId: "IMPRISONMENT_COUNT", label: "Imprisonment outcome count", required: true },
  { itemId: "SUSPENDED_COUNT", label: "Suspended sentence count", required: true },
  { itemId: "FINE_COUNT", label: "Fine outcome count", required: true },
  { itemId: "SENTENCING_RANGE_BAND", label: "Observed sentencing range band", required: true },
  { itemId: "COMPARISON_LAWYER_REVIEW", label: "Lawyer review of outcome comparison", required: true },
];
