/**
 * Product Phase 61-A — Strategy Candidate policy SSOT.
 */
import { ValidationError } from "@/lib/errors";
import type { GongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import type { ReusableLegalPattern } from "@/features/gongbuho-intelligence-layer/phase59e-reusable-legal-pattern.schema";
import type {
  BuildStrategyCandidateInput,
  StrategyCandidate,
  StrategyCandidateReviewStatus,
  StrategyCandidateSourceTrace,
} from "./phase61a-strategy-candidate.schema";
import {
  PHASE61A_STRATEGY_CANDIDATE_SCHEMA_MARKER,
  PHASE61A_STRATEGY_CANDIDATE_VERSION,
  strategyCandidateBoundariesSchema,
  strategyCandidateSchema,
} from "./phase61a-strategy-candidate.schema";

export const PHASE61A_STRATEGY_CANDIDATE_POLICY_MARKER =
  "phase61a-strategy-candidate-policy" as const;

export const PHASE61A_ONE_LINE_STANDARD =
  "Phase 61은 Phase 59 Gongbuho Intelligence Layer를 기반으로 변호사 전용 화면에서 약점·반박·증거공백·판례연결·전략 후보를 생성하되, 이를 최종 법률 판단이 아니라 LAWYER_REVIEW_REQUIRED Strategy Candidate로만 제공한다." as const;

export const PHASE61A_BOUNDARY_MARKERS = [
  "NO_AI_FINAL_LEGAL_STRATEGY",
  "NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT",
  "LAWYER_REVIEW_REQUIRED_FOR_STRATEGY_USE",
  "GONGBUHO_REASONING_CONTEXT_REQUIRED",
  "NO_STRATEGY_WITHOUT_SOURCE_TRACE",
  "NO_STRATEGY_FROM_UNAPPROVED_SIGNAL",
  "NO_STRATEGY_FROM_AI_CANDIDATE_MEMORY",
  "NO_AUTO_FILING_OR_CLIENT_REQUEST",
  "STRATEGY_CANDIDATE_AUDIT_REQUIRED",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
] as const;

export type StrategyCandidateBoundaryMarker = (typeof PHASE61A_BOUNDARY_MARKERS)[number];

export const PHASE61A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT =
  "verify:aibeopchin-control-tower-brain-rc" as const;

export const PHASE61A_STRATEGY_CANDIDATE_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase61a" as const;

const DEFAULT_BOUNDARIES = strategyCandidateBoundariesSchema.parse({
  noAiFinalLegalStrategy: true,
  noClientVisibleStrategyByDefault: true,
  lawyerReviewRequiredForStrategyUse: true,
  gongbuhoReasoningContextRequired: true,
  noStrategyWithoutSourceTrace: true,
  noStrategyFromUnapprovedSignal: true,
  noStrategyFromAiCandidateMemory: true,
  noAutoFilingOrClientRequest: true,
  strategyCandidateAuditRequired: true,
  controlTowerBrainVerifyRequired: true,
});

export function evaluateStrategyCandidateSourceTrace(
  trace: StrategyCandidateSourceTrace,
): { allowed: boolean; blockedBy?: StrategyCandidateBoundaryMarker } {
  if (!trace.traceId.trim() || !trace.sourceRef.trim()) {
    return { allowed: false, blockedBy: "NO_STRATEGY_WITHOUT_SOURCE_TRACE" };
  }
  if (!trace.reasoningContextAuditRef.trim()) {
    return { allowed: false, blockedBy: "GONGBUHO_REASONING_CONTEXT_REQUIRED" };
  }
  if (trace.memoryReviewStatus === "AI_CANDIDATE") {
    return { allowed: false, blockedBy: "NO_STRATEGY_FROM_AI_CANDIDATE_MEMORY" };
  }
  if (
    trace.realTimeSignalStatus &&
    trace.realTimeSignalStatus !== "APPROVED_FOR_AI_USE"
  ) {
    return { allowed: false, blockedBy: "NO_STRATEGY_FROM_UNAPPROVED_SIGNAL" };
  }
  return { allowed: true };
}

export function assertStrategyCandidateSourceTraceAllowed(trace: StrategyCandidateSourceTrace) {
  const result = evaluateStrategyCandidateSourceTrace(trace);
  if (!result.allowed) {
    throw new ValidationError(result.blockedBy ?? "STRATEGY_SOURCE_TRACE_BLOCKED");
  }
}

export function evaluateReasoningContextForStrategy(input: {
  reasoningContext: GongbuhoReasoningContextBundle;
  caseId: string;
  tenantId: string;
}) {
  if (!input.reasoningContext.auditRef.trim()) {
    return { allowed: false, blockedBy: "GONGBUHO_REASONING_CONTEXT_REQUIRED" as const };
  }
  if (input.reasoningContext.caseId !== input.caseId) {
    return { allowed: false, blockedBy: "NO_STRATEGY_WITHOUT_SOURCE_TRACE" as const };
  }
  if (input.reasoningContext.tenantId !== input.tenantId) {
    return { allowed: false, blockedBy: "NO_STRATEGY_WITHOUT_SOURCE_TRACE" as const };
  }
  if (input.reasoningContext.purpose !== "STRONG_REASONING") {
    return {
      allowed: false,
      blockedBy: "NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT" as const,
    };
  }
  if (input.reasoningContext.excludedItems.aiCandidateMemoryCount > 0) {
    return {
      allowed: false,
      blockedBy: "NO_STRATEGY_FROM_AI_CANDIDATE_MEMORY" as const,
    };
  }
  if (input.reasoningContext.excludedItems.unapprovedSignalCount > 0) {
    return {
      allowed: false,
      blockedBy: "NO_STRATEGY_FROM_UNAPPROVED_SIGNAL" as const,
    };
  }
  return { allowed: true as const, blockedBy: null };
}

export function evaluateReusablePatternsForStrategy(patterns: ReusableLegalPattern[]) {
  for (const pattern of patterns) {
    if (pattern.status !== "APPROVED_FOR_REUSE") {
      return { allowed: false, blockedBy: "NO_STRATEGY_FROM_UNAPPROVED_SIGNAL" as const };
    }
    if (!pattern.sourceTraceIds.length) {
      return { allowed: false, blockedBy: "NO_STRATEGY_WITHOUT_SOURCE_TRACE" as const };
    }
    if (pattern.clientDirectVisible) {
      return { allowed: false, blockedBy: "NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT" as const };
    }
  }
  return { allowed: true as const, blockedBy: null };
}

export function canUseStrategyCandidateForOperationalAction(input: {
  reviewStatus: StrategyCandidateReviewStatus;
}) {
  if (input.reviewStatus === "LAWYER_APPROVED" || input.reviewStatus === "LAWYER_MODIFIED") {
    return { allowed: false, blockedBy: "NO_AUTO_FILING_OR_CLIENT_REQUEST" as const };
  }
  return { allowed: false, blockedBy: "LAWYER_REVIEW_REQUIRED_FOR_STRATEGY_USE" as const };
}

export function buildStrategyCandidate(input: BuildStrategyCandidateInput): StrategyCandidate {
  if (!input.auditRef.trim()) {
    throw new ValidationError("STRATEGY_CANDIDATE_AUDIT_REQUIRED");
  }
  if (!input.sourceTrace.length) {
    throw new ValidationError("NO_STRATEGY_WITHOUT_SOURCE_TRACE");
  }

  const reasoningGate = evaluateReasoningContextForStrategy({
    reasoningContext: input.reasoningContext,
    caseId: input.caseId,
    tenantId: input.tenantId,
  });
  if (!reasoningGate.allowed) {
    throw new ValidationError(reasoningGate.blockedBy ?? "GONGBUHO_REASONING_CONTEXT_REQUIRED");
  }

  const patternGate = evaluateReusablePatternsForStrategy(input.reusablePatterns);
  if (!patternGate.allowed) {
    throw new ValidationError(patternGate.blockedBy ?? "NO_STRATEGY_FROM_UNAPPROVED_SIGNAL");
  }

  for (const trace of input.sourceTrace) {
    assertStrategyCandidateSourceTraceAllowed(trace);
    if (trace.reasoningContextAuditRef !== input.reasoningContextAuditRef) {
      throw new ValidationError("GONGBUHO_REASONING_CONTEXT_REQUIRED");
    }
  }

  const candidate: StrategyCandidate = {
    marker: PHASE61A_STRATEGY_CANDIDATE_SCHEMA_MARKER,
    version: PHASE61A_STRATEGY_CANDIDATE_VERSION,
    candidateId: input.candidateId,
    caseId: input.caseId,
    tenantId: input.tenantId,
    candidateKind: input.candidateKind,
    title: input.title,
    summary: input.summary,
    rationale: input.rationale,
    riskNotes: input.riskNotes,
    suggestedInternalActions: input.suggestedInternalActions,
    reviewStatus: input.reviewStatus,
    reasoningContextAuditRef: input.reasoningContextAuditRef,
    reasoningContextBundleVersion: "59-C.1",
    reusablePatternIds: input.reusablePatterns.map((pattern) => pattern.patternId),
    sourceTrace: input.sourceTrace,
    inheritedMemorySourceTrace: input.inheritedMemorySourceTrace,
    boundaries: DEFAULT_BOUNDARIES,
    clientVisibleByDefault: false,
    isFinalLegalStrategy: false,
    lawyerReviewRequiredForUse: true,
    auditRef: input.auditRef,
    phase61VerifyScript: PHASE61A_STRATEGY_CANDIDATE_VERIFY_SCRIPT,
    controlTowerBrainVerifyScript: PHASE61A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
    createdAt: new Date().toISOString(),
  };

  return strategyCandidateSchema.parse(candidate);
}

export function assertStrategyCandidateBoundaryMarkersPresent(markers: readonly string[]) {
  for (const boundary of PHASE61A_BOUNDARY_MARKERS) {
    if (!markers.includes(boundary)) {
      throw new ValidationError(`Missing strategy boundary marker: ${boundary}`);
    }
  }
}
