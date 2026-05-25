/**
 * Product Phase 45-C — SimilarityDifferenceUncertaintySignalEngine SSOT.
 */
import type { SimilarityDifferenceUncertaintySignalEngineResult } from "./similarity-difference-uncertainty-signal-engine.schema";

export const SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_REGISTRY_MARKER_45C =
  "phase45c-similarity-difference-uncertainty-signal-engine-registry" as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG = "judicial-transparency-explainability-001" as const;

type SimilarityDifferenceUncertaintySignalEngineItem = Omit<SimilarityDifferenceUncertaintySignalEngineResult["items"][number], "defined">;

export const SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_ITEMS: SimilarityDifferenceUncertaintySignalEngineItem[] = [
  { itemId: "SIMILARITY_ANALYSIS_TRACE", label: "Similarity analysis trace", required: true },
  { itemId: "DIFFERENCE_ANALYSIS_TRACE", label: "Difference analysis trace", required: true },
  { itemId: "UNCERTAINTY_SIGNAL_INDEX", label: "Uncertainty signal index", required: true },
  { itemId: "SIMILARITY_UNCERTAINTY_LAWYER_REVIEW", label: "Lawyer review of similarity/uncertainty", required: true },
];
