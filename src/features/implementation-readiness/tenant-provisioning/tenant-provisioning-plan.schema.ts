/**
 * Product Phase 36-B — Customer data / tenant provisioning plan schema (Zod SSOT).
 */
import { z } from "zod";

export const TENANT_PROVISIONING_PLAN_SCHEMA_MARKER_PHASE36B =
  "phase36b-tenant-provisioning-plan-schema" as const;

export const TENANT_PROVISIONING_PLAN_VERSION = "36-B.1" as const;

export const TENANT_PROVISIONING_STEP_IDS = [
  "TENANT_SCOPE_DEFINITION",
  "CUSTOMER_DATA_MIGRATION",
  "USER_PROVISIONING",
  "SSO_INTEGRATION",
  "ENVIRONMENT_VALIDATION",
] as const;

export const tenantProvisioningStepSchema = z.object({
  stepId: z.enum(TENANT_PROVISIONING_STEP_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const tenantProvisioningPlanResultSchema = z.object({
  version: z.literal(TENANT_PROVISIONING_PLAN_VERSION),
  implementationScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  steps: z.array(tenantProvisioningStepSchema).min(1),
  completionRate: z.number().min(0).max(100),
  tenantProvisioningPlanReady: z.boolean(),
});

export type TenantProvisioningStepId = (typeof TENANT_PROVISIONING_STEP_IDS)[number];
export type TenantProvisioningPlanResult = z.infer<typeof tenantProvisioningPlanResultSchema>;
