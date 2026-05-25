/**
 * Product Phase 46-D — MediationHearingPreparationPack service.
 */
import {
  NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG,
  MEDIATION_HEARING_PREPARATION_PACK_ITEMS,
} from "./mediation-hearing-preparation-pack.registry";
import { assembleMediationHearingPreparationPack } from "./mediation-hearing-preparation-pack.policy";
import type { MediationHearingPreparationPackResult } from "./mediation-hearing-preparation-pack.schema";

export const MEDIATION_HEARING_PREPARATION_PACK_SERVICE_MARKER_46D =
  "phase46d-mediation-hearing-preparation-pack-service" as const;

export function buildMediationHearingPreparationPack(input?: {
  neutralPackScopeSlug?: string;
  definedItemIds?: string[];
}): MediationHearingPreparationPackResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      MEDIATION_HEARING_PREPARATION_PACK_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleMediationHearingPreparationPack({
    neutralPackScopeSlug: input?.neutralPackScopeSlug ?? NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
