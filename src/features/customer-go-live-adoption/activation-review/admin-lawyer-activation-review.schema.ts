/**
 * Product Phase 37-C — Admin / lawyer activation review schema (Zod SSOT).
 */
import { z } from "zod";

export const ADMIN_LAWYER_ACTIVATION_SCHEMA_MARKER_PHASE37C =
  "phase37c-admin-lawyer-activation-schema" as const;

export const ADMIN_LAWYER_ACTIVATION_VERSION = "37-C.1" as const;

export const ADMIN_LAWYER_ACTIVATION_METRIC_IDS = [
  "ADMIN_LOGIN_ACTIVATION",
  "LAWYER_CASE_WORKFLOW",
  "DOCUMENT_REVIEW_USAGE",
  "INTERVIEW_COMPLETION",
  "ROLE_COVERAGE_GAP",
] as const;

export const adminLawyerActivationMetricSchema = z.object({
  metricId: z.enum(ADMIN_LAWYER_ACTIVATION_METRIC_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const adminLawyerActivationReviewResultSchema = z.object({
  version: z.literal(ADMIN_LAWYER_ACTIVATION_VERSION),
  adoptionScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  metrics: z.array(adminLawyerActivationMetricSchema).min(1),
  completionRate: z.number().min(0).max(100),
  adminLawyerActivationReviewReady: z.boolean(),
});

export type AdminLawyerActivationMetricId = (typeof ADMIN_LAWYER_ACTIVATION_METRIC_IDS)[number];
export type AdminLawyerActivationReviewResult = z.infer<
  typeof adminLawyerActivationReviewResultSchema
>;
