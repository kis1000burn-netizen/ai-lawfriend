/**
 * Product Phase 59-B — Real-time Legal Signal Compiler gate SSOT.
 * Bridges Gongbuho Compiler Policy with signal use in reasoning and prompt context.
 */
import { ValidationError } from "@/lib/errors";
import {
  validateCanonicalSourceRefs,
  type CanonicalSourceRefInput,
} from "@/lib/gongbuho/legal-knowledge-pipeline-gates";
import {
  REAL_TIME_LEGAL_SIGNAL_MIN_CASE_RELEVANCE_SCORE,
  REAL_TIME_LEGAL_SIGNAL_STRONG_REASONING_STATUS,
  type RealTimeLegalSignal,
} from "./phase59b-real-time-legal-signal.schema";
import {
  evaluateRealTimeLegalSignalScope,
  evaluateRealTimeLegalSignalSourceTrace,
  isRealTimeLegalSignalBlockedStatus,
} from "./phase59b-real-time-legal-signal.policy";

export const PHASE59B_REAL_TIME_LEGAL_SIGNAL_COMPILER_MARKER =
  "phase59b-real-time-legal-signal-compiler" as const;

export type RealTimeLegalSignalCompilerDecision = {
  allowed: boolean;
  blockedReasons: string[];
  boundaryMarkers: string[];
};

function baseSignalChecks(signal: RealTimeLegalSignal) {
  const blockedReasons: string[] = [];

  const scope = evaluateRealTimeLegalSignalScope(signal);
  if (!scope.allowed) blockedReasons.push(scope.blockedReason ?? "CASE_SCOPE_FIRST");

  const trace = evaluateRealTimeLegalSignalSourceTrace(signal);
  if (!trace.allowed) {
    blockedReasons.push(trace.blockedReason ?? "SOURCE_TRACE_REQUIRED_FOR_EVERY_SIGNAL");
  }

  if (isRealTimeLegalSignalBlockedStatus(signal.status)) {
    blockedReasons.push(`SIGNAL_BLOCKED:${signal.status}`);
  }

  if (signal.status === "STALE") {
    blockedReasons.push("NO_STALE_SIGNAL_IN_AI_CONTEXT");
  }

  if (signal.conflictStatus === "CONFLICTED") {
    blockedReasons.push("NO_CONFLICTED_SIGNAL_WITHOUT_LAWYER_REVIEW");
  }

  if (signal.sourceReliability === "LOW") {
    blockedReasons.push("NO_UNVERIFIED_SIGNAL_IN_STRONG_REASONING");
  }

  const canonicalValidation = validateCanonicalSourceRefs([
    toCanonicalSourceRef(signal),
  ]);
  if (!canonicalValidation.ok) {
    blockedReasons.push(canonicalValidation.code);
  }

  return blockedReasons;
}

function toCanonicalSourceRef(signal: RealTimeLegalSignal): CanonicalSourceRefInput {
  return {
    sourceKind: signal.sourceTrace.sourceKind,
    citationKey: signal.sourceTrace.canonicalSourceRef,
    summaryPointer: signal.sourceTrace.summaryPointer,
    verifiedAt: signal.sourceTrace.verifiedAt,
  };
}

export function isRealTimeLegalSignalStale(signal: RealTimeLegalSignal, now = new Date()): boolean {
  return new Date(signal.staleAfter).getTime() <= now.getTime();
}

