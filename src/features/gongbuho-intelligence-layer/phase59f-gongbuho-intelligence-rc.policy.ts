/**
 * Product Phase 59-F — Gongbuho Intelligence RC policy SSOT.
 */
import { ValidationError } from "@/lib/errors";

export const PHASE59F_GONGBUHO_INTELLIGENCE_RC_POLICY_MARKER =
  "phase59f-gongbuho-intelligence-rc-policy" as const;

/** Consolidated RC boundaries — 59-A~E sub-phase gates unified for 59-F lock. */
export const PHASE59F_CONSOLIDATED_RC_BOUNDARY_MARKERS = [
  "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
  "NO_AI_CANDIDATE_MEMORY_IN_STRONG_REASONING",
  "NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_CONTEXT",
  "NO_LEARNING_TRACE_WITHOUT_LAWYER_DECISION",
  "NO_REJECTED_SUGGESTION_REUSE",
  "NO_REUSABLE_PATTERN_FROM_REJECTED_TRACE",
  "NO_PATTERN_WITHOUT_ANONYMIZATION",
  "NO_CROSS_TENANT_REASONING_CONTEXT",
  "NO_CLIENT_VISIBLE_REASONING_WITHOUT_LAWYER_REVIEW",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "AUDIT_EVERY_AI_LEARNING",
  "GONGBUHO_INTELLIGENCE_MASTER_VERIFY_REQUIRED",
] as const;

/** Intelligence governance boundaries — must hold across 59-A~E. */
export const PHASE59F_INTELLIGENCE_GOVERNANCE_BOUNDARY_MARKERS = [
  "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
  "LAWYER_CONFIRMED_BEFORE_STRATEGY_USE",
  "REAL_TIME_SIGNAL_NOT_AUTHORITY",
  "NO_AUTO_LEGAL_ADVICE_TO_CLIENT",
  "CASE_SCOPE_FIRST",
  "TENANT_ISOLATION_REQUIRED",
  "ANONYMIZED_PATTERN_ONLY",
  "AUDIT_EVERY_AI_LEARNING",
] as const;

/** Inherited boundaries from Compiler Policy and Action Loop — must not weaken. */
export const PHASE59F_INHERITED_BOUNDARY_MARKERS = [
  "NO_UGC_VECTOR_STORAGE",
  "NO_AI_AUTO_ACTION",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
] as const;

/** RC gate boundaries — all sub-phases must be LOCKED before 59-F RC. */
export const PHASE59F_RC_GATE_BOUNDARY_MARKERS = [
  "NO_INTELLIGENCE_RC_WITHOUT_59A_MEMORY_PACKET_LOCK",
  "NO_INTELLIGENCE_RC_WITHOUT_59B_REALTIME_SIGNAL_LOCK",
  "NO_INTELLIGENCE_RC_WITHOUT_59C_REASONING_ENGINE_LOCK",
  "NO_INTELLIGENCE_RC_WITHOUT_59D_LEARNING_LOOP_LOCK",
  "NO_INTELLIGENCE_RC_WITHOUT_59E_PATTERN_LIBRARY_LOCK",
  "NO_INTELLIGENCE_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_INTELLIGENCE_RC_WITHOUT_PHASE54_STABILIZATION_LOCK",
  "NO_INTELLIGENCE_RC_WITHOUT_MASTER_VERIFY",
] as const;

export const PHASE59F_BOUNDARY_MARKERS = [
  ...PHASE59F_INTELLIGENCE_GOVERNANCE_BOUNDARY_MARKERS,
  ...PHASE59F_INHERITED_BOUNDARY_MARKERS,
  ...PHASE59F_RC_GATE_BOUNDARY_MARKERS,
] as const;

