/**
 * Product Phase 59-C — Gongbuho Reasoning Context policy SSOT.
 */
import { ValidationError } from "@/lib/errors";
import {
  gongbuhoMemoryPacketReviewStatusSchema,
  isGongbuhoMemoryStrongReviewStatus,
  type GongbuhoMemoryPacketReviewStatus,
} from "./phase59a-gongbuho-memory-packet.schema";
import type { RealTimeLegalSignal } from "./phase59b-real-time-legal-signal.schema";
import {
  canUseAsStrongReasoningGround,
  canUseInClientVisibleOutput,
} from "./phase59b-real-time-legal-signal-compiler";

export const PHASE59C_GONGBUHO_REASONING_CONTEXT_POLICY_MARKER =
  "phase59c-gongbuho-reasoning-context-policy" as const;

export const PHASE59C_GONGBUHO_REASONING_CONTEXT_ONE_LINE_CRITERION =
  "Phase 59-C assembles only LAWYER_CONFIRMED / LOCKED Gongbuho memory items and APPROVED_FOR_AI_USE real-time signals into a case-scoped GongbuhoReasoningContextBundle for controlled AI reasoning." as const;

export const PHASE59C_BOUNDARY_MARKERS = [
  "NO_AI_CANDIDATE_MEMORY_IN_STRONG_REASONING",
  "NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_CONTEXT",
  "NO_CROSS_TENANT_REASONING_CONTEXT",
  "NO_CROSS_CASE_MEMORY_MERGE_WITHOUT_POLICY",
  "NO_SOURCELESS_CONTEXT_ITEM",
  "NO_CLIENT_VISIBLE_REASONING_WITHOUT_LAWYER_REVIEW",
  "NO_STRATEGY_OUTPUT_WITHOUT_REASONING_LIMITS",
  "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
  "CONTEXT_BUNDLE_AUDIT_REQUIRED",
] as const;

export function evaluateReasoningScopeMatch(input: {
  targetCaseId: string;
  targetTenantId: string;
  itemCaseId?: string;
  itemTenantId?: string;
}) {
  if (!input.itemCaseId?.trim() || !input.itemTenantId?.trim()) {
    return { allowed: false, blockedReason: "NO_SOURCELESS_CONTEXT_ITEM" as const };
  }
  if (input.itemTenantId !== input.targetTenantId) {
    return { allowed: false, blockedReason: "NO_CROSS_TENANT_REASONING_CONTEXT" as const };
  }
  if (input.itemCaseId !== input.targetCaseId) {
    return {
      allowed: false,
      blockedReason: "NO_CROSS_CASE_MEMORY_MERGE_WITHOUT_POLICY" as const,
    };
  }
  return { allowed: true as const, blockedReason: null };
}

export function canIncludeMemoryItemInStrongReasoning(input: {
  reviewStatus: GongbuhoMemoryPacketReviewStatus;
  sourceTraceIds: string[];
}) {
  if (!input.sourceTraceIds.length) {
    return { allowed: false, blockedReason: "NO_SOURCELESS_CONTEXT_ITEM" as const };
  }
  if (input.reviewStatus === "AI_CANDIDATE") {
    return {
      allowed: false,
      blockedReason: "NO_AI_CANDIDATE_MEMORY_IN_STRONG_REASONING" as const,
    };
  }
  if (!isGongbuhoMemoryStrongReviewStatus(input.reviewStatus)) {
    return {
      allowed: false,
      blockedReason: "NO_AI_CANDIDATE_MEMORY_IN_STRONG_REASONING" as const,
    };
  }
  return { allowed: true as const, blockedReason: null };
}

export function canIncludeRealTimeSignalInContext(input: {
  signal: RealTimeLegalSignal;
  targetCaseId: string;
  targetTenantId: string;
  purpose: "STRONG_REASONING" | "CLIENT_VISIBLE";
  now?: Date;
}) {
  const scope = evaluateReasoningScopeMatch({
    targetCaseId: input.targetCaseId,
    targetTenantId: input.targetTenantId,
    itemCaseId: input.signal.caseId,
    itemTenantId: input.signal.tenantId,
  });
  if (!scope.allowed) {
    return scope;
  }

  const compilerDecision =
    input.purpose === "CLIENT_VISIBLE"
      ? canUseInClientVisibleOutput(input.signal, input.now)
      : canUseAsStrongReasoningGround(input.signal, input.now);

  if (!compilerDecision.allowed) {
    const blockedReason = compilerDecision.blockedReasons.includes(
      "NO_REAL_TIME_SIGNAL_AS_AUTHORITY_WITHOUT_APPROVAL",
    )
      ? "NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_CONTEXT"
      : compilerDecision.blockedReasons.includes("NO_CONFLICTED_SIGNAL_WITHOUT_LAWYER_REVIEW")
        ? "NO_CONFLICTED_SIGNAL_WITHOUT_LAWYER_REVIEW"
        : compilerDecision.blockedReasons.includes("NO_STALE_SIGNAL_IN_AI_CONTEXT")
          ? "NO_STALE_SIGNAL_IN_AI_CONTEXT"
          : compilerDecision.blockedReasons.includes(
                "NO_CLIENT_VISIBLE_REAL_TIME_STRATEGY_WITHOUT_REVIEW",
              )
            ? "NO_CLIENT_VISIBLE_REASONING_WITHOUT_LAWYER_REVIEW"
            : (compilerDecision.blockedReasons[0] ?? "NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_CONTEXT");

    return { allowed: false as const, blockedReason: blockedReason };
  }

  return { allowed: true as const, blockedReason: null };
}

export function assertGongbuhoReasoningContextBundleHasLimits(input: {
  strongReasoningOnlyFromConfirmedOrLocked: boolean;
  approvedSignalsOnly: boolean;
  noRawClientFactGlobalLearning: boolean;
  caseScopeOnly: boolean;
  tenantIsolationRequired: boolean;
  auditRef?: string;
}) {
  const blockedReasons: string[] = [];

  if (
    !input.strongReasoningOnlyFromConfirmedOrLocked ||
    !input.approvedSignalsOnly ||
    !input.noRawClientFactGlobalLearning ||
    !input.caseScopeOnly ||
    !input.tenantIsolationRequired
  ) {
    blockedReasons.push("NO_STRATEGY_OUTPUT_WITHOUT_REASONING_LIMITS");
  }

  if (!input.auditRef?.trim()) {
    blockedReasons.push("CONTEXT_BUNDLE_AUDIT_REQUIRED");
  }

  if (blockedReasons.length > 0) {
    throw new ValidationError(blockedReasons[0] ?? "NO_STRATEGY_OUTPUT_WITHOUT_REASONING_LIMITS");
  }

  return { allowed: true as const };
}

export const GONGBUHO_STRONG_MEMORY_REVIEW_STATUSES = gongbuhoMemoryPacketReviewStatusSchema.options.filter(
  (status) => status !== "AI_CANDIDATE",
);
