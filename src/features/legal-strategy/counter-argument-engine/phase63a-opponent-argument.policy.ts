/**
 * Product Phase 63-A — Opponent Argument policy SSOT.
 */
import { ValidationError } from "@/lib/errors";
import type { GongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import { evaluateReasoningContextForStrategy } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.policy";
import type {
  BuildOpponentArgumentFromMemoryClaimInput,
  BuildOpponentArgumentInput,
  OpponentArgument,
  OpponentArgumentReviewStatus,
  OpponentArgumentSourceTrace,
} from "./phase63a-opponent-argument.schema";
import {
  PHASE63A_OPPONENT_ARGUMENT_SCHEMA_MARKER,
  PHASE63A_OPPONENT_ARGUMENT_VERSION,
  opponentArgumentBoundariesSchema,
  opponentArgumentSchema,
} from "./phase63a-opponent-argument.schema";

export const PHASE63A_OPPONENT_ARGUMENT_POLICY_MARKER =
  "phase63a-opponent-argument-policy" as const;

export const PHASE63A_ONE_LINE_STANDARD =
  "Phase 63-A는 상대방 주장·항변·제출 증거·전제 사실·법리 포인트를 구조화하여 CounterArgumentCandidate 입력으로 사용할 수 있게 하되, 상대방 주장 자동 확정·반박 자동 제출·의뢰인 노출은 금지한다." as const;

export const PHASE63A_BOUNDARY_MARKERS = [
  "NO_AUTO_CONFIRMED_OPPONENT_ARGUMENT",
  "NO_AUTO_FILED_COUNTER_ARGUMENT",
  "NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE",
  "NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL",
  "NO_COUNTER_ARGUMENT_FROM_AI_CANDIDATE_MEMORY",
  "NO_CLIENT_VISIBLE_COUNTER_STRATEGY_BY_DEFAULT",
  "NO_FINAL_LEGAL_ARGUMENT_BY_AI",
  "LAWYER_REVIEW_REQUIRED_FOR_DOCUMENT_USE",
  "OPPONENT_ARGUMENT_AUDIT_REQUIRED",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
] as const;

export type OpponentArgumentBoundaryMarker = (typeof PHASE63A_BOUNDARY_MARKERS)[number];

export const PHASE63A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT =
  "verify:aibeopchin-control-tower-brain-rc" as const;

export const PHASE63A_OPPONENT_ARGUMENT_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase63a" as const;

export const PHASE63A_PHASE62_VERIFY_SCRIPT =
  "verify:aibeopchin-evidence-gap-auto-planner-rc" as const;

const DEFAULT_BOUNDARIES = opponentArgumentBoundariesSchema.parse({
  noAutoConfirmedOpponentArgument: true,
  noAutoFiledCounterArgument: true,
  noCounterArgumentWithoutSourceTrace: true,
  noCounterArgumentFromUnapprovedSignal: true,
  noCounterArgumentFromAiCandidateMemory: true,
  noClientVisibleCounterStrategyByDefault: true,
  noFinalLegalArgumentByAi: true,
  lawyerReviewRequiredForDocumentUse: true,
  backfireRiskCheckRequired: true,
  opponentArgumentAuditRequired: true,
  controlTowerBrainVerifyRequired: true,
});

export function evaluateOpponentArgumentSourceTrace(
  trace: OpponentArgumentSourceTrace,
): { allowed: boolean; blockedBy?: OpponentArgumentBoundaryMarker } {
  if (!trace.traceId.trim() || !trace.sourceRef.trim()) {
    return { allowed: false, blockedBy: "NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE" };
  }
  if (!trace.reasoningContextAuditRef.trim()) {
    return { allowed: false, blockedBy: "NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE" };
  }
  if (trace.memoryReviewStatus === "AI_CANDIDATE") {
    return { allowed: false, blockedBy: "NO_COUNTER_ARGUMENT_FROM_AI_CANDIDATE_MEMORY" };
  }
  if (trace.realTimeSignalStatus && trace.realTimeSignalStatus !== "APPROVED_FOR_AI_USE") {
    return { allowed: false, blockedBy: "NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL" };
  }
  return { allowed: true };
}

export function assertOpponentArgumentSourceTraceAllowed(trace: OpponentArgumentSourceTrace) {
  const result = evaluateOpponentArgumentSourceTrace(trace);
  if (!result.allowed) {
    throw new ValidationError(result.blockedBy ?? "OPPONENT_ARGUMENT_SOURCE_TRACE_BLOCKED");
  }
}

export function evaluateReasoningContextForOpponentArgument(input: {
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
    if (blockedBy === "NO_STRATEGY_WITHOUT_SOURCE_TRACE") {
      return {
        allowed: false as const,
        blockedBy: "NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE" as const,
      };
    }
    return {
      allowed: false as const,
      blockedBy: "NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE" as const,
    };
  }
  return { allowed: true as const, blockedBy: null };
}

export function canUseOpponentArgumentForCounterArgumentBuilder(input: {
  reviewStatus: OpponentArgumentReviewStatus;
  isOpponentArgumentConfirmed: boolean;
}) {
  if (input.isOpponentArgumentConfirmed) {
    return { allowed: false, blockedBy: "NO_AUTO_CONFIRMED_OPPONENT_ARGUMENT" as const };
  }
  if (input.reviewStatus === "REJECTED" || input.reviewStatus === "RETIRED") {
    return { allowed: false, blockedBy: "LAWYER_REVIEW_REQUIRED_FOR_DOCUMENT_USE" as const };
  }
  return { allowed: true as const, blockedBy: null };
}

export function canFileCounterArgument() {
  return {
    allowed: false as const,
    blockedBy: "NO_AUTO_FILED_COUNTER_ARGUMENT" as const,
  };
}

export function canExposeCounterStrategyToClient() {
  return {
    allowed: false as const,
    blockedBy: "NO_CLIENT_VISIBLE_COUNTER_STRATEGY_BY_DEFAULT" as const,
  };
}

function buildOpponentArgumentCore(
  input: BuildOpponentArgumentInput & { linkedOpponentClaimId?: string },
): OpponentArgument {
  if (!input.auditRef.trim()) {
    throw new ValidationError("OPPONENT_ARGUMENT_AUDIT_REQUIRED");
  }
  if (!input.sourceTrace.length) {
    throw new ValidationError("NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE");
  }
  if (!input.premiseFacts.length || !input.legalPoints.length) {
    throw new ValidationError("NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE");
  }

  const reasoningGate = evaluateReasoningContextForOpponentArgument({
    reasoningContext: input.reasoningContext,
    caseId: input.caseId,
    tenantId: input.tenantId,
  });
  if (!reasoningGate.allowed) {
    throw new ValidationError(reasoningGate.blockedBy ?? "NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE");
  }

  for (const trace of input.sourceTrace) {
    assertOpponentArgumentSourceTraceAllowed(trace);
    if (trace.reasoningContextAuditRef !== input.reasoningContextAuditRef) {
      throw new ValidationError("NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE");
    }
  }

  if (input.reviewStatus === "LAWYER_CONFIRMED") {
    throw new ValidationError("NO_AUTO_CONFIRMED_OPPONENT_ARGUMENT");
  }

  const candidate: OpponentArgument = {
    marker: PHASE63A_OPPONENT_ARGUMENT_SCHEMA_MARKER,
    version: PHASE63A_OPPONENT_ARGUMENT_VERSION,
    opponentArgumentId: input.opponentArgumentId,
    caseId: input.caseId,
    tenantId: input.tenantId,
    documentKind: input.documentKind,
    argumentKind: input.argumentKind,
    title: input.title,
    summary: input.summary,
    statementText: input.statementText,
    premiseFacts: input.premiseFacts,
    legalPoints: input.legalPoints,
    submittedEvidence: input.submittedEvidence,
    linkedOpponentClaimId: input.linkedOpponentClaimId,
    reviewStatus: input.reviewStatus,
    reasoningContextAuditRef: input.reasoningContextAuditRef,
    reasoningContextBundleVersion: "59-C.1",
    sourceTrace: input.sourceTrace,
    inheritedMemorySourceTrace: input.inheritedMemorySourceTrace,
    boundaries: DEFAULT_BOUNDARIES,
    isOpponentArgumentConfirmed: false,
    clientVisibleByDefault: false,
    isFinalLegalArgument: false,
    autoFileAllowed: false,
    lawyerReviewRequiredForDocumentUse: true,
    auditRef: input.auditRef,
    phase62VerifyScript: PHASE63A_PHASE62_VERIFY_SCRIPT,
    phase63VerifyScript: PHASE63A_OPPONENT_ARGUMENT_VERIFY_SCRIPT,
    controlTowerBrainVerifyScript: PHASE63A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
    createdAt: new Date().toISOString(),
  };

  return opponentArgumentSchema.parse(candidate);
}

export function buildOpponentArgument(input: BuildOpponentArgumentInput): OpponentArgument {
  return buildOpponentArgumentCore(input);
}

export function buildOpponentArgumentFromMemoryClaim(
  input: BuildOpponentArgumentFromMemoryClaimInput,
): OpponentArgument {
  if (input.opponentClaim.reviewStatus === "AI_CANDIDATE") {
    throw new ValidationError("NO_COUNTER_ARGUMENT_FROM_AI_CANDIDATE_MEMORY");
  }

  return buildOpponentArgumentCore({
    opponentArgumentId: input.opponentArgumentId,
    caseId: input.caseId,
    tenantId: input.tenantId,
    documentKind: input.documentKind,
    argumentKind: input.argumentKind ?? "FACTUAL_CLAIM",
    title: input.opponentClaim.title,
    summary: input.opponentClaim.summary,
    statementText: input.opponentClaim.summary,
    premiseFacts: input.premiseFacts,
    legalPoints: input.legalPoints,
    submittedEvidence: input.submittedEvidence,
    linkedOpponentClaimId: input.opponentClaim.claimId,
    reviewStatus: "LAWYER_REVIEW_REQUIRED",
    reasoningContextAuditRef: input.reasoningContextAuditRef,
    reasoningContext: input.reasoningContext,
    sourceTrace: input.sourceTrace,
    inheritedMemorySourceTrace: input.inheritedMemorySourceTrace,
    auditRef: input.auditRef,
  });
}
