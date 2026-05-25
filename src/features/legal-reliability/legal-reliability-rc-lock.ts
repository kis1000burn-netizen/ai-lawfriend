/**
 * Product Phase 47 — Legal Reliability RC lock (47-A~G bundle + platform seal).
 * @see docs/platform/AIBEOPCHIN_LEGAL_RELIABILITY_RC_LOCK_SUMMARY.md
 */
export const LEGAL_RELIABILITY_RC_LOCK_MARKER_PHASE47 =
  "phase47-legal-reliability-rc-gate" as const;

export const LEGAL_RELIABILITY_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47-RC" as const;

export const LEGAL_RELIABILITY_RC_VERSION = "47.1" as const;

export const LEGAL_RELIABILITY_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-rc" as const;

export const LEGAL_RELIABILITY_RC_ONE_LINE_CRITERION =
  "AI법친 Phase 47은 판결문 기반 판단, 양형결과 검토, 증거 무결성, 주장-증거-판결문 graph, court-ready pack, 설명가능성, 중립 사건 검토 Pack을 하나의 Legal Reliability RC로 묶어 법률 신뢰성 기준을 봉인하는 단계다" as const;

export const LEGAL_RELIABILITY_RC_SEVEN_PRINCIPLES = [
  "NO_PREDICTION",
  "NO_GUARANTEE",
  "LAWYER_REVIEW_REQUIRED",
  "NO_COURT_DIRECT_ACCESS",
  "NO_UNREVEALED_SOURCE_OMISSION",
  "NO_AI_OUTPUT_WITHOUT_EVIDENCE_JUDGMENT_TRACE",
] as const;

export const LEGAL_RELIABILITY_RC_BUNDLED_PHASES = [
  "40-F",
  "41-F",
  "42-F",
  "43-F",
  "44-F",
  "45-F",
  "46-F",
] as const;

export const LEGAL_RELIABILITY_RC_SUB_PHASES = {
  "47-A": "Judgment-Grounded Assessment Bundle Gate",
  "47-B": "Sentencing Outcome Assessment Bundle Gate",
  "47-C": "Evidence Integrity Bundle Gate",
  "47-D": "Claim-Evidence-Judgment Graph Bundle Gate",
  "47-E": "Court-Ready Case Record Pack Bundle Gate",
  "47-F": "Explainability Trace Bundle Gate",
  "47-G": "Neutral Litigation Review Pack Bundle Gate",
  "47-RC": "Legal Reliability RC",
} as const;

export const LEGAL_RELIABILITY_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-reliability-phase47a",
  "verify:aibeopchin-legal-reliability-phase47b",
  "verify:aibeopchin-legal-reliability-phase47c",
  "verify:aibeopchin-legal-reliability-phase47d",
  "verify:aibeopchin-legal-reliability-phase47e",
  "verify:aibeopchin-legal-reliability-phase47f",
  "verify:aibeopchin-legal-reliability-phase47g",
] as const;

export const LEGAL_RELIABILITY_RC_BUNDLED_MASTER_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-outcome-assessment-rc",
  "verify:aibeopchin-sentencing-outcome-assessment-rc",
  "verify:aibeopchin-evidence-integrity-rc",
  "verify:aibeopchin-claim-evidence-judgment-graph-rc",
  "verify:aibeopchin-court-ready-case-record-pack-rc",
  "verify:aibeopchin-judicial-transparency-explainability-rc",
  "verify:aibeopchin-neutral-litigation-review-pack-rc",
] as const;

export const LEGAL_RELIABILITY_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47A-JUDGMENT-GROUNDED-BUNDLE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47B-SENTENCING-OUTCOME-BUNDLE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47C-EVIDENCE-INTEGRITY-BUNDLE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47D-CLAIM-GRAPH-BUNDLE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47E-COURT-READY-PACK-BUNDLE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47F-EXPLAINABILITY-TRACE-BUNDLE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47G-NEUTRAL-LITIGATION-PACK-BUNDLE",
  LEGAL_RELIABILITY_RC_EVIDENCE_TAG,
] as const;

export const LEGAL_RELIABILITY_RC_BUNDLED_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46F-RC",
] as const;

export const LEGAL_RELIABILITY_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_EVIDENCE_INTEGRITY_BUNDLE_GATE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_EXPLAINABILITY_TRACE_BUNDLE_GATE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_RC_RUNBOOK.md",
] as const;

export const LEGAL_RELIABILITY_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_LEGAL_RELIABILITY_RC_LOCK_SUMMARY.md",
  ...LEGAL_RELIABILITY_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
  "docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md",
] as const;

export const LEGAL_RELIABILITY_RC_JUDGMENT_GROUNDED_BUNDLE_GATE_MARKER =
  "phase47a-judgment-grounded-assessment-bundle-gate" as const;

export const LEGAL_RELIABILITY_RC_BOUNDARY = {
  noPrediction: "NO_PREDICTION",
  noGuarantee: "NO_GUARANTEE",
  lawyerReviewRequired: "LAWYER_REVIEW_REQUIRED",
  noCourtDirectAccess: "NO_COURT_DIRECT_ACCESS",
  noUnrevealedSourceOmission: "NO_UNREVEALED_SOURCE_OMISSION",
  noAiOutputWithoutEvidenceJudgmentTrace: "NO_AI_OUTPUT_WITHOUT_EVIDENCE_JUDGMENT_TRACE",
  legalReliabilityPolicyOnly: "phase47-legal-reliability-boundary",
} as const;

export const LEGAL_RELIABILITY_RC_AUDIT_ACTIONS = [] as const;
