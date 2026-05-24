/**
 * Product Phase 22-F — Tenant / Plan / Metering RC lock (22-A~E deployment gate SSOT).
 * @see docs/platform/AIBEOPCHIN_TENANT_PLAN_METERING_RC_LOCK_SUMMARY.md
 */
export const TENANT_PLAN_METERING_RC_LOCK_MARKER_PHASE22F =
  "phase22f-tenant-plan-metering-rc-gate" as const;

export const TENANT_PLAN_METERING_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC" as const;

export const TENANT_PLAN_METERING_RC_VERSION = "22-F.1" as const;

export const TENANT_PLAN_METERING_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-tenant-rc" as const;

export const TENANT_PLAN_METERING_RC_ONE_LINE_CRITERION =
  "법무법인·변호사·의뢰인 사용 구조를 tenant 단위로 분리하고, 요금제·기능 권한·사용량 집계·과금 안전 원장·운영자 plan console을 하나의 사업화 RC로 묶어 배포 전 검증·운영 runbook·청구서 미발행 원장 정책을 잠근다" as const;

export const TENANT_PLAN_METERING_RC_SUB_PHASES = {
  "22-A": "Tenant / Organization Model",
  "22-B": "Plan / Feature Entitlement",
  "22-C": "Usage Metering",
  "22-D": "Billing-safe Usage Ledger",
  "22-E": "Admin Plan Console",
  "22-F": "Tenant / Plan / Metering RC",
} as const;

export const TENANT_PLAN_METERING_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-tenant-phase22a",
  "verify:aibeopchin-tenant-phase22b",
  "verify:aibeopchin-tenant-phase22c",
  "verify:aibeopchin-tenant-phase22d",
  "verify:aibeopchin-tenant-phase22e",
] as const;

export const TENANT_PLAN_METERING_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22A-ORGANIZATION-BASELINE",
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22B-PLAN-ENTITLEMENT",
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22C-USAGE-METERING",
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22D-BILLING-USAGE-LEDGER",
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22E-ADMIN-PLAN-CONSOLE",
  TENANT_PLAN_METERING_RC_EVIDENCE_TAG,
] as const;

export const TENANT_PLAN_METERING_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21F-RC",
] as const;

export const TENANT_PLAN_METERING_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_TENANT_ORGANIZATION_BASELINE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_TENANT_PLAN_ENTITLEMENT_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_TENANT_USAGE_METERING_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_BILLING_USAGE_LEDGER_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_ADMIN_TENANT_PLAN_CONSOLE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_TENANT_PLAN_METERING_RC_RUNBOOK.md",
] as const;

export const TENANT_PLAN_METERING_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_TENANT_PLAN_METERING_RC_LOCK_SUMMARY.md",
  ...TENANT_PLAN_METERING_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

/** Billing ledger — no automatic invoice issuance (22-D policy). */
export const TENANT_PLAN_METERING_RC_NO_AUTOMATIC_INVOICE_MARKER =
  "phase22d-no-automatic-invoice-issuance" as const;

export const TENANT_PLAN_METERING_RC_ADMIN_CONSOLE_PATHS = {
  tenantList: "/admin/tenants",
  tenantPlanDetail: "/admin/tenants/[tenantId]/plan",
  tenantsApi: "/api/admin/tenants",
} as const;

/** Phase 20/21 cross-link — entitlement enforcement on messaging & client mobile */
export const TENANT_PLAN_METERING_RC_PRODUCT_CROSS_LINK = {
  realMessagingMasterVerify: "verify:aibeopchin-real-messaging-rc",
  clientMobileMasterVerify: "verify:aibeopchin-client-mobile-rc",
  externalMessagingEntitlement:
    "src/features/platform/external-messaging/external-message-adapter.service.ts",
  tenantEntitlementService:
    "src/features/platform/tenant-entitlement/tenant-entitlement.service.ts",
  billingLedgerService:
    "src/features/platform/billing-ledger/billing-usage-ledger.service.ts",
  adminPlanConsoleService:
    "src/features/platform/admin-tenant-plan/admin-tenant-plan-console.service.ts",
} as const;

export const TENANT_PLAN_METERING_RC_AUDIT_ACTIONS = [
  "TENANT_PLAN_UPDATED",
  "TENANT_FEATURE_OVERRIDE_UPDATED",
  "BILLING_LEDGER_ADJUSTED",
  "TENANT_ENTITLEMENT_DENIED",
] as const;

export function isTenantBillingAutomaticInvoiceEnabled(
  _env: NodeJS.ProcessEnv = process.env,
): boolean {
  return false;
}
