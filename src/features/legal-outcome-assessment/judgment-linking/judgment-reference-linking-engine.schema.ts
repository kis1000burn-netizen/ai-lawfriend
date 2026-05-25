/**
 * Product Phase 40-B — JudgmentReferenceLinkingEngine schema (Zod SSOT).
 */
import { z } from "zod";

export const JUDGMENT_REFERENCE_LINKING_ENGINE_SCHEMA_MARKER_40B =
  "phase40b-judgment-reference-linking-engine-schema" as const;

export const JUDGMENT_REFERENCE_LINKING_ENGINE_VERSION = "40-B.2" as const;

export const JUDGMENT_REFERENCE_LINKING_ENGINE_ITEM_IDS = [
  "ISSUE_TO_JUDGMENT_LINK",
  "BURDEN_TO_JUDGMENT_LINK",
  "EVIDENCE_TYPE_TO_JUDGMENT_LINK",
  "DEFENSE_TO_JUDGMENT_LINK",
  "LINKING_ENGINE_LAWYER_REVIEW",
] as const;

export const judgmentReferenceLinkingEngineItemSchema = z.object({
  itemId: z.enum(JUDGMENT_REFERENCE_LINKING_ENGINE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const judgmentReferenceLinkingEngineResultSchema = z.object({
  version: z.literal("40-B.2"),
  caseAssessmentScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(judgmentReferenceLinkingEngineItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  judgmentReferenceLinkingEngineReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type JudgmentReferenceLinkingEngineItemId = (typeof JUDGMENT_REFERENCE_LINKING_ENGINE_ITEM_IDS)[number];
export type JudgmentReferenceLinkingEngineResult = z.infer<typeof judgmentReferenceLinkingEngineResultSchema>;
