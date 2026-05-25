/**
 * Product Phase 45-F — Judicial Transparency / Explainability RC lock (45-A~E SSOT).
 * @see docs/platform/AIBEOPCHIN_JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_LOCK_SUMMARY.md
 */
export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_LOCK_MARKER_PHASE45F =
  "phase45f-judicial-transparency-explainability-rc-gate" as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45F-RC" as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_VERSION = "45-F.1" as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-judicial-transparency-explainability-rc" as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_ONE_LINE_CRITERION =
  "AI법친 Phase 45는 AI가 어떤 사건자료·증거·판결문·검토 이력을 근거로 각 후보 판단과 court-ready pack 항목을 구성했는지 투명하게 설명하는 단계다" as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_CORE_TRACE_DIMENSIONS = [
  "evidenceUsed",
  "judgmentsReferenced",
  "excludedMaterials",
  "linkedClaims",
  "similarityDifferenceAnalysis",
  "uncertaintySignals",
  "lawyerCorrectionHistory",
  "finalReviewer",
] as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_SUB_PHASES = {
  "45-A": "Source Provenance Trace Registry",
  "45-B": "Judgment & Claim Link Explainability Engine",
  "45-C": "Similarity / Difference & Uncertainty Signal Engine",
  "45-D": "Lawyer Correction & Final Reviewer Trace",
  "45-E": "Court-Ready Pack Item Explainability Workspace",
  "45-F": "Judicial Transparency / Explainability RC",
} as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-judicial-transparency-explainability-phase45a",
  "verify:aibeopchin-judicial-transparency-explainability-phase45b",
  "verify:aibeopchin-judicial-transparency-explainability-phase45c",
  "verify:aibeopchin-judicial-transparency-explainability-phase45d",
  "verify:aibeopchin-judicial-transparency-explainability-phase45e",
] as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45A-SOURCE-PROVENANCE-TRACE",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45B-JUDGMENT-CLAIM-EXPLAINABILITY",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45C-SIMILARITY-UNCERTAINTY-SIGNAL",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45D-LAWYER-CORRECTION-REVIEWER-TRACE",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45E-COURT-READY-PACK-EXPLAINABILITY",
  JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_EVIDENCE_TAG,
] as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43F-RC",
] as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_SOURCE_PROVENANCE_TRACE_REGISTRY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_RUNBOOK.md",
] as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_LOCK_SUMMARY.md",
  ...JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_SOURCE_PROVENANCE_GATE_MARKER =
  "phase45a-source-provenance-trace-registry-gate" as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_BOUNDARY = {
  noUnexplainedAiOutput: "NO_UNEXPLAINED_AI_OUTPUT",
  noHiddenSourceOmission: "NO_HIDDEN_SOURCE_OMISSION",
  noClientVisibleExplainabilityWithoutLawyerReview:
    "NO_CLIENT_VISIBLE_EXPLAINABILITY_WITHOUT_LAWYER_REVIEW",
  lawyerReviewRequired: "LAWYER_REVIEW_REQUIRED",
  judicialTransparencyExplainabilityPolicyOnly: "phase45-judicial-transparency-explainability-boundary",
} as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_PRODUCT_CROSS_LINK = {
  courtReadyCaseRecordPackMasterVerify: "verify:aibeopchin-court-ready-case-record-pack-rc",
  courtReadyCaseRecordPackRcEvidence:
    "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44F-RC",
  claimEvidenceJudgmentGraphMasterVerify: "verify:aibeopchin-claim-evidence-judgment-graph-rc",
} as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_LEGAL_RELIABILITY_NEXT_PHASES = [
  "46 — Neutral Litigation Review Pack",
  "47 — Legal Reliability RC",
] as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_AUDIT_ACTIONS = [] as const;
