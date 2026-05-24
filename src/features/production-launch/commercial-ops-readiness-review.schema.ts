/**
 * Product Phase 25-E — Commercial ops readiness review schema (Zod SSOT).
 */
import { z } from "zod";

export const COMMERCIAL_OPS_READINESS_REVIEW_SCHEMA_MARKER_PHASE25E =
  "phase25e-commercial-ops-readiness-review-schema" as const;

export const COMMERCIAL_OPS_READINESS_REVIEW_VERSION = "25-E.1" as const;

export const commercialOpsReadinessAxisSchema = z.object({
  axisId: z.string().min(1),
  label: z.string().min(1),
  weight: z.number().min(0).max(100),
  score: z.number().min(0).max(100),
  evidenceTag: z.string().optional(),
});

export const commercialOpsReadinessReviewResultSchema = z.object({
  version: z.literal(COMMERCIAL_OPS_READINESS_REVIEW_VERSION),
  generatedAt: z.string().datetime(),
  axes: z.array(commercialOpsReadinessAxisSchema).min(1),
  weightedScore: z.number().min(0).max(100),
  commercialReady: z.boolean(),
  blockers: z.array(z.string()),
});

export type CommercialOpsReadinessReviewResult = z.infer<
  typeof commercialOpsReadinessReviewResultSchema
>;
