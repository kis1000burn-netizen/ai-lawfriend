/**
 * Product Phase 48-F — Legal Reliability Lawyer Workbench UX RC lock.
 * @see docs/platform/AIBEOPCHIN_LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_LOCK_SUMMARY.md
 */
export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_LOCK_MARKER_PHASE48 =
  "phase48f-legal-reliability-lawyer-workbench-rc-gate" as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48F-RC" as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_VERSION = "48-F.1" as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-lawyer-workbench-rc" as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_ONE_LINE_CRITERION =
  "AI법친 Phase 48은 Phase 40~47의 판결문 기반 판단, 양형결과, 증거 무결성, 주장-증거-판결문 graph, court-ready pack, explainability trace, 중립 사건 정리 pack을 변호사 사건 상세 화면에서 하나의 업무 흐름으로 사용할 수 있게 재구성하는 Lawyer Workbench UX 단계다" as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_WORKBENCH_ROUTE =
  "/cases/{caseId}/lawyer-workbench" as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_SIX_BOUNDARIES = [
  "NO_AI_FINAL_STRATEGY",
  "NO_CLIENT_VISIBLE_STRATEGY_GRAPH",
  "LAWYER_REVIEW_REQUIRED",
  "JUDGMENT_CLICKTHROUGH_REQUIRED",
  "NO_COURT_AUTO_SUBMISSION",
  "NO_UNEXPLAINED_WORKBENCH_ITEM",
] as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_SUB_PHASES = {
  "48-A": "Lawyer Workbench Navigation Shell",
  "48-B": "Litigation Risk Radar Panel",
  "48-C": "Claim-Evidence-Judgment Graph Workspace",
  "48-D": "Judgment Drawer / Precedent Viewer",
  "48-E": "Court-ready Pack Builder UX",
  "48-F": "Legal Reliability Lawyer Workbench UX RC",
} as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-reliability-lawyer-workbench-phase48a",
  "verify:aibeopchin-legal-reliability-lawyer-workbench-phase48b",
  "verify:aibeopchin-legal-reliability-lawyer-workbench-phase48c",
  "verify:aibeopchin-legal-reliability-lawyer-workbench-phase48d",
  "verify:aibeopchin-legal-reliability-lawyer-workbench-phase48e",
] as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_BUNDLED_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-reliability-rc",
] as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48A-NAVIGATION-SHELL",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48B-LITIGATION-RISK-RADAR",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48C-CLAIM-GRAPH-WORKSPACE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48D-JUDGMENT-DRAWER",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48E-COURT-READY-PACK-BUILDER",
  LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_EVIDENCE_TAG,
] as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47-RC",
] as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_LAWYER_WORKBENCH_NAVIGATION_SHELL_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LITIGATION_RISK_RADAR_PANEL_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_JUDGMENT_DRAWER_PRECEDENT_VIEWER_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_COURT_READY_PACK_BUILDER_UX_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_RUNBOOK.md",
] as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_BOUNDARY = {
  noAiFinalStrategy: "NO_AI_FINAL_STRATEGY",
  noClientVisibleStrategyGraph: "NO_CLIENT_VISIBLE_STRATEGY_GRAPH",
  lawyerReviewRequired: "LAWYER_REVIEW_REQUIRED",
  judgmentClickthroughRequired: "JUDGMENT_CLICKTHROUGH_REQUIRED",
  noCourtAutoSubmission: "NO_COURT_AUTO_SUBMISSION",
  noUnexplainedWorkbenchItem: "NO_UNEXPLAINED_WORKBENCH_ITEM",
  workbenchPolicyOnly: "phase48-legal-reliability-lawyer-workbench-boundary",
} as const;
