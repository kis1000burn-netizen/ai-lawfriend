/**
 * Product Phase 59-B — Real-time Legal Signal lock SSOT.
 */
import { PHASE59B_BOUNDARY_MARKERS } from "./phase59b-real-time-legal-signal.policy";
import { PHASE59B_REAL_TIME_LEGAL_SIGNAL_VERSION } from "./phase59b-real-time-legal-signal.schema";
import { PHASE59A_GONGBUHO_MEMORY_PACKET_EVIDENCE_TAG } from "./phase59f-gongbuho-intelligence-rc-lock";

export const PHASE59B_REAL_TIME_LEGAL_SIGNAL_LOCK_MARKER =
  "phase59b-real-time-legal-signal-lock" as const;

export const PHASE59B_REAL_TIME_LEGAL_SIGNAL_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59B-REAL-TIME-LEGAL-SIGNAL" as const;

export const PHASE59B_REAL_TIME_LEGAL_SIGNAL_VERIFY_SCRIPT =
  "verify:aibeopchin-gongbuho-intelligence-phase59b" as const;

export const PHASE59B_REAL_TIME_LEGAL_SIGNAL_FINAL_JUDGMENT =
  "Phase 59-B does not inject real-time statute, precedent, or operations signals directly into AI reasoning. Only APPROVED_FOR_AI_USE signals that pass status transition, source trace, conflict check, freshness, and Compiler Policy gates may be used as strong Gongbuho reasoning grounds." as const;

export const PHASE59B_REAL_TIME_LEGAL_SIGNAL_LOCK = {
  phase: "59-B",
  name: "Real-time Legal Signal Connector",
  version: PHASE59B_REAL_TIME_LEGAL_SIGNAL_VERSION,
  status: "COMPLETE_LOCKED",

  oneLineStandard:
    "실시간 법령·판례·운영 신호를 곧바로 AI 판단 근거로 쓰지 않고, FETCHED → NORMALIZED → RELEVANCE_SCORED → CONFLICT_CHECKED → LAWYER_REVIEW_REQUIRED → APPROVED_FOR_AI_USE 게이트를 통과한 신호만 공부호 추론에 연결한다.",

  lockedBoundaries: PHASE59B_BOUNDARY_MARKERS,

  criticalBoundaryMarkers: [
    "REAL_TIME_SIGNAL_NOT_AUTHORITY",
    "NO_REAL_TIME_SIGNAL_AS_AUTHORITY_WITHOUT_APPROVAL",
    "NO_UNVERIFIED_SIGNAL_IN_STRONG_REASONING",
    "NO_STALE_SIGNAL_IN_AI_CONTEXT",
    "NO_CONFLICTED_SIGNAL_WITHOUT_LAWYER_REVIEW",
    "NO_CLIENT_VISIBLE_REAL_TIME_STRATEGY_WITHOUT_REVIEW",
    "SOURCE_TRACE_REQUIRED_FOR_EVERY_SIGNAL",
    "SIGNAL_STATUS_TRANSITION_REQUIRED",
    "COMPILER_POLICY_REQUIRED_FOR_SIGNAL_USE",
  ] as const,

  verify: PHASE59B_REAL_TIME_LEGAL_SIGNAL_VERIFY_SCRIPT,

  prereqEvidenceTags: [PHASE59A_GONGBUHO_MEMORY_PACKET_EVIDENCE_TAG],

  finalJudgment: PHASE59B_REAL_TIME_LEGAL_SIGNAL_FINAL_JUDGMENT,

  evidenceRefs: [
    "docs/gongbuho/AIBEOPCHIN_GONGBUHO_REAL_TIME_LEGAL_SIGNAL_PHASE59B.md",
    "src/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal.schema.ts",
    "src/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal.policy.ts",
    "src/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal-compiler.ts",
  ],
} as const;
