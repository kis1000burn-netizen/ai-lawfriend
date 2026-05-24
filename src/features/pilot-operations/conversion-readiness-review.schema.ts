/**
 * Product Phase 27-E — Conversion readiness review schema (Zod SSOT).
 */
import { z } from "zod";

export const CONVERSION_READINESS_REVIEW_SCHEMA_MARKER_PHASE27E =
  "phase27e-conversion-readiness-review-schema" as const;

export const CONVERSION_READINESS_REVIEW_VERSION = "27-E.1" as const;

export const CONVERSION_READINESS_AXIS_IDS = [
  "USAGE_BASELINE",
  "SATISFACTION",
  "SUPPORT_STABILITY",
  "BILLING_READINESS",
  "LEGAL_SIGNOFF",
] as const;

export const conversionReadinessAxisSchema = z.object({
  axisId: z.enum(CONVERSION_READINESS_AXIS_IDS),
  label: z.string().min(1),
  weight: z.number().min(0).max(100),
  score: z.number().min(0).max(100),
});

export const conversionReadinessReviewResultSchema = z.object({
  version: z.literal(CONVERSION_READINESS_REVIEW_VERSION),
  generatedAt: z.string().datetime(),
  axes: z.array(conversionReadinessAxisSchema).min(1),
  weightedScore: z.number().min(0).max(100),
  blockers: z.array(z.string()),
  conversionReady: z.boolean(),
});

export type ConversionReadinessAxisId = (typeof CONVERSION_READINESS_AXIS_IDS)[number];
export type ConversionReadinessReviewResult = z.infer<
  typeof conversionReadinessReviewResultSchema
>;
