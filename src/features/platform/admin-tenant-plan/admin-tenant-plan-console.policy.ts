/**
 * Product Phase 22-E — Admin tenant plan console policy SSOT.
 */
export const ADMIN_TENANT_PLAN_CONSOLE_POLICY_MARKER_PHASE22E =
  "phase22e-admin-tenant-plan-console-policy" as const;

export const ADMIN_TENANT_LIST_PATH = "/admin/tenants" as const;
export const ADMIN_TENANT_PLAN_DETAIL_PATH = "/admin/tenants/[tenantId]/plan" as const;

export const ADMIN_TENANTS_API_PATH = "/api/admin/tenants" as const;
export const ADMIN_TENANT_PLAN_API_PATH = "/api/admin/tenants/[tenantId]/plan" as const;
export const ADMIN_TENANT_FEATURE_OVERRIDES_API_PATH =
  "/api/admin/tenants/[tenantId]/feature-overrides" as const;
export const ADMIN_TENANT_BILLING_ADJUSTMENT_API_PATH =
  "/api/admin/tenants/[tenantId]/billing-ledger/adjustment" as const;

export const ADMIN_TENANT_PLAN_AUDIT_ACTIONS = {
  PLAN_UPDATED: "TENANT_PLAN_UPDATED",
  FEATURE_OVERRIDE_UPDATED: "TENANT_FEATURE_OVERRIDE_UPDATED",
  BILLING_LEDGER_ADJUSTED: "BILLING_LEDGER_ADJUSTED",
} as const;

export function adminTenantPlanDetailPath(tenantId: string): string {
  return `/admin/tenants/${tenantId}/plan`;
}

export function adminTenantPlanApiPath(tenantId: string): string {
  return `/api/admin/tenants/${tenantId}/plan`;
}

export function adminTenantFeatureOverridesApiPath(tenantId: string): string {
  return `/api/admin/tenants/${tenantId}/feature-overrides`;
}

export function adminTenantBillingAdjustmentApiPath(tenantId: string): string {
  return `/api/admin/tenants/${tenantId}/billing-ledger/adjustment`;
}

export function isBillingPeriodMutationBlocked(periodClosed: boolean): boolean {
  return periodClosed;
}
