/**
 * Product Phase 41-F — Sentencing Outcome Assessment RC lock (41-A~E SSOT).
 * @see docs/platform/AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md
 */
export const SENTENCING_OUTCOME_ASSESSMENT_RC_LOCK_MARKER_PHASE41F =
  "phase41f-sentencing-outcome-assessment-rc-gate" as const;

export const SENTENCING_OUTCOME_ASSESSMENT_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41F-RC" as const;

export const SENTENCING_OUTCOME_ASSESSMENT_RC_VERSION = "41-F.1" as const;

export const SENTENCING_OUTCOME_ASSESSMENT_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-sentencing-outcome-assessment-rc" as const;

export const SENTENCING_OUTCOME_ASSESSMENT_RC_ONE_LINE_CRITERION =
  "AI법친 Phase 41은 형사 사건에서 실제 판결문의 선고 결과와 양형 이유를 기준으로 유사 사건의 실형·집행유예·벌금 등 결과 분포, 유리/불리한 양형 요소, 감경 전략 후보를 구조화해 변호사가 양형 가능성을 검토하도록 돕는 단계다" as const;

export const SENTENCING_OUTCOME_ASSESSMENT_RC_SUB_PHASES = {
  "41-A": "Criminal Judgment / Sentencing Corpus Registry",
  "41-B": "Sentencing Factor Extraction",
  "41-C": "Similar Sentencing Outcome Comparison",
  "41-D": "Sentencing Risk / Mitigation Matrix",
  "41-E": "Lawyer Sentencing Review Workspace",
  "41-F": "Sentencing Outcome Assessment RC",
} as const;

export const SENTENCING_OUTCOME_ASSESSMENT_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-sentencing-outcome-assessment-phase41a",
  "verify:aibeopchin-sentencing-outcome-assessment-phase41b",
  "verify:aibeopchin-sentencing-outcome-assessment-phase41c",
  "verify:aibeopchin-sentencing-outcome-assessment-phase41d",
  "verify:aibeopchin-sentencing-outcome-assessment-phase41e",
] as const;

export const SENTENCING_OUTCOME_ASSESSMENT_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41A-SENTENCING-CORPUS",
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41B-SENTENCING-FACTOR",
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41C-SENTENCING-COMPARISON",
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41D-SENTENCING-RISK-MATRIX",
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41E-LAWYER-SENTENCING-REVIEW",
  SENTENCING_OUTCOME_ASSESSMENT_RC_EVIDENCE_TAG,
] as const;

export const SENTENCING_OUTCOME_ASSESSMENT_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC",
] as const;

export const SENTENCING_OUTCOME_ASSESSMENT_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_CRIMINAL_JUDGMENT_SENTENCING_CORPUS_REGISTRY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SENTENCING_FACTOR_EXTRACTION_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SIMILAR_SENTENCING_OUTCOME_COMPARISON_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SENTENCING_RISK_MITIGATION_MATRIX_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LAWYER_SENTENCING_REVIEW_WORKSPACE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_RC_RUNBOOK.md",
] as const;

export const SENTENCING_OUTCOME_ASSESSMENT_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md",
  ...SENTENCING_OUTCOME_ASSESSMENT_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const SENTENCING_OUTCOME_ASSESSMENT_RC_SENTENCING_CORPUS_GATE_MARKER =
  "phase41a-criminal-judgment-sentencing-corpus-registry-gate" as const;

export const SENTENCING_OUTCOME_ASSESSMENT_RC_BOUNDARY = {
  noAutomatedSentencingPrediction: "NO_AUTOMATED_SENTENCING_PREDICTION",
  noSentenceGuarantee: "NO_SENTENCE_GUARANTEE",
  noClientVisibleSentencingProbability: "NO_CLIENT_VISIBLE_SENTENCING_PROBABILITY",
  judgmentReferencesRequired: "JUDGMENT_REFERENCES_REQUIRED",
  sentencingReasonRequired: "SENTENCING_REASON_REQUIRED",
  lawyerReviewRequired: "LAWYER_REVIEW_REQUIRED",
  sentencingOutcomeAssessmentPolicyOnly: "phase41-sentencing-outcome-assessment-boundary",
} as const;

export const SENTENCING_OUTCOME_ASSESSMENT_RC_PRODUCT_CROSS_LINK = {
  judgmentGroundedOutcomeAssessmentMasterVerify: "verify:aibeopchin-legal-outcome-assessment-rc",
  judgmentGroundedOutcomeAssessmentRcEvidence:
    "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40F-RC",
  litigationOperationsMasterVerify: "verify:aibeopchin-litigation-ops-rc",
  enterpriseSecurityComplianceMasterVerify: "verify:aibeopchin-enterprise-security-rc",
} as const;

export const SENTENCING_OUTCOME_ASSESSMENT_RC_AUDIT_ACTIONS = [] as const;
