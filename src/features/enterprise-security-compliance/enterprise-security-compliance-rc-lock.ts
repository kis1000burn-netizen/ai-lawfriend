/**
 * Product Phase 32-F — Enterprise Security / Compliance RC lock (32-A~E SSOT).
 * @see docs/platform/AIBEOPCHIN_ENTERPRISE_SECURITY_COMPLIANCE_RC_LOCK_SUMMARY.md
 */
export const ENTERPRISE_SECURITY_COMPLIANCE_RC_LOCK_MARKER_PHASE32F =
  "phase32f-enterprise-security-compliance-rc-gate" as const;

export const ENTERPRISE_SECURITY_COMPLIANCE_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC" as const;

export const ENTERPRISE_SECURITY_COMPLIANCE_RC_VERSION = "32-F.1" as const;

export const ENTERPRISE_SECURITY_COMPLIANCE_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-enterprise-security-rc" as const;

export const ENTERPRISE_SECURITY_COMPLIANCE_RC_ONE_LINE_CRITERION =
  "AI법친 Product Phase 32는 대형 법무법인·기업·기관 고객의 보안 심사와 컴플라이언스 요구에 대응하기 위해 접근통제·감사로그·데이터보호·보존/삭제·운영보안·벤더 심사 자료를 하나의 Enterprise Security / Compliance RC로 잠근다" as const;

export const ENTERPRISE_SECURITY_COMPLIANCE_RC_SUB_PHASES = {
  "32-A": "Security Control Inventory",
  "32-B": "Privacy / Data Protection Review Pack",
  "32-C": "Access Control / Audit Evidence Pack",
  "32-D": "Vendor Security Questionnaire Pack",
  "32-E": "Certification Readiness Gap Review",
  "32-F": "Enterprise Security / Compliance RC",
} as const;

export const ENTERPRISE_SECURITY_COMPLIANCE_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-enterprise-security-phase32a",
  "verify:aibeopchin-enterprise-security-phase32b",
  "verify:aibeopchin-enterprise-security-phase32c",
  "verify:aibeopchin-enterprise-security-phase32d",
  "verify:aibeopchin-enterprise-security-phase32e",
] as const;

export const ENTERPRISE_SECURITY_COMPLIANCE_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32A-SECURITY-CONTROL-INVENTORY",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32B-PRIVACY-DATA-PROTECTION",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32C-ACCESS-AUDIT-EVIDENCE",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32D-VENDOR-QUESTIONNAIRE",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32E-CERTIFICATION-GAP-REVIEW",
  ENTERPRISE_SECURITY_COMPLIANCE_RC_EVIDENCE_TAG,
] as const;

export const ENTERPRISE_SECURITY_COMPLIANCE_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18E-RC",
] as const;

export const ENTERPRISE_SECURITY_COMPLIANCE_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_SECURITY_CONTROL_INVENTORY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PRIVACY_DATA_PROTECTION_REVIEW_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_ACCESS_CONTROL_AUDIT_EVIDENCE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_VENDOR_SECURITY_QUESTIONNAIRE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CERTIFICATION_READINESS_GAP_REVIEW_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_ENTERPRISE_SECURITY_COMPLIANCE_RC_RUNBOOK.md",
] as const;

export const ENTERPRISE_SECURITY_COMPLIANCE_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_ENTERPRISE_SECURITY_COMPLIANCE_RC_LOCK_SUMMARY.md",
  ...ENTERPRISE_SECURITY_COMPLIANCE_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const ENTERPRISE_SECURITY_COMPLIANCE_RC_INVENTORY_MARKER =
  "phase32a-security-control-inventory-gate" as const;

export const ENTERPRISE_SECURITY_COMPLIANCE_RC_BOUNDARY = {
  noCertificationClaim: "phase32-no-certification-claim-boundary",
  notClaimed: ["ISMS-P", "ISO27001", "SOC2"],
} as const;

export const ENTERPRISE_SECURITY_COMPLIANCE_RC_PRODUCT_CROSS_LINK = {
  partnerEcosystemMasterVerify: "verify:aibeopchin-partner-ecosystem-rc",
  partnerEcosystemRcEvidence: "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31F-RC",
  enterpriseScaleMasterVerify: "verify:aibeopchin-enterprise-scale-rc",
  dataGovernanceRcVerify: "verify:aibeopchin-data-governance-rc",
  reliabilityRcVerify: "verify:aibeopchin-reliability-rc",
  operationsMonitoringVerify: "verify:aibeopchin-operations-monitoring-rc",
  realMessagingRcVerify: "verify:aibeopchin-real-messaging-rc",
  tenantRcVerify: "verify:aibeopchin-tenant-rc",
} as const;

export const ENTERPRISE_SECURITY_COMPLIANCE_RC_AUDIT_ACTIONS = [] as const;
