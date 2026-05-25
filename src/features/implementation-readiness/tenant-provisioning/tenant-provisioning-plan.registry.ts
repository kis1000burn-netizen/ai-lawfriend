/**
 * Product Phase 36-B — Customer data / tenant provisioning plan SSOT.
 */
import type { TenantProvisioningPlanResult } from "./tenant-provisioning-plan.schema";

export const TENANT_PROVISIONING_PLAN_REGISTRY_MARKER_PHASE36B =
  "phase36b-tenant-provisioning-plan-registry" as const;

type TenantProvisioningStep = Omit<TenantProvisioningPlanResult["steps"][number], "defined">;

export const TENANT_PROVISIONING_STEPS: TenantProvisioningStep[] = [
  { stepId: "TENANT_SCOPE_DEFINITION", label: "Tenant scope and plan mapping", required: true },
  { stepId: "CUSTOMER_DATA_MIGRATION", label: "Customer data migration checklist", required: true },
  { stepId: "USER_PROVISIONING", label: "User and role provisioning plan", required: true },
  { stepId: "SSO_INTEGRATION", label: "SSO / identity integration plan", required: true },
  { stepId: "ENVIRONMENT_VALIDATION", label: "Environment validation checklist", required: true },
];
