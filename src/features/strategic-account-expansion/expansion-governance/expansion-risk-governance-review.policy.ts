/**
 * Product Phase 39-E — Expansion risk / governance review policy SSOT.
 */
import { EXPANSION_RISK_GOVERNANCE_ITEMS } from "./expansion-risk-governance-review.registry";
import type { ExpansionRiskGovernanceReviewResult } from "./expansion-risk-governance-review.schema";
import { EXPANSION_RISK_GOVERNANCE_VERSION } from "./expansion-risk-governance-review.schema";

export const EXPANSION_RISK_GOVERNANCE_POLICY_MARKER_PHASE39E =
  "phase39e-expansion-risk-governance-policy" as const;

export function assembleExpansionRiskGovernanceReview(input: {
  strategicAccountScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): ExpansionRiskGovernanceReviewResult {
  const items = EXPANSION_RISK_GOVERNANCE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: EXPANSION_RISK_GOVERNANCE_VERSION,
    strategicAccountScopeSlug: input.strategicAccountScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    expansionRiskGovernanceReviewReady: definedRequired === required.length,
  };
}
