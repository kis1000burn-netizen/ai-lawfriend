/**
 * Product Phase 46-E — NeutralPackReviewWorkspace schema (Zod SSOT).
 */
import { z } from "zod";
import { neutralLitigationReviewPackSchema } from "../shared/neutral-litigation-review-pack-types.schema";

export const NEUTRAL_PACK_REVIEW_WORKSPACE_SCHEMA_MARKER_46E =
  "phase46e-neutral-pack-review-workspace-schema" as const;

export const NEUTRAL_PACK_REVIEW_WORKSPACE_VERSION = "46-E.2" as const;

export const NEUTRAL_PACK_REVIEW_WORKSPACE_ITEM_IDS = [
  "PACK_SECTION_REVIEW",
  "EXPORT_READINESS_GATE",
  "OFFICIAL_CLARIFICATION_ACK",
  "NEUTRAL_PACK_LAWYER_REVIEW",
] as const;

export const neutralpackreviewworkspaceItemSchema = z.object({
  itemId: z.enum(NEUTRAL_PACK_REVIEW_WORKSPACE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const neutralpackreviewworkspaceResultSchema = z.object({
  version: z.literal("46-E.2"),
  neutralPackScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(neutralpackreviewworkspaceItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  neutralPackReviewWorkspaceReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
  sampleNeutralPack: neutralLitigationReviewPackSchema,
});

export type NeutralPackReviewWorkspaceItemId = (typeof NEUTRAL_PACK_REVIEW_WORKSPACE_ITEM_IDS)[number];
export type NeutralPackReviewWorkspaceResult = z.infer<typeof neutralpackreviewworkspaceResultSchema>;
