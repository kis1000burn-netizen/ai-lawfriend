/**
 * Product Phase 46-B — StrategyConfidentialMaterialExclusionPolicy policy SSOT.
 */
import { STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_ITEMS, NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG } from "./strategy-confidential-material-exclusion-policy.registry";
import type { StrategyConfidentialMaterialExclusionPolicyResult } from "./strategy-confidential-material-exclusion-policy.schema";
import { STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_VERSION } from "./strategy-confidential-material-exclusion-policy.schema";

export const STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_POLICY_MARKER_46B =
  "phase46b-strategy-confidential-material-exclusion-policy-policy" as const;

export const STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_GATE_MARKER_46B =
  "phase46b-strategy-confidential-material-exclusion-policy-gate" as const;

export const NEUTRAL_PACK_BOUNDARY_NO_INTERNAL_STRATEGY_IN_NEUTRAL_PACK =
  "NO_INTERNAL_STRATEGY_IN_NEUTRAL_PACK" as const;
export const NEUTRAL_PACK_BOUNDARY_NO_UNREVIEWED_AI_OUTPUT =
  "NO_UNREVIEWED_AI_OUTPUT" as const;
export const NEUTRAL_PACK_BOUNDARY_NO_CLIENT_CONFIDENTIAL_MEMO =
  "NO_CLIENT_CONFIDENTIAL_MEMO" as const;


export function assembleStrategyConfidentialMaterialExclusionPolicy(input: {
  neutralPackScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): StrategyConfidentialMaterialExclusionPolicyResult {
  const items = STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_VERSION,
    neutralPackScopeSlug: input.neutralPackScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    strategyConfidentialMaterialExclusionPolicyReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