export function canUseAsStrongReasoningGround(
  signal: RealTimeLegalSignal,
  now = new Date(),
): RealTimeLegalSignalCompilerDecision {
  const blockedReasons = baseSignalChecks(signal);

  if (signal.status !== REAL_TIME_LEGAL_SIGNAL_STRONG_REASONING_STATUS) {
    blockedReasons.push("NO_REAL_TIME_SIGNAL_AS_AUTHORITY_WITHOUT_APPROVAL");
    blockedReasons.push("REAL_TIME_SIGNAL_NOT_AUTHORITY");
  }

  if (signal.caseRelevanceScore < REAL_TIME_LEGAL_SIGNAL_MIN_CASE_RELEVANCE_SCORE) {
    blockedReasons.push("CASE_RELEVANCE_BELOW_THRESHOLD");
  }

  if (signal.lawyerReviewRequired && !signal.lawyerReviewed) {
    blockedReasons.push("NO_CONFLICTED_SIGNAL_WITHOUT_LAWYER_REVIEW");
  }

  if (signal.compilerPolicyApplied !== true) {
    blockedReasons.push("COMPILER_POLICY_REQUIRED_FOR_SIGNAL_USE");
  }

  if (isRealTimeLegalSignalStale(signal, now)) {
    blockedReasons.push("NO_STALE_SIGNAL_IN_AI_CONTEXT");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: [
      "REAL_TIME_SIGNAL_NOT_AUTHORITY",
      "NO_REAL_TIME_SIGNAL_AS_AUTHORITY_WITHOUT_APPROVAL",
      "COMPILER_POLICY_REQUIRED_FOR_SIGNAL_USE",
    ],
  };
}

export function canInjectIntoPromptContext(
  signal: RealTimeLegalSignal,
  input: { compilerPolicyApplied: boolean },
  now = new Date(),
): RealTimeLegalSignalCompilerDecision {
  const blockedReasons = baseSignalChecks(signal);

  if (input.compilerPolicyApplied !== true || signal.compilerPolicyApplied !== true) {
    blockedReasons.push("COMPILER_POLICY_REQUIRED_FOR_SIGNAL_USE");
  }

  if (["FETCHED", "NORMALIZED", "RELEVANCE_SCORED"].includes(signal.status)) {
    blockedReasons.push("REAL_TIME_SIGNAL_NOT_AUTHORITY");
  }

  if (isRealTimeLegalSignalStale(signal, now)) {
    blockedReasons.push("NO_STALE_SIGNAL_IN_AI_CONTEXT");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: ["COMPILER_POLICY_REQUIRED_FOR_SIGNAL_USE", "REAL_TIME_SIGNAL_NOT_AUTHORITY"],
  };
}

export function canUseInClientVisibleOutput(
  signal: RealTimeLegalSignal,
  now = new Date(),
): RealTimeLegalSignalCompilerDecision {
  const strong = canUseAsStrongReasoningGround(signal, now);
  const blockedReasons = [...strong.blockedReasons];

  if (!signal.lawyerReviewed) {
    blockedReasons.push("NO_CLIENT_VISIBLE_REAL_TIME_STRATEGY_WITHOUT_REVIEW");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: ["NO_CLIENT_VISIBLE_REAL_TIME_STRATEGY_WITHOUT_REVIEW"],
  };
}

export function assertCanUseAsStrongReasoningGround(
  signal: RealTimeLegalSignal,
  now = new Date(),
) {
  const result = canUseAsStrongReasoningGround(signal, now);
  if (!result.allowed) {
    throw new ValidationError(
      result.blockedReasons[0] ?? "NO_REAL_TIME_SIGNAL_AS_AUTHORITY_WITHOUT_APPROVAL",
    );
  }
  return result;
}

export function assertCanInjectIntoPromptContext(
  signal: RealTimeLegalSignal,
  input: { compilerPolicyApplied: boolean },
  now = new Date(),
) {
  const result = canInjectIntoPromptContext(signal, input, now);
  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "COMPILER_POLICY_REQUIRED_FOR_SIGNAL_USE");
  }
  return result;
}

export function assertCanUseInClientVisibleOutput(signal: RealTimeLegalSignal, now = new Date()) {
  const result = canUseInClientVisibleOutput(signal, now);
  if (!result.allowed) {
    throw new ValidationError(
      result.blockedReasons[0] ?? "NO_CLIENT_VISIBLE_REAL_TIME_STRATEGY_WITHOUT_REVIEW",
    );
  }
  return result;
}
