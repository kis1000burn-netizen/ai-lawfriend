import { describe, expect, it } from "vitest";
import { buildCustomerDataTenantProvisioningPlan } from "./tenant-provisioning-plan.service";

describe("tenant-provisioning-plan (Phase 36-B)", () => {
  it("marks tenantProvisioningPlanReady when required steps defined", () => {
    const result = buildCustomerDataTenantProvisioningPlan();
    expect(result.tenantProvisioningPlanReady).toBe(true);
  });
});
