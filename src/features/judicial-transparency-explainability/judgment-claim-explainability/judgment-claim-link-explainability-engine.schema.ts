/**
 * Product Phase 45-B — JudgmentClaimLinkExplainabilityEngine schema (Zod SSOT).
 */
import { z } from "zod";

export const JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_SCHEMA_MARKER_45B =
  "phase45b-judgment-claim-link-explainability-engine-schema" as const;

export const JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_VERSION = "45-B.1" as const;

export const JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_ITEM_IDS = [
  "JUDGMENT_REFERENCE_TRACE",
  "LINKED_CLAIM_TRACE",
  "HIDDEN_OMISSION_GUARD",
  "JUDGMENT_CLAIM_LAWYER_REVIEW",
] as const;

export const judgmentclaimlinkexplainabilityengineItemSchema = z.object({
  itemId: z.enum(JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const judgmentclaimlinkexplainabilityengineResultSchema = z.object({
  version: z.literal("45-B.1"),
  explainabilityScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(judgmentclaimlinkexplainabilityengineItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  judgmentClaimLinkExplainabilityEngineReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type JudgmentClaimLinkExplainabilityEngineItemId = (typeof JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_ITEM_IDS)[number];
export type JudgmentClaimLinkExplainabilityEngineResult = z.infer<typeof judgmentclaimlinkexplainabilityengineResultSchema>;
