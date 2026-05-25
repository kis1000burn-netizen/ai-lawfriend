/**
 * Product Phase 59-C — Gongbuho Reasoning Context lock SSOT.
 */
import { PHASE59C_BOUNDARY_MARKERS } from "./phase59c-gongbuho-reasoning-context.policy";
import { PHASE59C_GONGBUHO_REASONING_CONTEXT_VERSION } from "./phase59c-gongbuho-reasoning-context.schema";
import {
  PHASE59A_GONGBUHO_MEMORY_PACKET_EVIDENCE_TAG,
  PHASE59B_GONGBUHO_REAL_TIME_LEGAL_SIGNAL_EVIDENCE_TAG,
} from "./phase59f-gongbuho-intelligence-rc-lock";

export const PHASE59C_GONGBUHO_REASONING_CONTEXT_LOCK_MARKER =
  "phase59c-gongbuho-reasoning-context-lock" as const;

export const PHASE59C_GONGBUHO_REASONING_CONTEXT_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59C-REASONING-CONTEXT" as const;

export const PHASE59C_GONGBUHO_REASONING_CONTEXT_VERIFY_SCRIPT =
  "verify:aibeopchin-gongbuho-intelligence-phase59c" as const;

export const PHASE59C_GONGBUHO_REASONING_CONTEXT_FINAL_JUDGMENT =
  "Phase 59-C assembles only LAWYER_CONFIRMED / LOCKED Gongbuho memory items and APPROVED_FOR_AI_USE real-time signals into a GongbuhoReasoningContextBundle within case and tenant scope, excluding AI_CANDIDATE memory, unapproved or conflicted or stale signals, and sourceless or cross-scope items." as const;

export const PHASE59C_GONGBUHO_REASONING_CONTEXT_LOCK = {
  phase: "59-C",
  name: "Gongbuho Retrieval-Augmented Reasoning",
  version: PHASE59C_GONGBUHO_REASONING_CONTEXT_VERSION,
  status: "COMPLETE_LOCKED",

  oneLineStandard:
    "59-C는 LAWYER_CONFIRMED / LOCKED 공부호 항목과 APPROVED_FOR_AI_USE 실시간 신호만 선택적으로 조립하여, 주장·증거·판례·약점·반박 후보를 사건 범위 안에서 추론 가능한 AI context bundle로 만든다.",

  lockedBoundaries: PHASE59C_BOUNDARY_MARKERS,

  criticalBoundaryMarkers: [
    "NO_AI_CANDIDATE_MEMORY_IN_STRONG_REASONING",
    "NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_CONTEXT",
    "NO_CROSS_TENANT_REASONING_CONTEXT",
    "NO_CROSS_CASE_MEMORY_MERGE_WITHOUT_POLICY",
    "NO_SOURCELESS_CONTEXT_ITEM",
    "NO_CLIENT_VISIBLE_REASONING_WITHOUT_LAWYER_REVIEW",
    "NO_STRATEGY_OUTPUT_WITHOUT_REASONING_LIMITS",
    "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
    "CONTEXT_BUNDLE_AUDIT_REQUIRED",
  ] as const,

  verify: PHASE59C_GONGBUHO_REASONING_CONTEXT_VERIFY_SCRIPT,

  prereqEvidenceTags: [
    PHASE59A_GONGBUHO_MEMORY_PACKET_EVIDENCE_TAG,
    PHASE59B_GONGBUHO_REAL_TIME_LEGAL_SIGNAL_EVIDENCE_TAG,
  ],

  finalJudgment: PHASE59C_GONGBUHO_REASONING_CONTEXT_FINAL_JUDGMENT,

  evidenceRefs: [
    "docs/gongbuho/AIBEOPCHIN_GONGBUHO_REASONING_CONTEXT_PHASE59C.md",
    "src/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema.ts",
    "src/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.policy.ts",
    "src/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder.ts",
  ],
} as const;
