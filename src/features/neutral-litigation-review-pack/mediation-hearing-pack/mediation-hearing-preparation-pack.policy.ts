/**
 * Product Phase 46-D — MediationHearingPreparationPack policy SSOT.
 */
import { MEDIATION_HEARING_PREPARATION_PACK_ITEMS, NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG } from "./mediation-hearing-preparation-pack.registry";
import type { MediationHearingPreparationPackResult } from "./mediation-hearing-preparation-pack.schema";
import { MEDIATION_HEARING_PREPARATION_PACK_VERSION } from "./mediation-hearing-preparation-pack.schema";

export const MEDIATION_HEARING_PREPARATION_PACK_POLICY_MARKER_46D =
  "phase46d-mediation-hearing-preparation-pack-policy" as const;

export const MEDIATION_HEARING_PREPARATION_PACK_GATE_MARKER_46D =
  "phase46d-mediation-hearing-preparation-pack-gate" as const;

export const NEUTRAL_PACK_BOUNDARY_NO_DIRECT_COURT_ACCESS =
  "NO_DIRECT_COURT_ACCESS" as const;
export const NEUTRAL_PACK_BOUNDARY_NO_MEDIATOR_PORTAL_BY_DEFAULT =
  "NO_MEDIATOR_PORTAL_BY_DEFAULT" as const;


export function assembleMediationHearingPreparationPack(input: {
  neutralPackScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): MediationHearingPreparationPackResult {
  const items = MEDIATION_HEARING_PREPARATION_PACK_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: MEDIATION_HEARING_PREPARATION_PACK_VERSION,
    neutralPackScopeSlug: input.neutralPackScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    mediationHearingPreparationPackReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