export function evaluateGongbuhoIntelligenceRcGate(input: {
  phase59aMemoryPacketLocked: boolean;
  phase59bRealtimeSignalLocked: boolean;
  phase59cReasoningEngineLocked: boolean;
  phase59dLearningLoopLocked: boolean;
  phase59ePatternLibraryLocked: boolean;
  phase54StabilizationLocked: boolean;
  evidenceChainComplete: boolean;
  masterVerifyPassed: boolean;
}) {
  const blockedReasons: string[] = [];

  if (!input.phase54StabilizationLocked) {
    blockedReasons.push("PHASE_54_STABILIZATION_LOCK_REQUIRED");
  }
  if (!input.phase59aMemoryPacketLocked) {
    blockedReasons.push("PHASE_59A_MEMORY_PACKET_LOCK_REQUIRED");
  }
  if (!input.phase59bRealtimeSignalLocked) {
    blockedReasons.push("PHASE_59B_REALTIME_SIGNAL_LOCK_REQUIRED");
  }
  if (!input.phase59cReasoningEngineLocked) {
    blockedReasons.push("PHASE_59C_REASONING_ENGINE_LOCK_REQUIRED");
  }
  if (!input.phase59dLearningLoopLocked) {
    blockedReasons.push("PHASE_59D_LEARNING_LOOP_LOCK_REQUIRED");
  }
  if (!input.phase59ePatternLibraryLocked) {
    blockedReasons.push("PHASE_59E_PATTERN_LIBRARY_LOCK_REQUIRED");
  }
  if (!input.evidenceChainComplete) {
    blockedReasons.push("GONGBUHO_INTELLIGENCE_EVIDENCE_CHAIN_INCOMPLETE");
  }
  if (!input.masterVerifyPassed) {
    blockedReasons.push("GONGBUHO_INTELLIGENCE_MASTER_VERIFY_NOT_PASSED");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: PHASE59F_BOUNDARY_MARKERS,
    governanceBoundaries: PHASE59F_INTELLIGENCE_GOVERNANCE_BOUNDARY_MARKERS,
    inheritedBoundaries: PHASE59F_INHERITED_BOUNDARY_MARKERS,
    rcGateBoundaries: PHASE59F_RC_GATE_BOUNDARY_MARKERS,
  };
}

export function assertGongbuhoIntelligenceRcGateAllowed(
  input: Parameters<typeof evaluateGongbuhoIntelligenceRcGate>[0],
) {
  const result = evaluateGongbuhoIntelligenceRcGate(input);

  if (result.blockedReasons.includes("PHASE_54_STABILIZATION_LOCK_REQUIRED")) {
    throw new ValidationError("NO_INTELLIGENCE_RC_WITHOUT_PHASE54_STABILIZATION_LOCK");
  }
  if (result.blockedReasons.includes("PHASE_59A_MEMORY_PACKET_LOCK_REQUIRED")) {
    throw new ValidationError("NO_INTELLIGENCE_RC_WITHOUT_59A_MEMORY_PACKET_LOCK");
  }
  if (result.blockedReasons.includes("PHASE_59B_REALTIME_SIGNAL_LOCK_REQUIRED")) {
    throw new ValidationError("NO_INTELLIGENCE_RC_WITHOUT_59B_REALTIME_SIGNAL_LOCK");
  }
  if (result.blockedReasons.includes("PHASE_59C_REASONING_ENGINE_LOCK_REQUIRED")) {
    throw new ValidationError("NO_INTELLIGENCE_RC_WITHOUT_59C_REASONING_ENGINE_LOCK");
  }
  if (result.blockedReasons.includes("PHASE_59D_LEARNING_LOOP_LOCK_REQUIRED")) {
    throw new ValidationError("NO_INTELLIGENCE_RC_WITHOUT_59D_LEARNING_LOOP_LOCK");
  }
  if (result.blockedReasons.includes("PHASE_59E_PATTERN_LIBRARY_LOCK_REQUIRED")) {
    throw new ValidationError("NO_INTELLIGENCE_RC_WITHOUT_59E_PATTERN_LIBRARY_LOCK");
  }
  if (result.blockedReasons.includes("GONGBUHO_INTELLIGENCE_EVIDENCE_CHAIN_INCOMPLETE")) {
    throw new ValidationError("NO_INTELLIGENCE_RC_WITH_BROKEN_EVIDENCE_CHAIN");
  }
  if (result.blockedReasons.includes("GONGBUHO_INTELLIGENCE_MASTER_VERIFY_NOT_PASSED")) {
    throw new ValidationError("NO_INTELLIGENCE_RC_WITHOUT_MASTER_VERIFY");
  }

  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "GONGBUHO_INTELLIGENCE_RC_BLOCKED");
  }

  return result;
}
