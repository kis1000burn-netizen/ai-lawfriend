import { describe, expect, it } from "vitest";
import { buildTenantOnboardingRunbookForSlug } from "./tenant-onboarding-runbook.service";
import { TENANT_ONBOARDING_STEPS } from "./tenant-onboarding-runbook.registry";

describe("tenant-onboarding-runbook (Phase 25-B)", () => {
  it("defines onboarding steps", () => {
    expect(TENANT_ONBOARDING_STEPS.length).toBeGreaterThanOrEqual(5);
  });

  it("marks demo tenant baseline steps complete", () => {
    const result = buildTenantOnboardingRunbookForSlug({ tenantSlug: "aibeopchin-demo" });
    expect(result.steps.find((s) => s.stepId === "create-tenant")?.completed).toBe(true);
    expect(result.completionRate).toBeGreaterThan(0);
  });

  it("requires all steps for commercial readiness", () => {
    const result = buildTenantOnboardingRunbookForSlug({
      tenantSlug: "new-firm",
      completedStepIds: TENANT_ONBOARDING_STEPS.map((s) => s.stepId),
    });
    expect(result.readyForCommercialUse).toBe(true);
  });
});
