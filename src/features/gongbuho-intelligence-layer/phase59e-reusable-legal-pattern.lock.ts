/**
 * Product Phase 59-E — Reusable Legal Pattern lock SSOT.
 */
import { PHASE59E_BOUNDARY_MARKERS } from "./phase59e-reusable-legal-pattern.policy";
import { PHASE59E_REUSABLE_LEGAL_PATTERN_VERSION } from "./phase59e-reusable-legal-pattern.schema";
import { PHASE59D_LAWYER_FEEDBACK_LEARNING_EVIDENCE_TAG } from "./phase59d-lawyer-feedback-learning.lock";

export const PHASE59E_REUSABLE_LEGAL_PATTERN_LOCK_MARKER =
  "phase59e-reusable-legal-pattern-lock" as const;

export const PHASE59E_REUSABLE_LEGAL_PATTERN_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59E-REUSABLE-LEGAL-PATTERN" as const;

export const PHASE59E_REUSABLE_LEGAL_PATTERN_VERIFY_SCRIPT =
  "verify:aibeopchin-gongbuho-intelligence-phase59e" as const;

export const PHASE59E_REUSABLE_LEGAL_PATTERN_FINAL_JUDGMENT =
  "Phase 59-E promotes lawyer APPROVED / MODIFIED learning traces into ReusableLegalPattern entries only after anonymization, source trace, audit, and reuse scope checks pass, and allows only APPROVED_FOR_REUSE patterns as Gongbuho reasoning assist grounds." as const;

export const PHASE59E_REUSABLE_LEGAL_PATTERN_LOCK = {
  phase: "59-E",
  name: "Reusable Legal Pattern Library",
  version: PHASE59E_REUSABLE_LEGAL_PATTERN_VERSION,
  status: "COMPLETE_LOCKED",

  oneLineStandard:
    "59-E는 59-D에서 변호사가 APPROVED / MODIFIED로 확정한 학습 trace 중, raw client fact가 제거되고 익명화·scope·audit 조건을 통과한 항목만 ReusableLegalPattern으로 승격하여 사건유형별 약점·반박·증거공백·판례연결 패턴으로 재사용할 수 있게 한다.",

  lockedBoundaries: PHASE59E_BOUNDARY_MARKERS,

  criticalBoundaryMarkers: [
    "NO_REUSABLE_PATTERN_FROM_REJECTED_TRACE",
    "NO_RAW_CLIENT_FACT_IN_PATTERN",
    "NO_PATTERN_WITHOUT_ANONYMIZATION",
    "NO_PATTERN_WITHOUT_LAWYER_APPROVED_OR_MODIFIED_SOURCE",
    "NO_GLOBAL_PATTERN_WITHOUT_EXTRA_GOVERNANCE",
    "NO_CROSS_TENANT_PATTERN_WITHOUT_POLICY",
    "NO_PATTERN_WITHOUT_AUDIT_REF",
    "NO_PATTERN_WITHOUT_SOURCE_TRACE",
    "NO_PATTERN_DIRECTLY_VISIBLE_TO_CLIENT",
    "PATTERN_REUSE_SCOPE_REQUIRED",
  ] as const,

  verify: PHASE59E_REUSABLE_LEGAL_PATTERN_VERIFY_SCRIPT,

  prereqEvidenceTags: [PHASE59D_LAWYER_FEEDBACK_LEARNING_EVIDENCE_TAG],

  finalJudgment: PHASE59E_REUSABLE_LEGAL_PATTERN_FINAL_JUDGMENT,

  evidenceRefs: [
    "docs/gongbuho/AIBEOPCHIN_GONGBUHO_REUSABLE_LEGAL_PATTERN_PHASE59E.md",
    "src/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.schema.ts",
    "src/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.policy.ts",
    "src/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.builder.ts",
  ],
} as const;
