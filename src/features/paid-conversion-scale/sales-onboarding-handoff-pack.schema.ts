/**
 * Product Phase 28-D — Sales / onboarding handoff pack schema (Zod SSOT).
 */
import { z } from "zod";

export const SALES_ONBOARDING_HANDOFF_PACK_SCHEMA_MARKER_PHASE28D =
  "phase28d-sales-onboarding-handoff-pack-schema" as const;

export const SALES_ONBOARDING_HANDOFF_PACK_VERSION = "28-D.1" as const;

export const HANDOFF_STEP_IDS = [
  "SALES_CLOSE",
  "CONTRACT_SIGNED",
  "TENANT_PROVISION",
  "OPERATOR_TRAINING",
  "GO_LIVE_CHECKIN",
] as const;

export const handoffStepSchema = z.object({
  stepId: z.enum(HANDOFF_STEP_IDS),
  label: z.string().min(1),
  ownerRole: z.enum(["SALES", "PLATFORM_ADMIN", "CUSTOMER_SUCCESS", "TENANT_OWNER"]),
  required: z.boolean().default(true),
  completed: z.boolean(),
});

export const salesOnboardingHandoffPackResultSchema = z.object({
  version: z.literal(SALES_ONBOARDING_HANDOFF_PACK_VERSION),
  tenantSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  steps: z.array(handoffStepSchema).min(1),
  completionRate: z.number().min(0).max(100),
  handoffPackReady: z.boolean(),
});

export type HandoffStepId = (typeof HANDOFF_STEP_IDS)[number];
export type SalesOnboardingHandoffPackResult = z.infer<
  typeof salesOnboardingHandoffPackResultSchema
>;
