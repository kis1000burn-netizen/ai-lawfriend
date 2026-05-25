/**
 * Product Phase 46 — Neutral Litigation Review Pack shared types (Zod SSOT).
 */
import { z } from "zod";

export const NEUTRAL_LITIGATION_REVIEW_PACK_TYPES_SCHEMA_MARKER_PHASE46 =
  "phase46-neutral-litigation-review-pack-types-schema" as const;

export const neutralLitigationReviewPackSchema = z.object({
  packId: z.string().min(1),
  neutralPackScopeSlug: z.string().min(1),
  directCourtAccess: z.literal(false),
  mediatorPortalByDefault: z.literal(false),
  opposingPartyAutoShare: z.literal(false),
  lawyerControlledExportOnly: z.literal(true),
  internalStrategyInNeutralPack: z.literal(false),
  unreviewedAiOutputIncluded: z.literal(false),
  clientConfidentialMemoIncluded: z.literal(false),
  lawyerReviewRequired: z.literal(true),
  visibleSections: z.array(z.string().min(1)).min(1),
});

export type NeutralLitigationReviewPack = z.infer<typeof neutralLitigationReviewPackSchema>;
