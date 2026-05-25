/**
 * Product Phase 37-F — Customer Go-Live / Adoption RC lock (37-A~E SSOT).
 * @see docs/platform/AIBEOPCHIN_CUSTOMER_GO_LIVE_ADOPTION_RC_LOCK_SUMMARY.md
 */
export const CUSTOMER_GO_LIVE_ADOPTION_RC_LOCK_MARKER_PHASE37F =
  "phase37f-customer-go-live-adoption-rc-gate" as const;

export const CUSTOMER_GO_LIVE_ADOPTION_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37F-RC" as const;

export const CUSTOMER_GO_LIVE_ADOPTION_RC_VERSION = "37-F.1" as const;

export const CUSTOMER_GO_LIVE_ADOPTION_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-customer-go-live-adoption-rc" as const;

export const CUSTOMER_GO_LIVE_ADOPTION_RC_ONE_LINE_CRITERION =
  "Product Phase 37은 go-live 실행 이후 첫 30일 동안 관리자·변호사·의뢰인 사용 활성도, 이슈, 변경요청, 교육 효과를 추적해 고객 정착 성공 기준을 RC로 잠그는 단계다" as const;

export const CUSTOMER_GO_LIVE_ADOPTION_RC_SUB_PHASES = {
  "37-A": "Go-Live Execution Checklist",
  "37-B": "First 30 Days Adoption Monitoring",
  "37-C": "Admin / Lawyer Activation Review",
  "37-D": "Client Portal Adoption Review",
  "37-E": "Go-Live Issue / Change Request Loop",
  "37-F": "Customer Go-Live / Adoption RC",
} as const;

export const CUSTOMER_GO_LIVE_ADOPTION_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-customer-go-live-adoption-phase37a",
  "verify:aibeopchin-customer-go-live-adoption-phase37b",
  "verify:aibeopchin-customer-go-live-adoption-phase37c",
  "verify:aibeopchin-customer-go-live-adoption-phase37d",
  "verify:aibeopchin-customer-go-live-adoption-phase37e",
] as const;

export const CUSTOMER_GO_LIVE_ADOPTION_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37A-GO-LIVE-EXECUTION-CHECKLIST",
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37B-FIRST-30-DAYS-ADOPTION",
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37C-ADMIN-LAWYER-ACTIVATION",
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37D-CLIENT-PORTAL-ADOPTION",
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37E-GO-LIVE-ISSUE-CHANGE-LOOP",
  CUSTOMER_GO_LIVE_ADOPTION_RC_EVIDENCE_TAG,
] as const;

export const CUSTOMER_GO_LIVE_ADOPTION_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
] as const;

export const CUSTOMER_GO_LIVE_ADOPTION_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_GO_LIVE_EXECUTION_CHECKLIST_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_FIRST_30_DAYS_ADOPTION_MONITORING_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_ADMIN_LAWYER_ACTIVATION_REVIEW_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CLIENT_PORTAL_ADOPTION_REVIEW_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_GO_LIVE_ISSUE_CHANGE_REQUEST_LOOP_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CUSTOMER_GO_LIVE_ADOPTION_RC_RUNBOOK.md",
] as const;

export const CUSTOMER_GO_LIVE_ADOPTION_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_CUSTOMER_GO_LIVE_ADOPTION_RC_LOCK_SUMMARY.md",
  ...CUSTOMER_GO_LIVE_ADOPTION_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const CUSTOMER_GO_LIVE_ADOPTION_RC_EXECUTION_GATE_MARKER =
  "phase37a-go-live-execution-checklist-gate" as const;

export const CUSTOMER_GO_LIVE_ADOPTION_RC_BOUNDARY = {
  noAutoAdoptionSuccessClaim: "NO_AUTO_ADOPTION_SUCCESS_CLAIM",
  noAutoIssueResolution: "NO_AUTO_ISSUE_RESOLUTION",
  adoptionTrackingPolicyOnly: "phase37-customer-go-live-adoption-policy-only-boundary",
} as const;

export const CUSTOMER_GO_LIVE_ADOPTION_RC_PRODUCT_CROSS_LINK = {
  implementationReadinessMasterVerify: "verify:aibeopchin-implementation-readiness-rc",
  implementationReadinessRcEvidence:
    "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36F-RC",
  contractingLegalOpsMasterVerify: "verify:aibeopchin-contracting-legal-ops-rc",
  productionLaunchMasterVerify: "verify:aibeopchin-production-launch-rc",
  clientMobileMasterVerify: "verify:aibeopchin-client-mobile-rc",
} as const;

export const CUSTOMER_GO_LIVE_ADOPTION_RC_AUDIT_ACTIONS = [] as const;
