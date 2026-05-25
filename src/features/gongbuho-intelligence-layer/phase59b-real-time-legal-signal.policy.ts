/**
 * Product Phase 59-B — Real-time Legal Signal policy SSOT.
 */
import { ValidationError } from "@/lib/errors";
import type {
  RealTimeLegalSignalForwardStatus,
  RealTimeLegalSignalLifecycleStatus,
} from "./phase59b-real-time-legal-signal.schema";

export const PHASE59B_REAL_TIME_LEGAL_SIGNAL_POLICY_MARKER =
  "phase59b-real-time-legal-signal-policy" as const;

export const PHASE59B_REAL_TIME_LEGAL_SIGNAL_ONE_LINE_CRITERION =
  "Real-time statute, precedent, and operations signals are not injected into Gongbuho reasoning as authority until they pass FETCHED through APPROVED_FOR_AI_USE with source trace, conflict check, freshness, and Compiler Policy gates." as const;

export const PHASE59B_BOUNDARY_MARKERS = [
  "REAL_TIME_SIGNAL_NOT_AUTHORITY",
  "NO_REAL_TIME_SIGNAL_AS_AUTHORITY_WITHOUT_APPROVAL",
  "NO_UNVERIFIED_SIGNAL_IN_STRONG_REASONING",
  "NO_STALE_SIGNAL_IN_AI_CONTEXT",
  "NO_CONFLICTED_SIGNAL_WITHOUT_LAWYER_REVIEW",
  "NO_CLIENT_VISIBLE_REAL_TIME_STRATEGY_WITHOUT_REVIEW",
  "SOURCE_TRACE_REQUIRED_FOR_EVERY_SIGNAL",
  "SIGNAL_STATUS_TRANSITION_REQUIRED",
  "COMPILER_POLICY_REQUIRED_FOR_SIGNAL_USE",
] as const;

const FORWARD_TRANSITIONS: Record<
  RealTimeLegalSignalForwardStatus,
  readonly RealTimeLegalSignalLifecycleStatus[]
> = {
  FETCHED: ["NORMALIZED", "REJECTED", "UNVERIFIED_SOURCE"],
  NORMALIZED: ["RELEVANCE_SCORED", "REJECTED", "UNVERIFIED_SOURCE"],
  RELEVANCE_SCORED: ["CONFLICT_CHECKED", "REJECTED", "STALE"],
  CONFLICT_CHECKED: ["LAWYER_REVIEW_REQUIRED", "APPROVED_FOR_AI_USE", "CONFLICTED", "REJECTED"],
  LAWYER_REVIEW_REQUIRED: ["APPROVED_FOR_AI_USE", "REJECTED", "CONFLICTED"],
  APPROVED_FOR_AI_USE: ["STALE", "REJECTED"],
};

const TERMINAL_BLOCKED_STATUSES = new Set<RealTimeLegalSignalLifecycleStatus>([
  "REJECTED",
  "STALE",
  "CONFLICTED",
  "UNVERIFIED_SOURCE",
]);

export function isRealTimeLegalSignalBlockedStatus(
  status: RealTimeLegalSignalLifecycleStatus,
): boolean {
  return TERMINAL_BLOCKED_STATUSES.has(status);
}

export function canTransitionRealTimeLegalSignalStatus(input: {
  fromStatus: RealTimeLegalSignalLifecycleStatus;
  toStatus: RealTimeLegalSignalLifecycleStatus;
}) {
  if (isRealTimeLegalSignalBlockedStatus(input.fromStatus)) {
    return {
      allowed: false,
      blockedReason: "SIGNAL_STATUS_TRANSITION_BLOCKED_FROM_TERMINAL",
    };
  }

  const allowedTargets = FORWARD_TRANSITIONS[input.fromStatus as RealTimeLegalSignalForwardStatus];
  if (!allowedTargets?.includes(input.toStatus)) {
    return {
      allowed: false,
      blockedReason: "SIGNAL_STATUS_TRANSITION_REQUIRED",
    };
  }

  return { allowed: true as const, blockedReason: null };
}

export function assertRealTimeLegalSignalTransitionAllowed(input: {
  fromStatus: RealTimeLegalSignalLifecycleStatus;
  toStatus: RealTimeLegalSignalLifecycleStatus;
}) {
  const result = canTransitionRealTimeLegalSignalStatus(input);
  if (!result.allowed) {
    throw new ValidationError(result.blockedReason ?? "SIGNAL_STATUS_TRANSITION_REQUIRED");
  }
  return result;
}

export function evaluateRealTimeLegalSignalScope(input: {
  caseId?: string;
  tenantId?: string;
  caseScopeOnly?: boolean;
  tenantIsolationRequired?: boolean;
}) {
  if (!input.caseId?.trim() || !input.tenantId?.trim()) {
    return { allowed: false, blockedReason: "CASE_AND_TENANT_SCOPE_REQUIRED" };
  }
  if (input.caseScopeOnly !== true || input.tenantIsolationRequired !== true) {
    return { allowed: false, blockedReason: "CASE_SCOPE_FIRST" };
  }
  return { allowed: true as const, blockedReason: null };
}

export function assertRealTimeLegalSignalScope(input: Parameters<
  typeof evaluateRealTimeLegalSignalScope
>[0]) {
  const result = evaluateRealTimeLegalSignalScope(input);
  if (!result.allowed) {
    throw new ValidationError(result.blockedReason ?? "TENANT_ISOLATION_REQUIRED");
  }
  return result;
}

export function evaluateRealTimeLegalSignalSourceTrace(input: {
  sourceTrace?: { traceId?: string; canonicalSourceRef?: string; summaryPointer?: string };
}) {
  const trace = input.sourceTrace;
  if (!trace?.traceId?.trim() || !trace.canonicalSourceRef?.trim() || !trace.summaryPointer?.trim()) {
    return { allowed: false, blockedReason: "SOURCE_TRACE_REQUIRED_FOR_EVERY_SIGNAL" };
  }
  return { allowed: true as const, blockedReason: null };
}

export function assertRealTimeLegalSignalSourceTrace(
  input: Parameters<typeof evaluateRealTimeLegalSignalSourceTrace>[0],
) {
  const result = evaluateRealTimeLegalSignalSourceTrace(input);
  if (!result.allowed) {
    throw new ValidationError("SOURCE_TRACE_REQUIRED_FOR_EVERY_SIGNAL");
  }
  return result;
}
