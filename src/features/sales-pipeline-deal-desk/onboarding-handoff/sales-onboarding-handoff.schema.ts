/**
 * Product Phase 34-E — Sales-to-onboarding handoff schema (Zod SSOT).
 */
import { z } from "zod";

export const SALES_ONBOARDING_HANDOFF_SCHEMA_MARKER_PHASE34E =
  "phase34e-sales-onboarding-handoff-schema" as const;

export const SALES_ONBOARDING_HANDOFF_VERSION = "34-E.1" as const;

export const ONBOARDING_HANDOFF_STEP_IDS = [
  "TENANT_PROVISIONING_CHECKLIST",
  "SALES_HANDOFF_PACK",
  "ONBOARDING_TIMELINE",
  "CS_HANDOFF",
  "PILOT_TO_PAID_PATH",
] as const;

export const onboardingHandoffStepSchema = z.object({
  stepId: z.enum(ONBOARDING_HANDOFF_STEP_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  ready: z.boolean(),
});

export const salesToOnboardingHandoffResultSchema = z.object({
  version: z.literal(SALES_ONBOARDING_HANDOFF_VERSION),
  pipelineScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  steps: z.array(onboardingHandoffStepSchema).min(1),
  completionRate: z.number().min(0).max(100),
  onboardingHandoffReady: z.boolean(),
});

export type OnboardingHandoffStepId = (typeof ONBOARDING_HANDOFF_STEP_IDS)[number];
export type SalesToOnboardingHandoffResult = z.infer<typeof salesToOnboardingHandoffResultSchema>;
