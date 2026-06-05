/**
 * Product Phase 63-B — Counter-Argument Candidate Builder policy SSOT.
 */
import { ValidationError } from "@/lib/errors";
import type { GongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import type { ReusableLegalPattern } from "@/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.schema";
import {
  evaluateReasoningContextForStrategy,
  evaluateReusablePatternsForStrategy,
} from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.policy";
import type { StrategyCandidate } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";
import type { OpponentArgument } from "./phase63a-opponent-argument.schema";
import type {
  BuildCounterArgumentCandidateInput,
  CounterArgumentCandidate,
  CounterArgumentCandidateReviewStatus,
  CounterArgumentSourceTrace,
} from "./phase63b-counter-argument-candidate.schema";
import {
  PHASE63B_COUNTER_ARGUMENT_CANDIDATE_SCHEMA_MARKER,
  PHASE63B_COUNTER_ARGUMENT_CANDIDATE_VERSION,
  counterArgumentCandidateBoundariesSchema,
  counterArgumentCandidateSchema,
} from "./phase63b-counter-argument-candidate.schema";

export const PHASE63B_COUNTER_ARGUMENT_CANDIDATE_POLICY_MARKER =
  "phase63b-counter-argument-candidate-policy" as const;

export const PHASE63B_ONE_LINE_STANDARD =
  "Phase 63-B는 63-A OpponentArgument와 59-C Gongbuho Reasoning Context, 61-A StrategyCandidate, 59-E Reusable Pattern을 기반으로 반박 후보를 생성하되, 최종 법률 주장이나 제출 문서가 아닌 LAWYER_REVIEW_REQUIRED CounterArgumentCandidate로만 제공한다." as const;

export const PHASE63B_BOUNDARY_MARKERS = [
  "NO_COUNTER_ARGUMENT_WITHOUT_OPPONENT_ARGUMENT",
  "NO_COUNTER_ARGUMENT_WITHOUT_GONGBUHO_CONTEXT",
  "NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE",
  "NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL",
  "NO_COUNTER_ARGUMENT_FROM_AI_CANDIDATE_MEMORY",
  "NO_FINAL_LEGAL_ARGUMENT_BY_AI",
  "NO_AUTO_FILED_COUNTER_ARGUMENT",
  "NO_CLIENT_VISIBLE_COUNTER_STRATEGY_BY_DEFAULT",
  "LAWYER_REVIEW_REQUIRED_FOR_COUNTER_ARGUMENT",
  "COUNTER_ARGUMENT_AUDIT_REQUIRED",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
] as const;

export type CounterArgumentCandidateBoundaryMarker =
  (typeof PHASE63B_BOUNDARY_MARKERS)[number];

export const PHASE63B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT =
  "verify:aibeopchin-control-tower-brain-rc" as const;

export const PHASE63B_COUNTER_ARGUMENT_CANDIDATE_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase63b" as const;

export const PHASE63B_PHASE63A_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase63a" as const;

const DEFAULT_BOUNDARIES = counterArgumentCandidateBoundariesSchema.parse({
  noCounterArgumentWithoutOpponentArgument: true,
  noCounterArgumentWithoutGongbuhoContext: true,
  noCounterArgumentWithoutSourceTrace: true,
  noCounterArgumentFromUnapprovedSignal: true,
  noCounterArgumentFromAiCandidateMemory: true,
  noFinalLegalArgumentByAi: true,
  noAutoFiledCounterArgument: true,
  noClientVisibleCounterStrategyByDefault: true,
  lawyerReviewRequiredForCounterArgument: true,
  counterArgumentAuditRequired: true,
  controlTowerBrainVerifyRequired: true,
});

export function evaluateCounterArgumentSourceTrace(
  trace: CounterArgumentSourceTrace,
): { allowed: boolean; blockedBy?: CounterArgumentCandidateBoundaryMarker } {
  if (!trace.traceId.trim() || !trace.sourceRef.trim()) {
    return { allowed: false, blockedBy: "NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE" };
  }
  if (!trace.reasoningContextAuditRef.trim()) {
    return { allowed: false, blockedBy: "NO_COUNTER_ARGUMENT_WITHOUT_GONGBUHO_CONTEXT" };
  }
  if (trace.memoryReviewStatus === "AI_CANDIDATE") {
    return { allowed: false, blockedBy: "NO_COUNTER_ARGUMENT_FROM_AI_CANDIDATE_MEMORY" };
  }
  if (trace.realTimeSignalStatus && trace.realTimeSignalStatus !== "APPROVED_FOR_AI_USE") {
    return { allowed: false, blockedBy: "NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL" };
  }
  return { allowed: true };
}

export function assertCounterArgumentSourceTraceAllowed(trace: CounterArgumentSourceTrace) {
  const result = evaluateCounterArgumentSourceTrace(trace);
  if (!result.allowed) {
    throw new ValidationError(result.blockedBy ?? "COUNTER_ARGUMENT_SOURCE_TRACE_BLOCKED");
  }
}

export function evaluateReasoningContextForCounterArgument(input: {
  reasoningContext: GongbuhoReasoningContextBundle;
  caseId: string;
  tenantId: string;
}) {
  const result = evaluateReasoningContextForStrategy(input);
  if (!result.allowed) {
    const blockedBy = result.blockedBy;
    if (blockedBy === "NO_STRATEGY_FROM_AI_CANDIDATE_MEMORY") {
      return {
        allowed: false as const,
        blockedBy: "NO_COUNTER_ARGUMENT_FROM_AI_CANDIDATE_MEMORY" as const,
      };
    }
    if (blockedBy === "NO_STRATEGY_FROM_UNAPPROVED_SIGNAL") {
      return {
        allowed: false as const,
        blockedBy: "NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL" as const,
      };
    }
    return {
      allowed: false as const,
      blockedBy: "NO_COUNTER_ARGUMENT_WITHOUT_GONGBUHO_CONTEXT" as const,
    };
  }
  return { allowed: true as const, blockedBy: null };
}

export function evaluateOpponentArgumentForCounterArgument(input: {
  opponentArgument?: OpponentArgument;
  caseId: string;
  tenantId: string;
}) {
  if (!input.opponentArgument) {
    return {
      allowed: false as const,
      blockedBy: "NO_COUNTER_ARGUMENT_WITHOUT_OPPONENT_ARGUMENT" as const,
    };
  }
  if (
    input.opponentArgument.caseId !== input.caseId ||
    input.opponentArgument.tenantId !== input.tenantId
  ) {
    return {
      allowed: false as const,
      blockedBy: "NO_COUNTER_ARGUMENT_WITHOUT_OPPONENT_ARGUMENT" as const,
    };
  }
  if (
    input.opponentArgument.reviewStatus === "REJECTED" ||
    input.opponentArgument.reviewStatus === "RETIRED"
  ) {
    return {
      allowed: false as const,
      blockedBy: "NO_COUNTER_ARGUMENT_WITHOUT_OPPONENT_ARGUMENT" as const,
    };
  }
  return { allowed: true as const, blockedBy: null };
}

export function evaluateStrategyCandidateForCounterArgument(input: {
  strategyCandidate?: StrategyCandidate;
  caseId: string;
  tenantId: string;
}) {
  if (!input.strategyCandidate) {
    return { allowed: true as const, blockedBy: null };
  }

  const candidate = input.strategyCandidate;
  if (candidate.caseId !== input.caseId || candidate.tenantId !== input.tenantId) {
    return {
      allowed: false as const,
      blockedBy: "NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE" as const,
    };
  }
  if (
    candidate.candidateKind !== "COUNTER_ARGUMENT" &&
    candidate.candidateKind !== "COMPOSITE"
  ) {
    return {
      allowed: false as const,
      blockedBy: "NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE" as const,
    };
  }
  if (candidate.isFinalLegalStrategy || candidate.clientVisibleByDefault) {
    return {
      allowed: false as const,
      blockedBy: "NO_FINAL_LEGAL_ARGUMENT_BY_AI" as const,
    };
  }
  return { allowed: true as const, blockedBy: null };
}

export function evaluateReusablePatternsForCounterArgument(patterns: ReusableLegalPattern[]) {
  const result = evaluateReusablePatternsForStrategy(patterns);
  if (!result.allowed) {
    if (result.blockedBy === "NO_STRATEGY_FROM_UNAPPROVED_SIGNAL") {
      return {
        allowed: false as const,
        blockedBy: "NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL" as const,
      };
    }
    return {
      allowed: false as const,
      blockedBy: "NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE" as const,
    };
  }
  return { allowed: true as const, blockedBy: null };
}

export function canFileCounterArgumentCandidate(input: {
  reviewStatus: CounterArgumentCandidateReviewStatus;
}) {
  if (input.reviewStatus === "LAWYER_APPROVED" || input.reviewStatus === "LAWYER_MODIFIED") {
    return { allowed: true as const, blockedBy: null };
  }
  return {
    allowed: false as const,
    blockedBy: "NO_AUTO_FILED_COUNTER_ARGUMENT" as const,
  };
}

export function buildCounterArgumentCandidate(
  input: BuildCounterArgumentCandidateInput,
): CounterArgumentCandidate {
  if (!input.auditRef.trim()) {
    throw new ValidationError("COUNTER_ARGUMENT_AUDIT_REQUIRED");
  }
  if (!input.sourceTrace.length) {
    throw new ValidationError("NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE");
  }

  const opponentGate = evaluateOpponentArgumentForCounterArgument({
    opponentArgument: input.opponentArgument,
    caseId: input.opponentArgument.caseId,
    tenantId: input.opponentArgument.tenantId,
  });
  if (!opponentGate.allowed) {
    throw new ValidationError(opponentGate.blockedBy ?? "NO_COUNTER_ARGUMENT_WITHOUT_OPPONENT_ARGUMENT");
  }

  const reasoningGate = evaluateReasoningContextForCounterArgument({
    reasoningContext: input.reasoningContext,
    caseId: input.opponentArgument.caseId,
    tenantId: input.opponentArgument.tenantId,
  });
  if (!reasoningGate.allowed) {
    throw new ValidationError(
      reasoningGate.blockedBy ?? "NO_COUNTER_ARGUMENT_WITHOUT_GONGBUHO_CONTEXT",
    );
  }

  if (
    input.reasoningContext.auditRef !== input.opponentArgument.reasoningContextAuditRef
  ) {
    throw new ValidationError("NO_COUNTER_ARGUMENT_WITHOUT_GONGBUHO_CONTEXT");
  }

  const strategyGate = evaluateStrategyCandidateForCounterArgument({
    strategyCandidate: input.strategyCandidate,
    caseId: input.opponentArgument.caseId,
    tenantId: input.opponentArgument.tenantId,
  });
  if (!strategyGate.allowed) {
    throw new ValidationError(strategyGate.blockedBy ?? "NO_FINAL_LEGAL_ARGUMENT_BY_AI");
  }

  const patternGate = evaluateReusablePatternsForCounterArgument(input.reusablePatterns);
  if (!patternGate.allowed) {
    throw new ValidationError(patternGate.blockedBy ?? "NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL");
  }

  for (const trace of input.sourceTrace) {
    assertCounterArgumentSourceTraceAllowed(trace);
    if (trace.reasoningContextAuditRef !== input.reasoningContext.auditRef) {
      throw new ValidationError("NO_COUNTER_ARGUMENT_WITHOUT_GONGBUHO_CONTEXT");
    }
    if (
      trace.opponentArgumentId &&
      trace.opponentArgumentId !== input.opponentArgument.opponentArgumentId
    ) {
      throw new ValidationError("NO_COUNTER_ARGUMENT_WITHOUT_OPPONENT_ARGUMENT");
    }
  }

  const candidate: CounterArgumentCandidate = {
    marker: PHASE63B_COUNTER_ARGUMENT_CANDIDATE_SCHEMA_MARKER,
    version: PHASE63B_COUNTER_ARGUMENT_CANDIDATE_VERSION,
    counterArgumentCandidateId: input.counterArgumentCandidateId,
    caseId: input.opponentArgument.caseId,
    tenantId: input.opponentArgument.tenantId,
    sourceOpponentArgumentId: input.opponentArgument.opponentArgumentId,
    opponentArgumentTitle: input.opponentArgument.title,
    decomposition: input.decomposition,
    reviewStatus: "LAWYER_REVIEW_REQUIRED",
    strategyCandidateId: input.strategyCandidate?.candidateId,
    reusablePatternIds: input.reusablePatterns.map((pattern) => pattern.patternId),
    reasoningContextAuditRef: input.reasoningContext.auditRef,
    reasoningContextBundleVersion: "59-C.1",
    sourceTrace: input.sourceTrace,
    boundaries: DEFAULT_BOUNDARIES,
    isFinalLegalArgument: false,
    autoFileAllowed: false,
    clientVisibleByDefault: false,
    lawyerReviewRequiredForCounterArgument: true,
    auditRef: input.auditRef,
    phase63AVerifyScript: PHASE63B_PHASE63A_VERIFY_SCRIPT,
    phase63BVerifyScript: PHASE63B_COUNTER_ARGUMENT_CANDIDATE_VERIFY_SCRIPT,
    controlTowerBrainVerifyScript: PHASE63B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
    createdAt: new Date().toISOString(),
  };

  return counterArgumentCandidateSchema.parse(candidate);
}
