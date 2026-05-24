/**
 * Product Phase 27-C — Lawyer / client satisfaction review schema (Zod SSOT).
 */
import { z } from "zod";

export const LAWYER_CLIENT_SATISFACTION_REVIEW_SCHEMA_MARKER_PHASE27C =
  "phase27c-lawyer-client-satisfaction-review-schema" as const;

export const LAWYER_CLIENT_SATISFACTION_REVIEW_VERSION = "27-C.1" as const;

export const SATISFACTION_REVIEW_AXIS_IDS = [
  "LAWYER_WORKFLOW",
  "CLIENT_PORTAL",
  "AI_QUALITY",
  "RESPONSE_TIME",
  "OVERALL_NPS",
] as const;

export const satisfactionReviewAxisSchema = z.object({
  axisId: z.enum(SATISFACTION_REVIEW_AXIS_IDS),
  label: z.string().min(1),
  weight: z.number().min(0).max(100),
  score: z.number().min(0).max(100),
});

export const lawyerClientSatisfactionReviewResultSchema = z.object({
  version: z.literal(LAWYER_CLIENT_SATISFACTION_REVIEW_VERSION),
  generatedAt: z.string().datetime(),
  axes: z.array(satisfactionReviewAxisSchema).min(1),
  weightedScore: z.number().min(0).max(100),
  satisfactionReviewComplete: z.boolean(),
});

export type SatisfactionReviewAxisId = (typeof SATISFACTION_REVIEW_AXIS_IDS)[number];
export type LawyerClientSatisfactionReviewResult = z.infer<
  typeof lawyerClientSatisfactionReviewResultSchema
>;
