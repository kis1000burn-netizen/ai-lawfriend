/**
 * Product Phase 40-F — Judgment-Grounded Outcome Assessment RC lock (40-A~E SSOT).
 * @see docs/platform/AIBEOPCHIN_JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md
 */
export const LEGAL_OUTCOME_ASSESSMENT_RC_LOCK_MARKER_PHASE40F =
  "phase40f-judgment-grounded-outcome-assessment-rc-gate" as const;

export const LEGAL_OUTCOME_ASSESSMENT_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40F-RC" as const;

export const LEGAL_OUTCOME_ASSESSMENT_RC_VERSION = "40-F.2" as const;

export const LEGAL_OUTCOME_ASSESSMENT_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-outcome-assessment-rc" as const;

export const LEGAL_OUTCOME_ASSESSMENT_RC_ONE_LINE_CRITERION =
  "AI법친 Phase 40은 모든 법률 판단 보조를 판결문 기반으로 구조화하고, 쟁점·증거·입증책임·상대방 항변·결과 시나리오 각 부문마다 관련 판결문을 제시하며, 변호사가 클릭하면 해당 판결문 원문과 적용 분석을 열람할 수 있게 하는 단계다" as const;

export const LEGAL_OUTCOME_ASSESSMENT_RC_SUB_PHASES = {
  "40-A": "Judgment Corpus / Source Registry",
  "40-B": "Judgment Reference Linking Engine",
  "40-C": "Issue / Burden / Evidence Judgment Mapping",
  "40-D": "Similarity / Distinction Analysis",
  "40-E": "Lawyer Judgment Review Workspace",
  "40-F": "Judgment-Grounded Outcome Assessment RC",
} as const;

export const LEGAL_OUTCOME_ASSESSMENT_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-outcome-assessment-phase40a",
  "verify:aibeopchin-legal-outcome-assessment-phase40b",
  "verify:aibeopchin-legal-outcome-assessment-phase40c",
  "verify:aibeopchin-legal-outcome-assessment-phase40d",
  "verify:aibeopchin-legal-outcome-assessment-phase40e",
] as const;

export const LEGAL_OUTCOME_ASSESSMENT_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40A-JUDGMENT-CORPUS",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40B-JUDGMENT-LINKING",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40C-JUDGMENT-MAPPING",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40D-SIMILARITY-DISTINCTION",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40E-LAWYER-REVIEW-WORKSPACE",
  LEGAL_OUTCOME_ASSESSMENT_RC_EVIDENCE_TAG,
] as const;

export const LEGAL_OUTCOME_ASSESSMENT_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC",
] as const;

export const LEGAL_OUTCOME_ASSESSMENT_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_JUDGMENT_CORPUS_SOURCE_REGISTRY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_JUDGMENT_REFERENCE_LINKING_ENGINE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SIMILARITY_DISTINCTION_ANALYSIS_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LAWYER_JUDGMENT_REVIEW_WORKSPACE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_RC_RUNBOOK.md",
] as const;

export const LEGAL_OUTCOME_ASSESSMENT_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md",
  ...LEGAL_OUTCOME_ASSESSMENT_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const LEGAL_OUTCOME_ASSESSMENT_RC_JUDGMENT_CORPUS_GATE_MARKER =
  "phase40a-judgment-corpus-source-registry-gate" as const;

export const LEGAL_OUTCOME_ASSESSMENT_RC_BOUNDARY = {
  noJudgmentlessLegalAssessment: "NO_JUDGMENTLESS_LEGAL_ASSESSMENT",
  noUncitedPrecedentClaim: "NO_UNCITED_PRECEDENT_CLAIM",
  noClientVisibleJudgmentPrediction: "NO_CLIENT_VISIBLE_JUDGMENT_PREDICTION",
  lawyerReviewRequired: "LAWYER_REVIEW_REQUIRED",
  officialOrLicensedSourceRequired: "OFFICIAL_OR_LICENSED_SOURCE_REQUIRED",
  judgmentGroundedOutcomeAssessmentPolicyOnly:
    "phase40-judgment-grounded-outcome-assessment-boundary",
} as const;

export const LEGAL_OUTCOME_ASSESSMENT_RC_PRODUCT_CROSS_LINK = {
  strategicAccountExpansionMasterVerify: "verify:aibeopchin-strategic-account-expansion-rc",
  strategicAccountExpansionRcEvidence:
    "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39F-RC",
  aiQualityMasterVerify: "verify:aibeopchin-ai-quality-rc",
  litigationOperationsMasterVerify: "verify:aibeopchin-litigation-ops-rc",
  enterpriseSecurityComplianceMasterVerify: "verify:aibeopchin-enterprise-security-rc",
} as const;

export const LEGAL_OUTCOME_ASSESSMENT_RC_AUDIT_ACTIONS = [] as const;
