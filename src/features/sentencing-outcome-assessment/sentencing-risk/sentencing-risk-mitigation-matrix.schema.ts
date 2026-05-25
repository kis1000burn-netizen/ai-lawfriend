/**
 * Product Phase 41-D — SentencingRiskMitigationMatrix schema (Zod SSOT).
 */
import { z } from "zod";

export const SENTENCING_RISK_MITIGATION_MATRIX_SCHEMA_MARKER_41D =
  "phase41d-sentencing-risk-mitigation-matrix-schema" as const;

export const SENTENCING_RISK_MITIGATION_MATRIX_VERSION = "41-D.1" as const;

export const SENTENCING_RISK_MITIGATION_MATRIX_ITEM_IDS = [
  "IMPRISONMENT_RISK_FLAG",
  "SUSPENSION_MITIGATION",
  "SETTLEMENT_IMPACT_MATRIX",
  "PRIOR_RECORD_IMPACT",
  "VICTIM_STATEMENT_IMPACT",
  "RISK_MATRIX_LAWYER_REVIEW",
] as const;

export const sentencingRiskMitigationMatrixItemSchema = z.object({
  itemId: z.enum(SENTENCING_RISK_MITIGATION_MATRIX_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const sentencingRiskMitigationMatrixResultSchema = z.object({
  version: z.literal("41-D.1"),
  sentencingAssessmentScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(sentencingRiskMitigationMatrixItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  sentencingRiskMitigationMatrixReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
  clientVisibleBeforeReview: z.literal(false),
});

export type SentencingRiskMitigationMatrixItemId = (typeof SENTENCING_RISK_MITIGATION_MATRIX_ITEM_IDS)[number];
export type SentencingRiskMitigationMatrixResult = z.infer<typeof sentencingRiskMitigationMatrixResultSchema>;
