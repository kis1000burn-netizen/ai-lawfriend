/**
 * Product Phase 34-F — Sales Pipeline / Deal Desk RC lock (34-A~E SSOT).
 * @see docs/platform/AIBEOPCHIN_SALES_PIPELINE_DEAL_DESK_RC_LOCK_SUMMARY.md
 */
export const SALES_PIPELINE_DEAL_DESK_RC_LOCK_MARKER_PHASE34F =
  "phase34f-sales-pipeline-deal-desk-rc-gate" as const;

export const SALES_PIPELINE_DEAL_DESK_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34F-RC" as const;

export const SALES_PIPELINE_DEAL_DESK_RC_VERSION = "34-F.1" as const;

export const SALES_PIPELINE_DEAL_DESK_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-sales-pipeline-deal-desk-rc" as const;

export const SALES_PIPELINE_DEAL_DESK_RC_ONE_LINE_CRITERION =
  "Product Phase 34는 Phase 33의 trust·sales assets를 실제 lead, opportunity, proposal, quote, deal review, onboarding handoff 흐름에 연결해 영업 파이프라인과 Deal Desk 운영 기준을 잠근다" as const;

export const SALES_PIPELINE_DEAL_DESK_RC_SUB_PHASES = {
  "34-A": "Sales Pipeline Model",
  "34-B": "Lead / Opportunity Intake",
  "34-C": "Proposal / Quote Desk Policy",
  "34-D": "Deal Risk / Legal Review Gate",
  "34-E": "Sales-to-Onboarding Handoff",
  "34-F": "Sales Pipeline / Deal Desk RC",
} as const;

export const SALES_PIPELINE_DEAL_DESK_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-sales-pipeline-deal-desk-phase34a",
  "verify:aibeopchin-sales-pipeline-deal-desk-phase34b",
  "verify:aibeopchin-sales-pipeline-deal-desk-phase34c",
  "verify:aibeopchin-sales-pipeline-deal-desk-phase34d",
  "verify:aibeopchin-sales-pipeline-deal-desk-phase34e",
] as const;

export const SALES_PIPELINE_DEAL_DESK_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34A-SALES-PIPELINE-MODEL",
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34B-LEAD-OPPORTUNITY-INTAKE",
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34C-PROPOSAL-QUOTE-DESK",
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34D-DEAL-RISK-LEGAL-REVIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34E-SALES-ONBOARDING-HANDOFF",
  SALES_PIPELINE_DEAL_DESK_RC_EVIDENCE_TAG,
] as const;

export const SALES_PIPELINE_DEAL_DESK_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
] as const;

export const SALES_PIPELINE_DEAL_DESK_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_SALES_PIPELINE_MODEL_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LEAD_OPPORTUNITY_INTAKE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_PROPOSAL_QUOTE_DESK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_DEAL_RISK_LEGAL_REVIEW_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SALES_ONBOARDING_HANDOFF_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SALES_PIPELINE_DEAL_DESK_RC_RUNBOOK.md",
] as const;

export const SALES_PIPELINE_DEAL_DESK_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_SALES_PIPELINE_DEAL_DESK_RC_LOCK_SUMMARY.md",
  ...SALES_PIPELINE_DEAL_DESK_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const SALES_PIPELINE_DEAL_DESK_RC_PIPELINE_MARKER = "phase34a-sales-pipeline-gate" as const;

export const SALES_PIPELINE_DEAL_DESK_RC_BOUNDARY = {
  noAutoInvoice: "NO_AUTO_INVOICE",
  noAutoContract: "NO_AUTO_CONTRACT",
  dealDeskPolicyOnly: "phase34-deal-desk-policy-only-boundary",
} as const;

export const SALES_PIPELINE_DEAL_DESK_RC_PRODUCT_CROSS_LINK = {
  publicTrustMarketingMasterVerify: "verify:aibeopchin-public-trust-marketing-rc",
  publicTrustMarketingRcEvidence:
    "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33F-RC",
  paidConversionScaleMasterVerify: "verify:aibeopchin-paid-conversion-scale-rc",
  revenueOpsMasterVerify: "verify:aibeopchin-revenue-ops-rc",
  partnerEcosystemMasterVerify: "verify:aibeopchin-partner-ecosystem-rc",
} as const;

export const SALES_PIPELINE_DEAL_DESK_RC_AUDIT_ACTIONS = [] as const;
