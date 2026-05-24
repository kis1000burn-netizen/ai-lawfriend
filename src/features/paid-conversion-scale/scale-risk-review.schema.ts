/**
 * Product Phase 28-E — Scale risk review schema (Zod SSOT).
 */
import { z } from "zod";

export const SCALE_RISK_REVIEW_SCHEMA_MARKER_PHASE28E = "phase28e-scale-risk-review-schema" as const;

export const SCALE_RISK_REVIEW_VERSION = "28-E.1" as const;

export const SCALE_RISK_AXIS_IDS = [
  "DATABASE_CAPACITY",
  "MESSAGING_THROUGHPUT",
  "AI_INFERENCE",
  "STORAGE_GROWTH",
  "OPERATIONS_ONCALL",
] as const;

export const scaleRiskAxisSchema = z.object({
  axisId: z.enum(SCALE_RISK_AXIS_IDS),
  label: z.string().min(1),
  weight: z.number().min(0).max(100),
  score: z.number().min(0).max(100),
});

export const scaleRiskReviewResultSchema = z.object({
  version: z.literal(SCALE_RISK_REVIEW_VERSION),
  generatedAt: z.string().datetime(),
  axes: z.array(scaleRiskAxisSchema).min(1),
  weightedScore: z.number().min(0).max(100),
  blockers: z.array(z.string()),
  scaleRiskAcceptable: z.boolean(),
});

export type ScaleRiskAxisId = (typeof SCALE_RISK_AXIS_IDS)[number];
export type ScaleRiskReviewResult = z.infer<typeof scaleRiskReviewResultSchema>;
