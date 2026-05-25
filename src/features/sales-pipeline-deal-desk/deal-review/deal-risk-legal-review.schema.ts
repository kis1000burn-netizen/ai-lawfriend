/**
 * Product Phase 34-D — Deal risk / legal review gate schema (Zod SSOT).
 */
import { z } from "zod";

export const DEAL_RISK_LEGAL_REVIEW_SCHEMA_MARKER_PHASE34D =
  "phase34d-deal-risk-legal-review-schema" as const;

export const DEAL_RISK_LEGAL_REVIEW_VERSION = "34-D.1" as const;

export const DEAL_REVIEW_GATE_IDS = [
  "CONFLICT_CHECK",
  "DATA_PROCESSING_REVIEW",
  "CUSTOM_TERMS_REVIEW",
  "SECURITY_REVIEW_LINK",
  "LEGAL_SIGNOFF",
] as const;

export const dealReviewGateItemSchema = z.object({
  gateId: z.enum(DEAL_REVIEW_GATE_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  cleared: z.boolean(),
});

export const dealRiskLegalReviewGateResultSchema = z.object({
  version: z.literal(DEAL_RISK_LEGAL_REVIEW_VERSION),
  pipelineScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  gates: z.array(dealReviewGateItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  dealReviewGateReady: z.boolean(),
});

export type DealReviewGateId = (typeof DEAL_REVIEW_GATE_IDS)[number];
export type DealRiskLegalReviewGateResult = z.infer<typeof dealRiskLegalReviewGateResultSchema>;
