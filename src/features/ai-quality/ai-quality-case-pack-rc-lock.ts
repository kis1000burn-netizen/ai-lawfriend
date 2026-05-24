/**
 * Product Phase 23-F — AI Quality / Case Pack RC lock (23-A~E deployment gate SSOT).
 * @see docs/platform/AIBEOPCHIN_AI_QUALITY_CASE_PACK_RC_LOCK_SUMMARY.md
 */
export const AI_QUALITY_CASE_PACK_RC_LOCK_MARKER_PHASE23F =
  "phase23f-ai-quality-case-pack-rc-gate" as const;

export const AI_QUALITY_CASE_PACK_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23F-RC" as const;

export const AI_QUALITY_CASE_PACK_RC_VERSION = "23-F.1" as const;

export const AI_QUALITY_CASE_PACK_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-ai-quality-rc" as const;

export const AI_QUALITY_CASE_PACK_RC_ONE_LINE_CRITERION =
  "AI 출력 품질 evaluation·변호사 feedback loop·Case Pack builder·Evidence/Timeline/Issue pack·Client-safe progress pack을 하나의 Product Phase 23 RC로 묶어 배포 전 검증·운영 runbook·Phase 10-C client-safe redaction 게이트를 잠근다" as const;

export const AI_QUALITY_CASE_PACK_RC_SUB_PHASES = {
  "23-A": "AI Output Quality Evaluation",
  "23-B": "Lawyer Review Feedback Loop",
  "23-C": "Case Pack Builder",
  "23-D": "Evidence / Timeline / Issue Pack",
  "23-E": "Client-safe Case Progress Pack",
  "23-F": "AI Quality / Case Pack RC",
} as const;

export const AI_QUALITY_CASE_PACK_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-ai-quality-phase23a",
  "verify:aibeopchin-ai-quality-phase23b",
  "verify:aibeopchin-ai-quality-phase23c",
  "verify:aibeopchin-ai-quality-phase23d",
  "verify:aibeopchin-ai-quality-phase23e",
] as const;

export const AI_QUALITY_CASE_PACK_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23A-OUTPUT-QUALITY-EVALUATION",
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23B-LAWYER-REVIEW-FEEDBACK-LOOP",
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23C-CASE-PACK-BUILDER",
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23D-EVIDENCE-TIMELINE-ISSUE-PACK",
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23E-CLIENT-SAFE-CASE-PROGRESS-PACK",
  AI_QUALITY_CASE_PACK_RC_EVIDENCE_TAG,
] as const;

export const AI_QUALITY_CASE_PACK_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC",
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10D-AI-GOVERNANCE-RC-CLOSURE",
] as const;

export const AI_QUALITY_CASE_PACK_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_AI_OUTPUT_QUALITY_EVALUATION_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LAWYER_REVIEW_FEEDBACK_LOOP_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CASE_PACK_BUILDER_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_EVIDENCE_TIMELINE_ISSUE_PACK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CLIENT_SAFE_CASE_PROGRESS_PACK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_AI_QUALITY_CASE_PACK_RC_RUNBOOK.md",
] as const;

export const AI_QUALITY_CASE_PACK_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_AI_QUALITY_CASE_PACK_RC_LOCK_SUMMARY.md",
  ...AI_QUALITY_CASE_PACK_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const AI_QUALITY_CASE_PACK_RC_CLIENT_SAFE_MARKER =
  "phase23e-client-safe-redaction-gate" as const;

export const AI_QUALITY_CASE_PACK_RC_PRODUCT_CROSS_LINK = {
  tenantMasterVerify: "verify:aibeopchin-tenant-rc",
  aiGovernanceRcEvidence:
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10D-AI-GOVERNANCE-RC-CLOSURE",
  clientSafeDisclosureSchema:
    "src/features/ai-core/client-safe-disclosure.schema.ts",
  casePackBuilderService: "src/features/ai-quality/case-pack-builder.service.ts",
  lawyerReviewFeedbackService:
    "src/features/ai-quality/lawyer-review-feedback-loop.service.ts",
} as const;

export const AI_QUALITY_CASE_PACK_RC_AUDIT_ACTIONS = [
  "AI_LAWYER_REVIEW_FEEDBACK_RECORDED",
] as const;
