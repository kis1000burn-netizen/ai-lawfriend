/**
 * Product Phase 25-B — Tenant onboarding runbook service.
 */
import { TENANT_ORGANIZATION_DEFAULT_SLUG } from "@/features/platform/tenant-organization/tenant-organization.policy";
import { assembleTenantOnboardingRunbook } from "./tenant-onboarding-runbook.policy";
import { TENANT_ONBOARDING_DEFAULT_SLUG } from "./tenant-onboarding-runbook.registry";
import type { TenantOnboardingRunbookResult } from "./tenant-onboarding-runbook.schema";

export const TENANT_ONBOARDING_RUNBOOK_SERVICE_MARKER_PHASE25B =
  "phase25b-tenant-onboarding-runbook-service" as const;

export function buildTenantOnboardingRunbookForSlug(input: {
  tenantSlug?: string;
  completedStepIds?: string[];
}): TenantOnboardingRunbookResult {
  const slug = input.tenantSlug ?? TENANT_ONBOARDING_DEFAULT_SLUG;
  const isDemo = slug === TENANT_ONBOARDING_DEFAULT_SLUG || slug === TENANT_ORGANIZATION_DEFAULT_SLUG;

  const completedStepIds = new Set(input.completedStepIds ?? []);
  if (isDemo) {
    for (const stepId of ["create-tenant", "assign-owner", "configure-plan"]) {
      completedStepIds.add(stepId);
    }
  }

  return assembleTenantOnboardingRunbook({
    tenantSlug: slug,
    completedStepIds,
  });
}
