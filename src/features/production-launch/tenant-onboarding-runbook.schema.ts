/**
 * Product Phase 25-B — Tenant onboarding runbook schema (Zod SSOT).
 */
import { z } from "zod";

export const TENANT_ONBOARDING_RUNBOOK_SCHEMA_MARKER_PHASE25B =
  "phase25b-tenant-onboarding-runbook-schema" as const;

export const TENANT_ONBOARDING_RUNBOOK_VERSION = "25-B.1" as const;

export const tenantOnboardingStepSchema = z.object({
  stepId: z.string().min(1),
  label: z.string().min(1),
  ownerRole: z.enum(["PLATFORM_ADMIN", "TENANT_OWNER", "TENANT_ADMIN"]),
  required: z.boolean().default(true),
  completed: z.boolean(),
  docPath: z.string().optional(),
});

export const tenantOnboardingRunbookResultSchema = z.object({
  version: z.literal(TENANT_ONBOARDING_RUNBOOK_VERSION),
  tenantSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  steps: z.array(tenantOnboardingStepSchema).min(1),
  completionRate: z.number().min(0).max(100),
  readyForCommercialUse: z.boolean(),
});

export type TenantOnboardingRunbookResult = z.infer<typeof tenantOnboardingRunbookResultSchema>;
