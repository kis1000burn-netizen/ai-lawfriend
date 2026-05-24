/**
 * Product Phase 28-F — Paid Conversion / Scale RC lock (28-A~E deployment gate SSOT).
 * @see docs/platform/AIBEOPCHIN_PAID_CONVERSION_SCALE_RC_LOCK_SUMMARY.md
 */
export const PAID_CONVERSION_SCALE_RC_LOCK_MARKER_PHASE28F =
  "phase28f-paid-conversion-scale-rc-gate" as const;

export const PAID_CONVERSION_SCALE_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC" as const;

export const PAID_CONVERSION_SCALE_RC_VERSION = "28-F.1" as const;

export const PAID_CONVERSION_SCALE_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-paid-conversion-scale-rc" as const;

export const PAID_CONVERSION_SCALE_RC_ONE_LINE_CRITERION =
  "Paid conversion contract pack·production tenant migration·SLA/support tier·sales/onboarding handoff·scale risk review를 하나의 Product Phase 28 RC로 묶어 유료 전환·스케일 게이트·Phase 27-F cross-link를 잠근다" as const;

export const PAID_CONVERSION_SCALE_RC_SUB_PHASES = {
  "28-A": "Paid Conversion Contract Pack",
  "28-B": "Production Tenant Migration Checklist",
  "28-C": "SLA / Support Tier Policy",
  "28-D": "Sales / Onboarding Handoff Pack",
  "28-E": "Scale Risk Review",
  "28-F": "Paid Conversion / Scale RC",
} as const;

export const PAID_CONVERSION_SCALE_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-paid-conversion-scale-phase28a",
  "verify:aibeopchin-paid-conversion-scale-phase28b",
  "verify:aibeopchin-paid-conversion-scale-phase28c",
  "verify:aibeopchin-paid-conversion-scale-phase28d",
  "verify:aibeopchin-paid-conversion-scale-phase28e",
] as const;

export const PAID_CONVERSION_SCALE_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28A-PAID-CONVERSION-CONTRACT-PACK",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28B-PRODUCTION-TENANT-MIGRATION-CHECKLIST",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28C-SLA-SUPPORT-TIER-POLICY",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28D-SALES-ONBOARDING-HANDOFF-PACK",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28E-SCALE-RISK-REVIEW",
  PAID_CONVERSION_SCALE_RC_EVIDENCE_TAG,
] as const;

export const PAID_CONVERSION_SCALE_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26F-RC",
] as const;

export const PAID_CONVERSION_SCALE_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_PAID_CONVERSION_CONTRACT_PACK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PRODUCTION_TENANT_MIGRATION_CHECKLIST_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SLA_SUPPORT_TIER_POLICY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SALES_ONBOARDING_HANDOFF_PACK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SCALE_RISK_REVIEW_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PAID_CONVERSION_SCALE_RC_RUNBOOK.md",
] as const;

export const PAID_CONVERSION_SCALE_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_PAID_CONVERSION_SCALE_RC_LOCK_SUMMARY.md",
  ...PAID_CONVERSION_SCALE_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const PAID_CONVERSION_SCALE_RC_CONTRACT_PACK_MARKER =
  "phase28a-paid-conversion-contract-gate" as const;

export const PAID_CONVERSION_SCALE_RC_PRODUCT_CROSS_LINK = {
  pilotOperationsMasterVerify: "verify:aibeopchin-pilot-operations-rc",
  pilotOperationsRcEvidence: "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27F-RC",
  tenantRcVerify: "verify:aibeopchin-tenant-rc",
  reliabilityRcVerify: "verify:aibeopchin-reliability-rc",
  operationsMonitoringVerify: "verify:aibeopchin-operations-monitoring-rc",
} as const;

export const PAID_CONVERSION_SCALE_RC_AUDIT_ACTIONS = [] as const;
