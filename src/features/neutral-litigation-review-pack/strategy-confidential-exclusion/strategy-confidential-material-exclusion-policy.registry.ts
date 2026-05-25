/**
 * Product Phase 46-B — StrategyConfidentialMaterialExclusionPolicy SSOT.
 */
import type { StrategyConfidentialMaterialExclusionPolicyResult } from "./strategy-confidential-material-exclusion-policy.schema";

export const STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_REGISTRY_MARKER_46B =
  "phase46b-strategy-confidential-material-exclusion-policy-registry" as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG = "neutral-litigation-review-pack-001" as const;

type StrategyConfidentialMaterialExclusionPolicyItem = Omit<StrategyConfidentialMaterialExclusionPolicyResult["items"][number], "defined">;

export const STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_ITEMS: StrategyConfidentialMaterialExclusionPolicyItem[] = [
  { itemId: "STRATEGY_GRAPH_EXCLUSION", label: "Internal strategy graph exclusion", required: true },
  { itemId: "UNREVIEWED_AI_EXCLUSION", label: "Unreviewed AI output exclusion", required: true },
  { itemId: "CONFIDENTIAL_MEMO_EXCLUSION", label: "Client confidential memo exclusion", required: true },
  { itemId: "EXCLUSION_AUDIT_LOG", label: "Exclusion audit log", required: true },
];
