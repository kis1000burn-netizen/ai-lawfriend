/**
 * Product Phase 28-C — SLA / support tier policy service.
 */
import { assembleSlaSupportTierPolicy } from "./sla-support-tier-policy.policy";
import type { SlaSupportTierPolicyResult } from "./sla-support-tier-policy.schema";

export const SLA_SUPPORT_TIER_POLICY_SERVICE_MARKER_PHASE28C =
  "phase28c-sla-support-tier-policy-service" as const;

export function buildSlaSupportTierPolicy(input?: {
  selectedTierId?: SlaSupportTierPolicyResult["selectedTierId"];
  configuredTierIds?: string[];
}): SlaSupportTierPolicyResult {
  const selectedTierId = input?.selectedTierId ?? "PROFESSIONAL";
  const configuredTierIds = new Set(input?.configuredTierIds ?? [selectedTierId]);

  return assembleSlaSupportTierPolicy({ selectedTierId, configuredTierIds });
}
