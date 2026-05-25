/**
 * Product Phase 45-C — SimilarityDifferenceUncertaintySignalEngine service.
 */
import {
  JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG,
  SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_ITEMS,
} from "./similarity-difference-uncertainty-signal-engine.registry";
import { assembleSimilarityDifferenceUncertaintySignalEngine } from "./similarity-difference-uncertainty-signal-engine.policy";
import type { SimilarityDifferenceUncertaintySignalEngineResult } from "./similarity-difference-uncertainty-signal-engine.schema";

export const SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_SERVICE_MARKER_45C =
  "phase45c-similarity-difference-uncertainty-signal-engine-service" as const;

export function buildSimilarityDifferenceUncertaintySignalEngine(input?: {
  explainabilityScopeSlug?: string;
  definedItemIds?: string[];
}): SimilarityDifferenceUncertaintySignalEngineResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleSimilarityDifferenceUncertaintySignalEngine({
    explainabilityScopeSlug:
      input?.explainabilityScopeSlug ?? JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
