/**
 * Product Phase 38-C — Renewal readiness timeline schema (Zod SSOT).
 */
import { z } from "zod";

export const RENEWAL_READINESS_TIMELINE_SCHEMA_MARKER_PHASE38C =
  "phase38c-renewal-readiness-timeline-schema" as const;

export const RENEWAL_READINESS_TIMELINE_VERSION = "38-C.1" as const;

export const RENEWAL_READINESS_STEP_IDS = [
  "RENEWAL_WINDOW_START",
  "CONTRACT_TERM_REVIEW",
  "PRICING_ADJUSTMENT_REVIEW",
  "RENEWAL_APPROVAL_MATRIX",
  "NON_RENEWAL_ESCALATION",
] as const;

export const renewalReadinessStepSchema = z.object({
  stepId: z.enum(RENEWAL_READINESS_STEP_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const renewalReadinessTimelineResultSchema = z.object({
  version: z.literal(RENEWAL_READINESS_TIMELINE_VERSION),
  customerSuccessScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  steps: z.array(renewalReadinessStepSchema).min(1),
  completionRate: z.number().min(0).max(100),
  renewalReadinessTimelineReady: z.boolean(),
});

export type RenewalReadinessStepId = (typeof RENEWAL_READINESS_STEP_IDS)[number];
export type RenewalReadinessTimelineResult = z.infer<typeof renewalReadinessTimelineResultSchema>;
