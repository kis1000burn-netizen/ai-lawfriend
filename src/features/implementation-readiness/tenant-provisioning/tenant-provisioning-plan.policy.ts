/**
 * Product Phase 36-B — Customer data / tenant provisioning plan policy SSOT.
 */
import { TENANT_PROVISIONING_STEPS } from "./tenant-provisioning-plan.registry";
import type { TenantProvisioningPlanResult } from "./tenant-provisioning-plan.schema";
import { TENANT_PROVISIONING_PLAN_VERSION } from "./tenant-provisioning-plan.schema";

export const TENANT_PROVISIONING_PLAN_POLICY_MARKER_PHASE36B =
  "phase36b-tenant-provisioning-plan-policy" as const;

export function assembleCustomerDataTenantProvisioningPlan(input: {
  implementationScopeSlug: string;
  definedStepIds: Set<string>;
  generatedAt?: string;
}): TenantProvisioningPlanResult {
  const steps = TENANT_PROVISIONING_STEPS.map((step) => ({
    ...step,
    defined: input.definedStepIds.has(step.stepId),
  }));

  const required = steps.filter((step) => step.required);
  const definedRequired = required.filter((step) => step.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: TENANT_PROVISIONING_PLAN_VERSION,
    implementationScopeSlug: input.implementationScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    steps,
    completionRate,
    tenantProvisioningPlanReady: definedRequired === required.length,
  };
}
