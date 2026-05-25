/**
 * Product Phase 39-F — Strategic Account Expansion RC lock (39-A~E SSOT).
 * @see docs/platform/AIBEOPCHIN_STRATEGIC_ACCOUNT_EXPANSION_RC_LOCK_SUMMARY.md
 */
export const STRATEGIC_ACCOUNT_EXPANSION_RC_LOCK_MARKER_PHASE39F =
  "phase39f-strategic-account-expansion-rc-gate" as const;

export const STRATEGIC_ACCOUNT_EXPANSION_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39F-RC" as const;

export const STRATEGIC_ACCOUNT_EXPANSION_RC_VERSION = "39-F.1" as const;

export const STRATEGIC_ACCOUNT_EXPANSION_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-strategic-account-expansion-rc" as const;

export const STRATEGIC_ACCOUNT_EXPANSION_RC_ONE_LINE_CRITERION =
  "Product Phase 39는 장기 고객 성공 데이터를 기반으로 전략 고객의 다지점·부서·그룹사·파트너 확장을 계획하고, executive sponsor·governance·risk review를 묶어 Strategic Account Expansion RC로 잠그는 단계다" as const;

export const STRATEGIC_ACCOUNT_EXPANSION_RC_SUB_PHASES = {
  "39-A": "Strategic Account Plan",
  "39-B": "Enterprise Expansion Map",
  "39-C": "Multi-Branch Rollout Playbook",
  "39-D": "Executive Sponsor Review",
  "39-E": "Expansion Risk / Governance Review",
  "39-F": "Strategic Account Expansion RC",
} as const;

export const STRATEGIC_ACCOUNT_EXPANSION_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-strategic-account-expansion-phase39a",
  "verify:aibeopchin-strategic-account-expansion-phase39b",
  "verify:aibeopchin-strategic-account-expansion-phase39c",
  "verify:aibeopchin-strategic-account-expansion-phase39d",
  "verify:aibeopchin-strategic-account-expansion-phase39e",
] as const;

export const STRATEGIC_ACCOUNT_EXPANSION_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39A-STRATEGIC-ACCOUNT-PLAN",
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39B-ENTERPRISE-EXPANSION-MAP",
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39C-MULTI-BRANCH-ROLLOUT",
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39D-EXECUTIVE-SPONSOR-REVIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39E-EXPANSION-RISK-GOVERNANCE",
  STRATEGIC_ACCOUNT_EXPANSION_RC_EVIDENCE_TAG,
] as const;

export const STRATEGIC_ACCOUNT_EXPANSION_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
] as const;

export const STRATEGIC_ACCOUNT_EXPANSION_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_STRATEGIC_ACCOUNT_PLAN_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_ENTERPRISE_EXPANSION_MAP_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_MULTI_BRANCH_ROLLOUT_PLAYBOOK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_EXECUTIVE_SPONSOR_REVIEW_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_EXPANSION_RISK_GOVERNANCE_REVIEW_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_STRATEGIC_ACCOUNT_EXPANSION_RC_RUNBOOK.md",
] as const;

export const STRATEGIC_ACCOUNT_EXPANSION_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_STRATEGIC_ACCOUNT_EXPANSION_RC_LOCK_SUMMARY.md",
  ...STRATEGIC_ACCOUNT_EXPANSION_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const STRATEGIC_ACCOUNT_EXPANSION_RC_ACCOUNT_PLAN_GATE_MARKER =
  "phase39a-strategic-account-plan-gate" as const;

export const STRATEGIC_ACCOUNT_EXPANSION_RC_BOUNDARY = {
  noAutoExpansionExecution: "NO_AUTO_EXPANSION_EXECUTION",
  noAutoMultiBranchProvisioning: "NO_AUTO_MULTI_BRANCH_PROVISIONING",
  noAutoExecutiveSponsorAssignment: "NO_AUTO_EXECUTIVE_SPONSOR_ASSIGNMENT",
  strategicAccountExpansionPolicyOnly: "phase39-strategic-account-expansion-policy-only-boundary",
} as const;

export const STRATEGIC_ACCOUNT_EXPANSION_RC_PRODUCT_CROSS_LINK = {
  longTermCustomerSuccessMasterVerify: "verify:aibeopchin-long-term-customer-success-rc",
  longTermCustomerSuccessRcEvidence:
    "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38F-RC",
  customerGoLiveAdoptionMasterVerify: "verify:aibeopchin-customer-go-live-adoption-rc",
  enterpriseScaleMasterVerify: "verify:aibeopchin-enterprise-scale-rc",
  partnerEcosystemMasterVerify: "verify:aibeopchin-partner-ecosystem-rc",
} as const;

export const STRATEGIC_ACCOUNT_EXPANSION_RC_AUDIT_ACTIONS = [] as const;
