/**
 * Product Phase 46-D — MediationHearingPreparationPack schema (Zod SSOT).
 */
import { z } from "zod";

export const MEDIATION_HEARING_PREPARATION_PACK_SCHEMA_MARKER_46D =
  "phase46d-mediation-hearing-preparation-pack-schema" as const;

export const MEDIATION_HEARING_PREPARATION_PACK_VERSION = "46-D.2" as const;

export const MEDIATION_HEARING_PREPARATION_PACK_ITEM_IDS = [
  "MEDIATION_PREP_SECTIONS",
  "HEARING_PREP_SECTIONS",
  "NO_DIRECT_COURT_ACCESS_GUARD",
  "NO_MEDIATOR_PORTAL_DEFAULT_GUARD",
] as const;

export const mediationhearingpreparationpackItemSchema = z.object({
  itemId: z.enum(MEDIATION_HEARING_PREPARATION_PACK_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const mediationhearingpreparationpackResultSchema = z.object({
  version: z.literal("46-D.2"),
  neutralPackScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(mediationhearingpreparationpackItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  mediationHearingPreparationPackReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type MediationHearingPreparationPackItemId = (typeof MEDIATION_HEARING_PREPARATION_PACK_ITEM_IDS)[number];
export type MediationHearingPreparationPackResult = z.infer<typeof mediationhearingpreparationpackResultSchema>;
