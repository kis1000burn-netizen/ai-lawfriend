/**
 * Product Phase 45-C — SimilarityDifferenceUncertaintySignalEngine policy SSOT.
 */
import { SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_ITEMS, JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG } from "./similarity-difference-uncertainty-signal-engine.registry";
import type { SimilarityDifferenceUncertaintySignalEngineResult } from "./similarity-difference-uncertainty-signal-engine.schema";
import { SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_VERSION } from "./similarity-difference-uncertainty-signal-engine.schema";

export const SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_POLICY_MARKER_45C =
  "phase45c-similarity-difference-uncertainty-signal-engine-policy" as const;

export const SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_GATE_MARKER_45C =
  "phase45c-similarity-difference-uncertainty-signal-engine-gate" as const;


export function assembleSimilarityDifferenceUncertaintySignalEngine(input: {
  explainabilityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): SimilarityDifferenceUncertaintySignalEngineResult {
  const items = SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_VERSION,
    explainabilityScopeSlug: input.explainabilityScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    similarityDifferenceUncertaintySignalEngineReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
