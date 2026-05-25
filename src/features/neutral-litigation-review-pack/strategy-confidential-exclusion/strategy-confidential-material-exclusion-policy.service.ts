/**
 * Product Phase 46-B — StrategyConfidentialMaterialExclusionPolicy service.
 */
import {
  NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG,
  STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_ITEMS,
} from "./strategy-confidential-material-exclusion-policy.registry";
import { assembleStrategyConfidentialMaterialExclusionPolicy } from "./strategy-confidential-material-exclusion-policy.policy";
import type { StrategyConfidentialMaterialExclusionPolicyResult } from "./strategy-confidential-material-exclusion-policy.schema";

export const STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_SERVICE_MARKER_46B =
  "phase46b-strategy-confidential-material-exclusion-policy-service" as const;

export function buildStrategyConfidentialMaterialExclusionPolicy(input?: {
  neutralPackScopeSlug?: string;
  definedItemIds?: string[];
}): StrategyConfidentialMaterialExclusionPolicyResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleStrategyConfidentialMaterialExclusionPolicy({
    neutralPackScopeSlug: input?.neutralPackScopeSlug ?? NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
