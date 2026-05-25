/**
 * Product Phase 31-A — Partner program model service.
 */
import {
  PARTNER_ECOSYSTEM_DEFAULT_NETWORK_SLUG,
  PARTNER_PROGRAM_TIERS,
} from "./partner-program-model.registry";
import { assemblePartnerProgramModel } from "./partner-program-model.policy";
import type { PartnerProgramModelResult } from "./partner-program-model.schema";

export const PARTNER_PROGRAM_MODEL_SERVICE_MARKER_PHASE31A =
  "phase31a-partner-program-model-service" as const;

export function buildPartnerProgramModel(input?: {
  networkSlug?: string;
  enabledTierIds?: string[];
}): PartnerProgramModelResult {
  const enabledTierIds = new Set(
    input?.enabledTierIds ??
      PARTNER_PROGRAM_TIERS.filter((tier) => tier.required).map((tier) => tier.tierId),
  );

  return assemblePartnerProgramModel({
    networkSlug: input?.networkSlug ?? PARTNER_ECOSYSTEM_DEFAULT_NETWORK_SLUG,
    enabledTierIds,
  });
}
