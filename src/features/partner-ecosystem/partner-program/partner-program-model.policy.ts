/**
 * Product Phase 31-A — Partner program model policy SSOT.
 */
import { PARTNER_PROGRAM_TIERS } from "./partner-program-model.registry";
import type { PartnerProgramModelResult } from "./partner-program-model.schema";
import { PARTNER_PROGRAM_MODEL_VERSION } from "./partner-program-model.schema";

export const PARTNER_PROGRAM_MODEL_POLICY_MARKER_PHASE31A =
  "phase31a-partner-program-model-policy" as const;

export const PARTNER_PROGRAM_MODEL_GATE_MARKER_PHASE31A = "phase31a-partner-program-gate" as const;

export function assemblePartnerProgramModel(input: {
  networkSlug: string;
  enabledTierIds: Set<string>;
  generatedAt?: string;
}): PartnerProgramModelResult {
  const tiers = PARTNER_PROGRAM_TIERS.map((tier) => ({
    ...tier,
    enabled: input.enabledTierIds.has(tier.tierId),
  }));

  const required = tiers.filter((tier) => tier.required);
  const enabledRequired = required.filter((tier) => tier.enabled).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((enabledRequired / required.length) * 100);

  return {
    version: PARTNER_PROGRAM_MODEL_VERSION,
    networkSlug: input.networkSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    tiers,
    completionRate,
    partnerProgramReady: enabledRequired === required.length,
  };
}
