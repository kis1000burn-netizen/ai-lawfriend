/**
 * Product Phase 42-F — Evidence Integrity RC lock (42-A~E SSOT).
 * @see docs/platform/AIBEOPCHIN_EVIDENCE_INTEGRITY_RC_LOCK_SUMMARY.md
 */
export const EVIDENCE_INTEGRITY_RC_LOCK_MARKER_PHASE42F =
  "phase42f-evidence-integrity-rc-gate" as const;

export const EVIDENCE_INTEGRITY_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42F-RC" as const;

export const EVIDENCE_INTEGRITY_RC_VERSION = "42-F.1" as const;

export const EVIDENCE_INTEGRITY_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-evidence-integrity-rc" as const;

export const EVIDENCE_INTEGRITY_RC_ONE_LINE_CRITERION =
  "AI법친 Phase 42는 사건 증거자료의 원본성, 업로드 이력, 해시값, 열람·분석·수정 이력을 추적해 법원 제출 전 증거 신뢰성을 검토할 수 있게 하는 단계다" as const;

export const EVIDENCE_INTEGRITY_RC_SUB_PHASES = {
  "42-A": "Evidence File Hash / Original Preservation",
  "42-B": "Chain of Custody Log",
  "42-C": "AI Extract-to-Source Linkage",
  "42-D": "Evidence Review / Tamper Warning",
  "42-E": "Lawyer Evidence Integrity Review Workspace",
  "42-F": "Evidence Integrity RC",
} as const;

export const EVIDENCE_INTEGRITY_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-evidence-integrity-phase42a",
  "verify:aibeopchin-evidence-integrity-phase42b",
  "verify:aibeopchin-evidence-integrity-phase42c",
  "verify:aibeopchin-evidence-integrity-phase42d",
  "verify:aibeopchin-evidence-integrity-phase42e",
] as const;

export const EVIDENCE_INTEGRITY_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42A-FILE-HASH",
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42B-CHAIN-OF-CUSTODY",
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42C-EXTRACT-LINKAGE",
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42D-REVIEW-TAMPER",
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42E-LAWYER-REVIEW",
  EVIDENCE_INTEGRITY_RC_EVIDENCE_TAG,
] as const;

export const EVIDENCE_INTEGRITY_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC",
] as const;

export const EVIDENCE_INTEGRITY_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_EVIDENCE_CHAIN_OF_CUSTODY_LOG_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_AI_EXTRACT_TO_SOURCE_LINKAGE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_EVIDENCE_REVIEW_TAMPER_WARNING_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_EVIDENCE_INTEGRITY_RC_RUNBOOK.md",
] as const;

export const EVIDENCE_INTEGRITY_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_EVIDENCE_INTEGRITY_RC_LOCK_SUMMARY.md",
  ...EVIDENCE_INTEGRITY_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const EVIDENCE_INTEGRITY_RC_FILE_HASH_GATE_MARKER =
  "phase42a-evidence-file-hash-original-preservation-gate" as const;

export const EVIDENCE_INTEGRITY_RC_BOUNDARY = {
  noAiExtractReplacesOriginal: "NO_AI_EXTRACT_REPLACES_ORIGINAL",
  originalEvidenceTraceRequired: "ORIGINAL_EVIDENCE_TRACE_REQUIRED",
  tamperWarningRequired: "TAMPER_WARNING_REQUIRED",
  lawyerReviewRequired: "LAWYER_REVIEW_REQUIRED",
  originalFilePreserved: "ORIGINAL_FILE_PRESERVED",
  evidenceIntegrityPolicyOnly: "phase42-evidence-integrity-policy-only-boundary",
} as const;

export const EVIDENCE_INTEGRITY_RC_PRODUCT_CROSS_LINK = {
  sentencingOutcomeAssessmentMasterVerify: "verify:aibeopchin-sentencing-outcome-assessment-rc",
  sentencingOutcomeAssessmentRcEvidence:
    "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41F-RC",
  judgmentGroundedOutcomeAssessmentMasterVerify: "verify:aibeopchin-legal-outcome-assessment-rc",
  enterpriseSecurityComplianceMasterVerify: "verify:aibeopchin-enterprise-security-rc",
} as const;

export const EVIDENCE_INTEGRITY_RC_LEGAL_RELIABILITY_NEXT_PHASES = [
  "43 — Claim-Evidence-Judgment Graph",
  "44 — Court-Ready Case Record Pack",
  "45 — Judicial Transparency / Explainability Layer",
  "46 — Neutral Litigation Review Pack",
  "47 — Legal Reliability RC",
] as const;

export const EVIDENCE_INTEGRITY_RC_AUDIT_ACTIONS = [] as const;
