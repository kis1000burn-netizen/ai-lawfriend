/**
 * Product Phase 46-F — Neutral Litigation Review Pack RC lock (46-A~E SSOT).
 * @see docs/platform/AIBEOPCHIN_NEUTRAL_LITIGATION_REVIEW_PACK_RC_LOCK_SUMMARY.md
 */
export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_LOCK_MARKER_PHASE46F =
  "phase46f-neutral-litigation-review-pack-rc-gate" as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46F-RC" as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_VERSION = "46-F.2" as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-neutral-litigation-review-pack-rc" as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_ONE_LINE_CRITERION =
  "AI법친 Phase 46은 변호사가 법원 제출·조정·심문·합의 준비에 활용할 수 있도록, 내부 전략·민감 상담·미검토 AI 판단을 제외한 중립적 사건 정리 Pack을 변호사 통제 하에 생성·검토하는 단계다" as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_OFFICIAL_CLARIFICATION =
  "AI법친에서 “판사가 봐도 될 정도”라는 표현은 실제 판사 열람 또는 법원 포털 기능을 의미하지 않는다. 이는 변호사가 법원 제출·조정·심문·합의 준비에 활용할 수 있는 중립적 자료의 품질·제외·통제 기준을 의미한다." as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_SUB_PHASES = {
  "46-A": "Neutral Case Summary View",
  "46-B": "Strategy / Confidential Material Exclusion Policy",
  "46-C": "Lawyer-Controlled Export Scope",
  "46-D": "Mediation / Hearing Preparation Pack",
  "46-E": "Neutral Pack Review Workspace",
  "46-F": "Neutral Litigation Review Pack RC",
} as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-neutral-litigation-review-pack-phase46a",
  "verify:aibeopchin-neutral-litigation-review-pack-phase46b",
  "verify:aibeopchin-neutral-litigation-review-pack-phase46c",
  "verify:aibeopchin-neutral-litigation-review-pack-phase46d",
  "verify:aibeopchin-neutral-litigation-review-pack-phase46e",
] as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46A-NEUTRAL-PRESENTATION-VIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46C-STRATEGY-CONFIDENTIAL-SEPARATION",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46B-LAWYER-SELECTED-SCOPE",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46D-UNREVIEWED-AI-FILTER",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46E-COURT-REVIEW-READ-ONLY",
  NEUTRAL_LITIGATION_REVIEW_PACK_RC_EVIDENCE_TAG,
] as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44F-RC",
] as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_NEUTRAL_CASE_SUMMARY_VIEW_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LAWYER_CONTROLLED_EXPORT_SCOPE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_MEDIATION_HEARING_PREPARATION_PACK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_NEUTRAL_PACK_REVIEW_WORKSPACE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_NEUTRAL_LITIGATION_REVIEW_PACK_RC_RUNBOOK.md",
] as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_NEUTRAL_LITIGATION_REVIEW_PACK_RC_LOCK_SUMMARY.md",
  ...NEUTRAL_LITIGATION_REVIEW_PACK_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_NEUTRAL_SUMMARY_GATE_MARKER =
  "phase46a-neutral-case-summary-view-gate" as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_BOUNDARY = {
  noDirectCourtAccess: "NO_DIRECT_COURT_ACCESS",
  noMediatorPortalByDefault: "NO_MEDIATOR_PORTAL_BY_DEFAULT",
  noOpposingPartyAutoShare: "NO_OPPOSING_PARTY_AUTO_SHARE",
  lawyerControlledExportOnly: "LAWYER_CONTROLLED_EXPORT_ONLY",
  noInternalStrategyInNeutralPack: "NO_INTERNAL_STRATEGY_IN_NEUTRAL_PACK",
  noUnreviewedAiOutput: "NO_UNREVIEWED_AI_OUTPUT",
  noClientConfidentialMemo: "NO_CLIENT_CONFIDENTIAL_MEMO",
  neutralLitigationReviewPackPolicyOnly: "phase46-neutral-litigation-review-pack-boundary",
} as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_PRODUCT_CROSS_LINK = {
  judicialTransparencyExplainabilityMasterVerify:
    "verify:aibeopchin-judicial-transparency-explainability-rc",
  judicialTransparencyExplainabilityRcEvidence:
    "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45F-RC",
  courtReadyCaseRecordPackMasterVerify: "verify:aibeopchin-court-ready-case-record-pack-rc",
} as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_LEGAL_RELIABILITY_NEXT_PHASES = [
  "47 — Legal Reliability RC",
] as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_RC_AUDIT_ACTIONS = [] as const;
