/**
 * Product Phase 31-F — Partner Ecosystem RC lock (31-A~E partner gate SSOT).
 * @see docs/platform/AIBEOPCHIN_PARTNER_ECOSYSTEM_RC_LOCK_SUMMARY.md
 */
export const PARTNER_ECOSYSTEM_RC_LOCK_MARKER_PHASE31F = "phase31f-partner-ecosystem-rc-gate" as const;

export const PARTNER_ECOSYSTEM_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31F-RC" as const;

export const PARTNER_ECOSYSTEM_RC_VERSION = "31-F.1" as const;

export const PARTNER_ECOSYSTEM_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-partner-ecosystem-rc" as const;

export const PARTNER_ECOSYSTEM_RC_ONE_LINE_CRITERION =
  "AI법친을 법무법인 단일 SaaS에서 제휴 변호사·전문가·지점·파트너 네트워크가 함께 참여하는 파트너 생태계·마켓플레이스 준비 게이트를 Product Phase 31 RC로 묶어 Phase 30-F cross-link를 잠근다" as const;

export const PARTNER_ECOSYSTEM_RC_SUB_PHASES = {
  "31-A": "Partner Program Model",
  "31-B": "Partner Referral / Revenue Share Policy",
  "31-C": "Expert Network Case Routing",
  "31-D": "Marketplace Listing / Service Catalog",
  "31-E": "Partner Quality / Compliance Review",
  "31-F": "Partner Ecosystem RC",
} as const;

export const PARTNER_ECOSYSTEM_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-partner-ecosystem-phase31a",
  "verify:aibeopchin-partner-ecosystem-phase31b",
  "verify:aibeopchin-partner-ecosystem-phase31c",
  "verify:aibeopchin-partner-ecosystem-phase31d",
  "verify:aibeopchin-partner-ecosystem-phase31e",
] as const;

export const PARTNER_ECOSYSTEM_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31A-PARTNER-PROGRAM-MODEL",
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31B-REFERRAL-REVENUE-SHARE",
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31C-EXPERT-NETWORK-ROUTING",
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31D-MARKETPLACE-CATALOG",
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31E-PARTNER-QUALITY-COMPLIANCE",
  PARTNER_ECOSYSTEM_RC_EVIDENCE_TAG,
] as const;

export const PARTNER_ECOSYSTEM_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC",
] as const;

export const PARTNER_ECOSYSTEM_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_PARTNER_PROGRAM_MODEL_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PARTNER_REFERRAL_REVENUE_SHARE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_EXPERT_NETWORK_CASE_ROUTING_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_MARKETPLACE_SERVICE_CATALOG_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PARTNER_QUALITY_COMPLIANCE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PARTNER_ECOSYSTEM_RC_RUNBOOK.md",
] as const;

export const PARTNER_ECOSYSTEM_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_PARTNER_ECOSYSTEM_RC_LOCK_SUMMARY.md",
  ...PARTNER_ECOSYSTEM_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const PARTNER_ECOSYSTEM_RC_PROGRAM_MARKER = "phase31a-partner-program-gate" as const;

export const PARTNER_ECOSYSTEM_RC_PRODUCT_CROSS_LINK = {
  enterpriseScaleMasterVerify: "verify:aibeopchin-enterprise-scale-rc",
  enterpriseScaleRcEvidence: "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30F-RC",
  revenueOpsMasterVerify: "verify:aibeopchin-revenue-ops-rc",
  revenueOpsRcEvidence: "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29F-RC",
  tenantRcVerify: "verify:aibeopchin-tenant-rc",
  noAutoPayoutMarker: "NO_AUTO_PAYOUT",
} as const;

export const PARTNER_ECOSYSTEM_RC_AUDIT_ACTIONS = [] as const;
