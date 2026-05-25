/**
 * Product Phase 46-D — MediationHearingPreparationPack SSOT.
 */
import type { MediationHearingPreparationPackResult } from "./mediation-hearing-preparation-pack.schema";

export const MEDIATION_HEARING_PREPARATION_PACK_REGISTRY_MARKER_46D =
  "phase46d-mediation-hearing-preparation-pack-registry" as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG = "neutral-litigation-review-pack-001" as const;

type MediationHearingPreparationPackItem = Omit<MediationHearingPreparationPackResult["items"][number], "defined">;

export const MEDIATION_HEARING_PREPARATION_PACK_ITEMS: MediationHearingPreparationPackItem[] = [
  { itemId: "MEDIATION_PREP_SECTIONS", label: "Mediation preparation sections", required: true },
  { itemId: "HEARING_PREP_SECTIONS", label: "Hearing preparation sections", required: true },
  { itemId: "NO_DIRECT_COURT_ACCESS_GUARD", label: "No direct court access guard", required: true },
  { itemId: "NO_MEDIATOR_PORTAL_DEFAULT_GUARD", label: "No mediator portal by default guard", required: true },
];
