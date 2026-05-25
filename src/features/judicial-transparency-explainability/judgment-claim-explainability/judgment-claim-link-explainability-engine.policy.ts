/**
 * Product Phase 45-B — JudgmentClaimLinkExplainabilityEngine policy SSOT.
 */
import { JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_ITEMS, JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG } from "./judgment-claim-link-explainability-engine.registry";
import type { JudgmentClaimLinkExplainabilityEngineResult } from "./judgment-claim-link-explainability-engine.schema";
import { JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_VERSION } from "./judgment-claim-link-explainability-engine.schema";

export const JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_POLICY_MARKER_45B =
  "phase45b-judgment-claim-link-explainability-engine-policy" as const;

export const JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_GATE_MARKER_45B =
  "phase45b-judgment-claim-link-explainability-engine-gate" as const;

export const EXPLAINABILITY_BOUNDARY_NO_HIDDEN_SOURCE_OMISSION =
  "NO_HIDDEN_SOURCE_OMISSION" as const;


export function assembleJudgmentClaimLinkExplainabilityEngine(input: {
  explainabilityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): JudgmentClaimLinkExplainabilityEngineResult {
  const items = JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_VERSION,
    explainabilityScopeSlug: input.explainabilityScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    judgmentClaimLinkExplainabilityEngineReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
