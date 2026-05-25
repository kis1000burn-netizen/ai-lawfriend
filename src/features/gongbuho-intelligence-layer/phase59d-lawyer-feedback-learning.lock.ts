/**
 * Product Phase 59-D — Lawyer Feedback Learning lock SSOT.
 */
import { PHASE59D_BOUNDARY_MARKERS } from "./phase59d-lawyer-feedback-learning.policy";
import { PHASE59D_LAWYER_FEEDBACK_LEARNING_VERSION } from "./phase59d-lawyer-feedback-learning.schema";
import { PHASE59C_GONGBUHO_REASONING_CONTEXT_EVIDENCE_TAG } from "./phase59f-gongbuho-intelligence-rc-lock";

export const PHASE59D_LAWYER_FEEDBACK_LEARNING_LOCK_MARKER =
  "phase59d-lawyer-feedback-learning-lock" as const;

export const PHASE59D_LAWYER_FEEDBACK_LEARNING_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59D-LAWYER-FEEDBACK-LEARNING" as const;

export const PHASE59D_LAWYER_FEEDBACK_LEARNING_VERIFY_SCRIPT =
  "verify:aibeopchin-gongbuho-intelligence-phase59d" as const;

export const PHASE59D_LAWYER_FEEDBACK_LEARNING_FINAL_JUDGMENT =
  "Phase 59-D records lawyer APPROVED / MODIFIED / REJECTED decisions on 59-C reasoning candidates as GongbuhoLearningTrace entries, blocks REJECTED and raw client fact reuse, and allows only audited, source-bundle-linked, anonymized feedback for future Gongbuho intelligence improvement." as const;

export const PHASE59D_LAWYER_FEEDBACK_LEARNING_LOCK = {
  phase: "59-D",
  name: "Lawyer Feedback Learning Loop",
  version: PHASE59D_LAWYER_FEEDBACK_LEARNING_VERSION,
  status: "COMPLETE_LOCKED",

  oneLineStandard:
    "59-D는 59-C Reasoning Context에서 생성된 약점·반박·증거공백·주장연결 후보에 대해 변호사의 APPROVED / MODIFIED / REJECTED 판단을 GongbuhoLearningTrace로 기록하고, 확정된 피드백만 향후 사건 판단 품질 개선에 사용할 수 있도록 잠근다.",

  lockedBoundaries: PHASE59D_BOUNDARY_MARKERS,

  criticalBoundaryMarkers: [
    "NO_LEARNING_TRACE_WITHOUT_LAWYER_DECISION",
    "NO_REJECTED_SUGGESTION_REUSE",
    "NO_RAW_CLIENT_FACT_IN_REUSABLE_TRACE",
    "NO_GLOBAL_REUSE_WITHOUT_ANONYMIZATION",
    "NO_CROSS_TENANT_LEARNING_WITHOUT_POLICY",
    "NO_AI_SELF_REINFORCEMENT_WITHOUT_REVIEW",
    "NO_LEARNING_TRACE_WITHOUT_SOURCE_BUNDLE",
    "NO_LEARNING_TRACE_WITHOUT_AUDIT_REF",
    "LAWYER_DECISION_LEDGER_REQUIRED",
  ] as const,

  verify: PHASE59D_LAWYER_FEEDBACK_LEARNING_VERIFY_SCRIPT,

  prereqEvidenceTags: [PHASE59C_GONGBUHO_REASONING_CONTEXT_EVIDENCE_TAG],

  finalJudgment: PHASE59D_LAWYER_FEEDBACK_LEARNING_FINAL_JUDGMENT,

  evidenceRefs: [
    "docs/gongbuho/AIBEOPCHIN_GONGBUHO_LAWYER_FEEDBACK_LEARNING_PHASE59D.md",
    "src/features/gongbuho-intelligence-layer/phase59d-lawyer-feedback-learning.schema.ts",
    "src/features/gongbuho-intelligence-layer/phase59d-lawyer-feedback-learning.policy.ts",
    "src/features/gongbuho-intelligence-layer/phase59d-lawyer-feedback-learning.service.ts",
  ],
} as const;
