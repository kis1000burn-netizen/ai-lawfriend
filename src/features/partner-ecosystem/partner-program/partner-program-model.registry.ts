/**
 * Product Phase 31-A — Partner program model tiers SSOT.
 */
import type { PartnerProgramModelResult } from "./partner-program-model.schema";

export const PARTNER_PROGRAM_MODEL_REGISTRY_MARKER_PHASE31A =
  "phase31a-partner-program-model-registry" as const;

export const PARTNER_ECOSYSTEM_DEFAULT_NETWORK_SLUG = "partner-ecosystem-network-001" as const;

type PartnerProgramTier = Omit<PartnerProgramModelResult["tiers"][number], "enabled">;

export const PARTNER_PROGRAM_TIERS: PartnerProgramTier[] = [
  { tierId: "REFERRAL_AFFILIATE", label: "Referral affiliate partner", required: true },
  { tierId: "CO_COUNSEL", label: "Co-counsel network partner", required: true },
  { tierId: "BRANCH_OPERATOR", label: "Branch operator partner", required: true },
  { tierId: "EXPERT_SPECIALIST", label: "Expert specialist partner", required: true },
  { tierId: "MARKETPLACE_VENDOR", label: "Marketplace service vendor", required: false },
];
