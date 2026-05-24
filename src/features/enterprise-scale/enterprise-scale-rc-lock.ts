/**
 * Product Phase 30-F — Enterprise Scale RC lock (30-A~E deployment gate SSOT).
 * @see docs/platform/AIBEOPCHIN_ENTERPRISE_SCALE_RC_LOCK_SUMMARY.md
 */
export const ENTERPRISE_SCALE_RC_LOCK_MARKER_PHASE30F = "phase30f-enterprise-scale-rc-gate" as const;

export const ENTERPRISE_SCALE_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30F-RC" as const;

export const ENTERPRISE_SCALE_RC_VERSION = "30-F.1" as const;

export const ENTERPRISE_SCALE_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-enterprise-scale-rc" as const;

export const ENTERPRISE_SCALE_RC_ONE_LINE_CRITERION =
  "Enterprise deployment model·multi-tenant governance·partner/branch network·enterprise security review·scale monitoring/capacity forecast를 하나의 Product Phase 30 RC로 묶어 엔터프라이즈 스케일 게이트·Phase 29-F cross-link를 잠근다" as const;

export const ENTERPRISE_SCALE_RC_SUB_PHASES = {
  "30-A": "Enterprise Deployment Model",
  "30-B": "Multi-tenant Governance / Role Delegation",
  "30-C": "Partner / Branch Network Operations",
  "30-D": "Enterprise Security Review Pack",
  "30-E": "Scale Monitoring / Capacity Forecast",
  "30-F": "Enterprise Scale RC",
} as const;

export const ENTERPRISE_SCALE_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-enterprise-scale-phase30a",
  "verify:aibeopchin-enterprise-scale-phase30b",
  "verify:aibeopchin-enterprise-scale-phase30c",
  "verify:aibeopchin-enterprise-scale-phase30d",
  "verify:aibeopchin-enterprise-scale-phase30e",
] as const;

export const ENTERPRISE_SCALE_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30A-ENTERPRISE-DEPLOYMENT-MODEL",
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30B-MULTI-TENANT-GOVERNANCE",
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30C-PARTNER-BRANCH-NETWORK",
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30D-ENTERPRISE-SECURITY-REVIEW",
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30E-SCALE-MONITORING-CAPACITY",
  ENTERPRISE_SCALE_RC_EVIDENCE_TAG,
] as const;

export const ENTERPRISE_SCALE_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC",
] as const;

export const ENTERPRISE_SCALE_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_ENTERPRISE_DEPLOYMENT_MODEL_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_MULTI_TENANT_GOVERNANCE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PARTNER_BRANCH_NETWORK_OPERATIONS_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_ENTERPRISE_SECURITY_REVIEW_PACK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SCALE_MONITORING_CAPACITY_FORECAST_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_ENTERPRISE_SCALE_RC_RUNBOOK.md",
] as const;

export const ENTERPRISE_SCALE_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_ENTERPRISE_SCALE_RC_LOCK_SUMMARY.md",
  ...ENTERPRISE_SCALE_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const ENTERPRISE_SCALE_RC_DEPLOYMENT_MARKER = "phase30a-enterprise-deployment-gate" as const;

export const ENTERPRISE_SCALE_RC_PRODUCT_CROSS_LINK = {
  revenueOpsMasterVerify: "verify:aibeopchin-revenue-ops-rc",
  revenueOpsRcEvidence: "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29F-RC",
  paidConversionScaleRcEvidence: "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  tenantRcVerify: "verify:aibeopchin-tenant-rc",
  dataGovernanceRcVerify: "verify:aibeopchin-data-governance-rc",
  operationsMonitoringVerify: "verify:aibeopchin-operations-monitoring-rc",
  reliabilityRcVerify: "verify:aibeopchin-reliability-rc",
} as const;

export const ENTERPRISE_SCALE_RC_AUDIT_ACTIONS = [] as const;
