/**
 * Product Phase 28-C — SLA / support tier policy SSOT.
 */
import { SLA_SUPPORT_TIER_DEFINITIONS } from "./sla-support-tier-policy.registry";
import type { SlaSupportTierPolicyResult } from "./sla-support-tier-policy.schema";
import { SLA_SUPPORT_TIER_POLICY_VERSION } from "./sla-support-tier-policy.schema";

export const SLA_SUPPORT_TIER_POLICY_POLICY_MARKER_PHASE28C =
  "phase28c-sla-support-tier-policy-policy" as const;

export function assembleSlaSupportTierPolicy(input: {
  selectedTierId: SlaSupportTierPolicyResult["selectedTierId"];
  configuredTierIds: Set<string>;
  generatedAt?: string;
}): SlaSupportTierPolicyResult {
  const tiers = SLA_SUPPORT_TIER_DEFINITIONS.map((tier) => ({
    ...tier,
    configured: input.configuredTierIds.has(tier.tierId),
  }));

  const selectedConfigured = tiers.some(
    (tier) => tier.tierId === input.selectedTierId && tier.configured,
  );

  return {
    version: SLA_SUPPORT_TIER_POLICY_VERSION,
    selectedTierId: input.selectedTierId,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    tiers,
    slaPolicyReady: selectedConfigured,
  };
}
