/**
 * Product Phase 44-F — Court-Ready Case Record Pack RC lock (44-A~E SSOT).
 * @see docs/platform/AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_RC_LOCK_SUMMARY.md
 */
export const COURT_READY_CASE_RECORD_PACK_RC_LOCK_MARKER_PHASE44F =
  "phase44f-court-ready-case-record-pack-rc-gate" as const;

export const COURT_READY_CASE_RECORD_PACK_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44F-RC" as const;

export const COURT_READY_CASE_RECORD_PACK_RC_VERSION = "44-F.1" as const;

export const COURT_READY_CASE_RECORD_PACK_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-court-ready-case-record-pack-rc" as const;

export const COURT_READY_CASE_RECORD_PACK_RC_ONE_LINE_CRITERION =
  "AI법친 Phase 44는 변호사가 법원 제출·조정·심문 준비에 활용할 수 있도록 사건 요약, 쟁점표, 증거목록, 판결문 근거, 절차 이력, 변호사 검토 상태를 court-ready pack으로 정리하는 단계다" as const;

export const COURT_READY_CASE_RECORD_PACK_RC_SUB_PHASES = {
  "44-A": "Case Summary Pack",
  "44-B": "Issue Table Pack",
  "44-C": "Evidence List Pack",
  "44-D": "Judgment Reference & Procedure History Pack",
  "44-E": "Lawyer Court-Ready Review Workspace",
  "44-F": "Court-Ready Case Record Pack RC",
} as const;

export const COURT_READY_CASE_RECORD_PACK_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-court-ready-case-record-pack-phase44a",
  "verify:aibeopchin-court-ready-case-record-pack-phase44b",
  "verify:aibeopchin-court-ready-case-record-pack-phase44c",
  "verify:aibeopchin-court-ready-case-record-pack-phase44d",
  "verify:aibeopchin-court-ready-case-record-pack-phase44e",
] as const;

export const COURT_READY_CASE_RECORD_PACK_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44A-CASE-SUMMARY-PACK",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44B-ISSUE-TABLE-PACK",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44C-EVIDENCE-LIST-PACK",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44D-JUDGMENT-PROCEDURE-PACK",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44E-LAWYER-COURT-READY-REVIEW",
  COURT_READY_CASE_RECORD_PACK_RC_EVIDENCE_TAG,
] as const;

export const COURT_READY_CASE_RECORD_PACK_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42F-RC",
] as const;

export const COURT_READY_CASE_RECORD_PACK_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_CASE_SUMMARY_PACK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_ISSUE_TABLE_PACK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_EVIDENCE_LIST_PACK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_JUDGMENT_PROCEDURE_PACK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LAWYER_COURT_READY_REVIEW_WORKSPACE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_RC_RUNBOOK.md",
] as const;

export const COURT_READY_CASE_RECORD_PACK_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_RC_LOCK_SUMMARY.md",
  ...COURT_READY_CASE_RECORD_PACK_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const COURT_READY_CASE_RECORD_PACK_RC_CASE_SUMMARY_GATE_MARKER =
  "phase44a-case-summary-pack-gate" as const;

export const COURT_READY_CASE_RECORD_PACK_RC_BOUNDARY = {
  noAutomaticCourtSubmission: "NO_AUTOMATIC_COURT_SUBMISSION",
  noEFilingAutoUpload: "NO_E_FILING_AUTO_UPLOAD",
  noCourtReadyBeforeLawyerReview: "NO_COURT_READY_BEFORE_LAWYER_REVIEW",
  noInternalStrategyGraphInDefaultPack: "NO_INTERNAL_STRATEGY_GRAPH_IN_DEFAULT_PACK",
  noSensitiveClientCounselingAutoInclude: "NO_SENSITIVE_CLIENT_COUNSELING_AUTO_INCLUDE",
  courtReadyCaseRecordPackPolicyOnly: "phase44-court-ready-case-record-pack-boundary",
} as const;

export const COURT_READY_CASE_RECORD_PACK_RC_PRODUCT_CROSS_LINK = {
  claimEvidenceJudgmentGraphMasterVerify: "verify:aibeopchin-claim-evidence-judgment-graph-rc",
  claimEvidenceJudgmentGraphRcEvidence:
    "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43F-RC",
  evidenceIntegrityMasterVerify: "verify:aibeopchin-evidence-integrity-rc",
} as const;

export const COURT_READY_CASE_RECORD_PACK_RC_LEGAL_RELIABILITY_NEXT_PHASES = [
  "45 — Judicial Transparency / Explainability Layer",
  "46 — Neutral Litigation Review Pack",
  "47 — Legal Reliability RC",
] as const;

export const COURT_READY_CASE_RECORD_PACK_RC_AUDIT_ACTIONS = [] as const;
