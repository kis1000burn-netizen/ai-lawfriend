/**
 * Product Phase 25-B — Tenant onboarding runbook policy SSOT.
 */
import { TENANT_ONBOARDING_STEPS } from "./tenant-onboarding-runbook.registry";
import type { TenantOnboardingRunbookResult } from "./tenant-onboarding-runbook.schema";
import { TENANT_ONBOARDING_RUNBOOK_VERSION } from "./tenant-onboarding-runbook.schema";

export const TENANT_ONBOARDING_RUNBOOK_POLICY_MARKER_PHASE25B =
  "phase25b-tenant-onboarding-runbook-policy" as const;

export function assembleTenantOnboardingRunbook(input: {
  tenantSlug: string;
  completedStepIds: Set<string>;
  generatedAt?: string;
}): TenantOnboardingRunbookResult {
  const steps = TENANT_ONBOARDING_STEPS.map((step) => ({
    ...step,
    completed: input.completedStepIds.has(step.stepId),
  }));

  const required = steps.filter((step) => step.required);
  const completedRequired = required.filter((step) => step.completed).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((completedRequired / required.length) * 100);

  return {
    version: TENANT_ONBOARDING_RUNBOOK_VERSION,
    tenantSlug: input.tenantSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    steps,
    completionRate,
    readyForCommercialUse: completedRequired === required.length,
  };
}
