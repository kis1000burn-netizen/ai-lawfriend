/**
 * Product Phase 35-F — Contracting / Legal Ops RC lock (35-A~E SSOT).
 * @see docs/platform/AIBEOPCHIN_CONTRACTING_LEGAL_OPS_RC_LOCK_SUMMARY.md
 */
export const CONTRACTING_LEGAL_OPS_RC_LOCK_MARKER_PHASE35F =
  "phase35f-contracting-legal-ops-rc-gate" as const;

export const CONTRACTING_LEGAL_OPS_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35F-RC" as const;

export const CONTRACTING_LEGAL_OPS_RC_VERSION = "35-F.1" as const;

export const CONTRACTING_LEGAL_OPS_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-contracting-legal-ops-rc" as const;

export const CONTRACTING_LEGAL_OPS_RC_ONE_LINE_CRITERION =
  "Product Phase 35는 Sales Pipeline / Deal Desk 이후 실제 계약 체결 전 필요한 계약서 템플릿, 법무 검토, 주문서/SOW, DPA·보안 부속합의서, 승인 매트릭스를 하나의 Contracting / Legal Ops RC로 잠그는 단계다" as const;

export const CONTRACTING_LEGAL_OPS_RC_SUB_PHASES = {
  "35-A": "Contract Template Pack",
  "35-B": "Legal Review Workflow",
  "35-C": "Order Form / SOW Policy",
  "35-D": "DPA / Security Addendum Pack",
  "35-E": "Signature Readiness / Approval Matrix",
  "35-F": "Contracting / Legal Ops RC",
} as const;

export const CONTRACTING_LEGAL_OPS_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-contracting-legal-ops-phase35a",
  "verify:aibeopchin-contracting-legal-ops-phase35b",
  "verify:aibeopchin-contracting-legal-ops-phase35c",
  "verify:aibeopchin-contracting-legal-ops-phase35d",
  "verify:aibeopchin-contracting-legal-ops-phase35e",
] as const;

export const CONTRACTING_LEGAL_OPS_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35A-CONTRACT-TEMPLATE-PACK",
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35B-LEGAL-REVIEW-WORKFLOW",
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35C-ORDER-FORM-SOW-POLICY",
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35D-DPA-SECURITY-ADDENDUM",
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35E-SIGNATURE-APPROVAL-MATRIX",
  CONTRACTING_LEGAL_OPS_RC_EVIDENCE_TAG,
] as const;

export const CONTRACTING_LEGAL_OPS_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
] as const;

export const CONTRACTING_LEGAL_OPS_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_CONTRACT_TEMPLATE_PACK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LEGAL_REVIEW_WORKFLOW_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_ORDER_FORM_SOW_POLICY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_DPA_SECURITY_ADDENDUM_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SIGNATURE_APPROVAL_MATRIX_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CONTRACTING_LEGAL_OPS_RC_RUNBOOK.md",
] as const;

export const CONTRACTING_LEGAL_OPS_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_CONTRACTING_LEGAL_OPS_RC_LOCK_SUMMARY.md",
  ...CONTRACTING_LEGAL_OPS_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const CONTRACTING_LEGAL_OPS_RC_TEMPLATE_GATE_MARKER = "phase35a-contract-template-gate" as const;

export const CONTRACTING_LEGAL_OPS_RC_BOUNDARY = {
  noAutoContractExecution: "NO_AUTO_CONTRACT_EXECUTION",
  noAutoSignature: "NO_AUTO_SIGNATURE",
  noAutoInvoice: "NO_AUTO_INVOICE",
  contractingPolicyOnly: "phase35-contracting-legal-ops-policy-only-boundary",
} as const;

export const CONTRACTING_LEGAL_OPS_RC_PRODUCT_CROSS_LINK = {
  salesPipelineDealDeskMasterVerify: "verify:aibeopchin-sales-pipeline-deal-desk-rc",
  salesPipelineDealDeskRcEvidence:
    "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34F-RC",
  enterpriseSecurityComplianceMasterVerify: "verify:aibeopchin-enterprise-security-rc",
  enterpriseSecurityComplianceRcEvidence:
    "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC",
  publicTrustMarketingMasterVerify: "verify:aibeopchin-public-trust-marketing-rc",
  paidConversionScaleMasterVerify: "verify:aibeopchin-paid-conversion-scale-rc",
} as const;

export const CONTRACTING_LEGAL_OPS_RC_AUDIT_ACTIONS = [] as const;
