/**
 * Product Phase 29-F — Revenue Ops / Customer Success RC lock (29-A~E gate SSOT).
 * @see docs/platform/AIBEOPCHIN_REVENUE_OPS_RC_LOCK_SUMMARY.md
 */
export const REVENUE_OPS_RC_LOCK_MARKER_PHASE29F = "phase29f-revenue-ops-rc-gate" as const;

export const REVENUE_OPS_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29F-RC" as const;

export const REVENUE_OPS_RC_VERSION = "29-F.1" as const;

export const REVENUE_OPS_RC_MASTER_VERIFY_SCRIPT = "verify:aibeopchin-revenue-ops-rc" as const;

export const REVENUE_OPS_RC_ONE_LINE_CRITERION =
  "유료 tenant의 매출 상태·사용 활성도·고객 성공 활동·갱신·이탈 위험·확장 기회를 운영 지표로 관리하고 Customer Success RC로 봉인하는 Product Phase 29" as const;

export const REVENUE_OPS_NO_INVOICE_PAYMENT_MUTATION_MARKER =
  "phase29f-no-invoice-payment-mutation" as const;

export const REVENUE_OPS_RC_SUB_PHASES = {
  "29-A": "Revenue Account Health Score",
  "29-B": "Customer Success Activity Log",
  "29-C": "Renewal / Churn Risk Monitor",
  "29-D": "Expansion Opportunity Tracker",
  "29-E": "Executive / Partner Success Report",
  "29-F": "Revenue Ops / Customer Success RC",
} as const;

export const REVENUE_OPS_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-revenue-ops-phase29a",
  "verify:aibeopchin-revenue-ops-phase29b",
  "verify:aibeopchin-revenue-ops-phase29c",
  "verify:aibeopchin-revenue-ops-phase29d",
  "verify:aibeopchin-revenue-ops-phase29e",
] as const;

export const REVENUE_OPS_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29A-ACCOUNT-HEALTH-SCORE",
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29B-CUSTOMER-SUCCESS-ACTIVITY-LOG",
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29C-RENEWAL-CHURN-RISK-MONITOR",
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29D-EXPANSION-OPPORTUNITY-TRACKER",
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29E-EXECUTIVE-PARTNER-SUCCESS-REPORT",
  REVENUE_OPS_RC_EVIDENCE_TAG,
] as const;

export const REVENUE_OPS_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC",
] as const;

export const REVENUE_OPS_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_REVENUE_ACCOUNT_HEALTH_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CUSTOMER_SUCCESS_ACTIVITY_LOG_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_RENEWAL_CHURN_RISK_MONITOR_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_EXPANSION_OPPORTUNITY_TRACKER_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_EXECUTIVE_PARTNER_SUCCESS_REPORT_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_REVENUE_OPS_RC_RUNBOOK.md",
] as const;

export const REVENUE_OPS_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_REVENUE_OPS_RC_LOCK_SUMMARY.md",
  ...REVENUE_OPS_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const REVENUE_OPS_RC_ACCOUNT_HEALTH_MARKER = "phase29a-account-health-gate" as const;

export const REVENUE_OPS_RC_PRODUCT_CROSS_LINK = {
  paidConversionScaleMasterVerify: "verify:aibeopchin-paid-conversion-scale-rc",
  paidConversionScaleRcEvidence: "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  pilotOperationsRcEvidence: "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27F-RC",
  tenantRcVerify: "verify:aibeopchin-tenant-rc",
  tenantRcEvidence: "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC",
  dataRedactionVerify: "verify:aibeopchin-data-governance-phase19b",
  billingNoAutomaticInvoiceMarker: "BILLING_LEDGER_NO_AUTOMATIC_INVOICE_MARKER",
} as const;

export const REVENUE_OPS_RC_AUDIT_ACTIONS = [] as const;
