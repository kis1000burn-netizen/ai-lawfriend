/**
 * Product Phase 28-C — SLA / support tier definitions SSOT.
 */
import type { SlaSupportTierPolicyResult } from "./sla-support-tier-policy.schema";

export const SLA_SUPPORT_TIER_POLICY_REGISTRY_MARKER_PHASE28C =
  "phase28c-sla-support-tier-policy-registry" as const;

type TierDef = Omit<SlaSupportTierPolicyResult["tiers"][number], "configured">;

export const SLA_SUPPORT_TIER_DEFINITIONS: TierDef[] = [
  { tierId: "STANDARD", label: "Standard · business hours", responseTimeHours: 24, uptimeSlaPercent: 99.5 },
  {
    tierId: "PROFESSIONAL",
    label: "Professional · extended hours",
    responseTimeHours: 8,
    uptimeSlaPercent: 99.9,
  },
  {
    tierId: "ENTERPRISE",
    label: "Enterprise · 24/7 P0",
    responseTimeHours: 1,
    uptimeSlaPercent: 99.95,
  },
];
