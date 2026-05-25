/**
 * Product Phase 44-D — JudgmentProcedurePack schema (Zod SSOT).
 */
import { z } from "zod";

export const JUDGMENT_PROCEDURE_PACK_SCHEMA_MARKER_44D =
  "phase44d-judgment-procedure-pack-schema" as const;

export const JUDGMENT_PROCEDURE_PACK_VERSION = "44-D.1" as const;

export const JUDGMENT_PROCEDURE_PACK_ITEM_IDS = [
  "JUDGMENT_REFERENCE_INDEX",
  "CITATION_GROUNDING",
  "PROCEDURE_HISTORY_TIMELINE",
  "FILING_DEADLINE_NOTES",
  "JUDGMENT_PROCEDURE_LAWYER_REVIEW",
] as const;

export const judgment_procedure_packItemSchema = z.object({
  itemId: z.enum(JUDGMENT_PROCEDURE_PACK_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const judgment_procedure_packResultSchema = z.object({
  version: z.literal("44-D.1"),
  casePackScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(judgment_procedure_packItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  judgmentProcedurePackReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type JudgmentProcedurePackItemId = (typeof JUDGMENT_PROCEDURE_PACK_ITEM_IDS)[number];
export type JudgmentProcedurePackResult = z.infer<typeof judgment_procedure_packResultSchema>;
