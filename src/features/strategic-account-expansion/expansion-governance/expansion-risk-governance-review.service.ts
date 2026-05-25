/**
 * Product Phase 39-E — Expansion risk / governance review service.
 */
import { STRATEGIC_ACCOUNT_EXPANSION_DEFAULT_SCOPE_SLUG } from "../account-plan/strategic-account-plan.registry";
import { EXPANSION_RISK_GOVERNANCE_ITEMS } from "./expansion-risk-governance-review.registry";
import { assembleExpansionRiskGovernanceReview } from "./expansion-risk-governance-review.policy";
import type { ExpansionRiskGovernanceReviewResult } from "./expansion-risk-governance-review.schema";

export const EXPANSION_RISK_GOVERNANCE_SERVICE_MARKER_PHASE39E =
  "phase39e-expansion-risk-governance-service" as const;

export function buildExpansionRiskGovernanceReview(input?: {
  strategicAccountScopeSlug?: string;
  definedItemIds?: string[];
}): ExpansionRiskGovernanceReviewResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      EXPANSION_RISK_GOVERNANCE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleExpansionRiskGovernanceReview({
    strategicAccountScopeSlug:
      input?.strategicAccountScopeSlug ?? STRATEGIC_ACCOUNT_EXPANSION_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
