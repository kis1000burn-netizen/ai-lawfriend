import { describe, expect, it } from "vitest";
import {
  ADMIN_TENANT_LIST_PATH,
  ADMIN_TENANT_PLAN_AUDIT_ACTIONS,
  ADMIN_TENANT_PLAN_CONSOLE_POLICY_MARKER_PHASE22E,
  adminTenantPlanDetailPath,
  adminTenantPlanApiPath,
  isBillingPeriodMutationBlocked,
} from "./admin-tenant-plan-console.policy";

describe("admin-tenant-plan-console.policy (Phase 22-E)", () => {
  it("registers admin console paths", () => {
    expect(ADMIN_TENANT_PLAN_CONSOLE_POLICY_MARKER_PHASE22E).toBe(
      "phase22e-admin-tenant-plan-console-policy",
    );
    expect(ADMIN_TENANT_LIST_PATH).toBe("/admin/tenants");
    expect(adminTenantPlanDetailPath("tenant-1")).toBe("/admin/tenants/tenant-1/plan");
    expect(adminTenantPlanApiPath("tenant-1")).toBe("/api/admin/tenants/tenant-1/plan");
  });

  it("defines audit actions for plan, feature override, ledger adjustment", () => {
    expect(ADMIN_TENANT_PLAN_AUDIT_ACTIONS.PLAN_UPDATED).toBe("TENANT_PLAN_UPDATED");
    expect(ADMIN_TENANT_PLAN_AUDIT_ACTIONS.FEATURE_OVERRIDE_UPDATED).toBe(
      "TENANT_FEATURE_OVERRIDE_UPDATED",
    );
    expect(ADMIN_TENANT_PLAN_AUDIT_ACTIONS.BILLING_LEDGER_ADJUSTED).toBe(
      "BILLING_LEDGER_ADJUSTED",
    );
  });

  it("blocks billing mutations when period is closed", () => {
    expect(isBillingPeriodMutationBlocked(true)).toBe(true);
    expect(isBillingPeriodMutationBlocked(false)).toBe(false);
  });
});
