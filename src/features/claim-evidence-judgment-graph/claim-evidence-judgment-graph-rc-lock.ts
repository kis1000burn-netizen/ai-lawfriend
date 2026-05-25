/**
 * Product Phase 43-F — Claim-Evidence-Judgment Graph RC lock (43-A~E SSOT).
 * @see docs/platform/AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_LOCK_SUMMARY.md
 */
export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_LOCK_MARKER_PHASE43F =
  "phase43f-claim-evidence-judgment-graph-rc-gate" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43F-RC" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_VERSION = "43-F.1" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-claim-evidence-judgment-graph-rc" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_ONE_LINE_CRITERION =
  "AI법친 Phase 43은 각 주장·항변·쟁점마다 관련 증거와 판결문을 연결해, 사건의 논리 구조를 graph로 검토할 수 있게 하는 단계다" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_SUB_PHASES = {
  "43-A": "Claim / Issue Graph Registry",
  "43-B": "Claim-Evidence Edge Engine",
  "43-C": "Issue-Judgment Edge Engine",
  "43-D": "Opponent Argument / Risk Signal Graph",
  "43-E": "Lawyer Claim Graph Review Workspace",
  "43-F": "Claim-Evidence-Judgment Graph RC",
} as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-claim-evidence-judgment-graph-phase43a",
  "verify:aibeopchin-claim-evidence-judgment-graph-phase43b",
  "verify:aibeopchin-claim-evidence-judgment-graph-phase43c",
  "verify:aibeopchin-claim-evidence-judgment-graph-phase43d",
  "verify:aibeopchin-claim-evidence-judgment-graph-phase43e",
] as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43A-CLAIM-ISSUE-REGISTRY",
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43B-CLAIM-EVIDENCE-EDGE",
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43C-ISSUE-JUDGMENT-EDGE",
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43D-OPPONENT-RISK-GRAPH",
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43E-LAWYER-GRAPH-REVIEW",
  CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_EVIDENCE_TAG,
] as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40F-RC",
] as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_CLAIM_ISSUE_GRAPH_REGISTRY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CLAIM_EVIDENCE_EDGE_ENGINE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_ISSUE_JUDGMENT_EDGE_ENGINE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_RUNBOOK.md",
] as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_LOCK_SUMMARY.md",
  ...CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_CLAIM_ISSUE_GATE_MARKER =
  "phase43a-claim-issue-graph-registry-gate" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_BOUNDARY = {
  noUnlinkedClaimGraph: "NO_UNLINKED_CLAIM_GRAPH",
  noJudgmentlessIssueLink: "NO_JUDGMENTLESS_ISSUE_LINK",
  aiCandidateLinkNotFinal: "AI_CANDIDATE_LINK_NOT_FINAL",
  noClientVisibleStrategyGraph: "NO_CLIENT_VISIBLE_STRATEGY_GRAPH",
  lawyerReviewRequired: "LAWYER_REVIEW_REQUIRED",
  claimEvidenceJudgmentGraphPolicyOnly: "phase43-claim-evidence-judgment-graph-boundary",
} as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_PRODUCT_CROSS_LINK = {
  evidenceIntegrityMasterVerify: "verify:aibeopchin-evidence-integrity-rc",
  evidenceIntegrityRcEvidence: "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42F-RC",
  judgmentGroundedOutcomeAssessmentMasterVerify: "verify:aibeopchin-legal-outcome-assessment-rc",
} as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_LEGAL_RELIABILITY_NEXT_PHASES = [
  "44 — Court-Ready Case Record Pack",
  "45 — Judicial Transparency / Explainability Layer",
  "46 — Neutral Litigation Review Pack",
  "47 — Legal Reliability RC",
] as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_AUDIT_ACTIONS = [] as const;
