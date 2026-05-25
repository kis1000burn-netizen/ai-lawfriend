/**
 * Product Phase 33-F — Public Trust / Marketing Launch RC lock (33-A~E SSOT).
 * @see docs/platform/AIBEOPCHIN_PUBLIC_TRUST_MARKETING_RC_LOCK_SUMMARY.md
 */
export const PUBLIC_TRUST_MARKETING_RC_LOCK_MARKER_PHASE33F =
  "phase33f-public-trust-marketing-rc-gate" as const;

export const PUBLIC_TRUST_MARKETING_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33F-RC" as const;

export const PUBLIC_TRUST_MARKETING_RC_VERSION = "33-F.1" as const;

export const PUBLIC_TRUST_MARKETING_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-public-trust-marketing-rc" as const;

export const PUBLIC_TRUST_MARKETING_RC_ONE_LINE_CRITERION =
  "AI법친 Product Phase 33은 Phase 32 보안·컴플라이언스 증빙을 바탕으로 trust center·세일즈 덱·랜딩 메시지·고객 사례·엔터프라이즈 제안 kit를 하나의 Public Trust / Marketing Launch RC로 잠근다" as const;

export const PUBLIC_TRUST_MARKETING_RC_SUB_PHASES = {
  "33-A": "Trust Center Content Pack",
  "33-B": "Sales Demo / Pitch Deck Pack",
  "33-C": "Website / Landing Message Refresh",
  "33-D": "Customer Proof / Case Study Template",
  "33-E": "Partner / Enterprise Proposal Kit",
  "33-F": "Public Trust / Marketing Launch RC",
} as const;

export const PUBLIC_TRUST_MARKETING_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-public-trust-marketing-phase33a",
  "verify:aibeopchin-public-trust-marketing-phase33b",
  "verify:aibeopchin-public-trust-marketing-phase33c",
  "verify:aibeopchin-public-trust-marketing-phase33d",
  "verify:aibeopchin-public-trust-marketing-phase33e",
] as const;

export const PUBLIC_TRUST_MARKETING_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33A-TRUST-CENTER-CONTENT",
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33B-SALES-DEMO-PITCH-DECK",
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33C-WEBSITE-LANDING-MESSAGE",
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33D-CASE-STUDY-TEMPLATE",
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33E-PROPOSAL-KIT",
  PUBLIC_TRUST_MARKETING_RC_EVIDENCE_TAG,
] as const;

export const PUBLIC_TRUST_MARKETING_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
] as const;

export const PUBLIC_TRUST_MARKETING_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_TRUST_CENTER_CONTENT_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SALES_DEMO_PITCH_DECK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_WEBSITE_LANDING_MESSAGE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CUSTOMER_PROOF_CASE_STUDY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PARTNER_ENTERPRISE_PROPOSAL_KIT_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PUBLIC_TRUST_MARKETING_RC_RUNBOOK.md",
] as const;

export const PUBLIC_TRUST_MARKETING_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_PUBLIC_TRUST_MARKETING_RC_LOCK_SUMMARY.md",
  ...PUBLIC_TRUST_MARKETING_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const PUBLIC_TRUST_MARKETING_RC_TRUST_CENTER_MARKER =
  "phase33a-trust-center-content-gate" as const;

export const PUBLIC_TRUST_MARKETING_RC_BOUNDARY = {
  noUnverifiedMarketingClaim: "phase33-no-unverified-marketing-claim-boundary",
  notAllowed: ["fabricated customer logos", "unverified performance claims"],
} as const;

export const PUBLIC_TRUST_MARKETING_RC_PRODUCT_CROSS_LINK = {
  enterpriseSecurityComplianceMasterVerify: "verify:aibeopchin-enterprise-security-rc",
  enterpriseSecurityComplianceRcEvidence:
    "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC",
  partnerEcosystemMasterVerify: "verify:aibeopchin-partner-ecosystem-rc",
  productionLaunchRcEvidence: "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
  paidConversionScaleRcVerify: "verify:aibeopchin-paid-conversion-scale-rc",
} as const;

export const PUBLIC_TRUST_MARKETING_RC_AUDIT_ACTIONS = [] as const;
