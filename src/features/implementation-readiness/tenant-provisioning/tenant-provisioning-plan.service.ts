/**
 * Product Phase 36-B — Customer data / tenant provisioning plan service.
 */
import { IMPLEMENTATION_READINESS_DEFAULT_SCOPE_SLUG } from "../project-plan/implementation-project-plan.registry";
import { TENANT_PROVISIONING_STEPS } from "./tenant-provisioning-plan.registry";
import { assembleCustomerDataTenantProvisioningPlan } from "./tenant-provisioning-plan.policy";
import type { TenantProvisioningPlanResult } from "./tenant-provisioning-plan.schema";

export const TENANT_PROVISIONING_PLAN_SERVICE_MARKER_PHASE36B =
  "phase36b-tenant-provisioning-plan-service" as const;

export function buildCustomerDataTenantProvisioningPlan(input?: {
  implementationScopeSlug?: string;
  definedStepIds?: string[];
}): TenantProvisioningPlanResult {
  const definedStepIds = new Set(
    input?.definedStepIds ??
      TENANT_PROVISIONING_STEPS.filter((step) => step.required).map((step) => step.stepId),
  );

  return assembleCustomerDataTenantProvisioningPlan({
    implementationScopeSlug:
      input?.implementationScopeSlug ?? IMPLEMENTATION_READINESS_DEFAULT_SCOPE_SLUG,
    definedStepIds,
  });
}
