/**
 * Product Phase 62-A — Evidence Gap Candidate policy SSOT.
 */
import { ValidationError } from "@/lib/errors";
import type { GongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import { evaluateReasoningContextForStrategy } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.policy";
import type { StrategyCandidate } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";
import type {
  BuildEvidenceGapCandidateInput,
  EvidenceGapCandidate,
  EvidenceGapReviewStatus,
  EvidenceGapSourceTrace,
} from "./phase62a-evidence-gap-candidate.schema";
import {
  PHASE62A_EVIDENCE_GAP_CANDIDATE_SCHEMA_MARKER,
  PHASE62A_EVIDENCE_GAP_CANDIDATE_VERSION,
  evidenceGapBoundariesSchema,
  evidenceGapCandidateSchema,
} from "./phase62a-evidence-gap-candidate.schema";

export const PHASE62A_EVIDENCE_GAP_CANDIDATE_POLICY_MARKER =
  "phase62a-evidence-gap-candidate-policy" as const;

export const PHASE62A_ONE_LINE_STANDARD =
  "Phase 62는 59-C Reasoning Context와 61 Strategy Candidate를 기반으로, 사건에서 부족한 증거를 자동 탐지하고 변호사 검토용 보완자료 요청 후보를 생성한다." as const;

export const PHASE62A_BOUNDARY_MARKERS = [
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
  "NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE",
  "NO_AI_FINAL_EVIDENCE_JUDGMENT",
  "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
  "LAWYER_REVIEW_REQUIRED_FOR_REQUEST",
  "GONGBUHO_REASONING_CONTEXT_REQUIRED",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
  "EVIDENCE_GAP_CANDIDATE_AUDIT_REQUIRED",
] as const;

export type EvidenceGapBoundaryMarker = (typeof PHASE62A_BOUNDARY_MARKERS)[number];

export const PHASE62A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT =
  "verify:aibeopchin-control-tower-brain-rc" as const;

export const PHASE62A_EVIDENCE_GAP_CANDIDATE_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase62a" as const;

export const PHASE62A_PHASE61_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase61a" as const;

const DEFAULT_BOUNDARIES = evidenceGapBoundariesSchema.parse({
  noClientRequestWithoutLawyerApproval: true,
  noEvidenceGapWithoutSourceTrace: true,
  noAiFinalEvidenceJudgment: true,
  noRawClientFactGlobalLearning: true,
  lawyerReviewRequiredForRequest: true,
  gongbuhoReasoningContextRequired: true,
  controlTowerBrainVerifyRequired: true,
  evidenceGapCandidateAuditRequired: true,
});

export function evaluateEvidenceGapSourceTrace(
  trace: EvidenceGapSourceTrace,
): { allowed: boolean; blockedBy?: EvidenceGapBoundaryMarker } {
  if (!trace.traceId.trim() || !trace.sourceRef.trim()) {
    return { allowed: false, blockedBy: "NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE" };
  }
  if (!trace.reasoningContextAuditRef.trim()) {
    return { allowed: false, blockedBy: "GONGBUHO_REASONING_CONTEXT_REQUIRED" };
  }
  return { allowed: true };
}

export function assertEvidenceGapSourceTraceAllowed(trace: EvidenceGapSourceTrace) {
  const result = evaluateEvidenceGapSourceTrace(trace);
  if (!result.allowed) {
    throw new ValidationError(result.blockedBy ?? "EVIDENCE_GAP_SOURCE_TRACE_BLOCKED");
  }
}

export function evaluateReasoningContextForEvidenceGap(input: {
  reasoningContext: GongbuhoReasoningContextBundle;
  caseId: string;
  tenantId: string;
}) {
  return evaluateReasoningContextForStrategy(input);
}

export function evaluateLinkedStrategyCandidate(input: {
  strategyCandidate?: StrategyCandidate;
  caseId: string;
  tenantId: string;
}) {
  if (!input.strategyCandidate) {
    return { allowed: true as const, blockedBy: null };
  }

  const candidate = input.strategyCandidate;
  if (candidate.caseId !== input.caseId || candidate.tenantId !== input.tenantId) {
    return { allowed: false, blockedBy: "NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE" as const };
  }
  if (candidate.candidateKind !== "EVIDENCE_GAP" && candidate.candidateKind !== "COMPOSITE") {
    return { allowed: false, blockedBy: "NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE" as const };
  }
  if (candidate.isFinalLegalStrategy || candidate.clientVisibleByDefault) {
    return { allowed: false, blockedBy: "NO_AI_FINAL_EVIDENCE_JUDGMENT" as const };
  }
  return { allowed: true as const, blockedBy: null };
}

export function canSendClientSupplementRequest(input: {
  reviewStatus: EvidenceGapReviewStatus;
}) {
  if (input.reviewStatus === "LAWYER_APPROVED" || input.reviewStatus === "LAWYER_MODIFIED") {
    return { allowed: true as const, blockedBy: null };
  }
  return { allowed: false, blockedBy: "LAWYER_REVIEW_REQUIRED_FOR_REQUEST" as const };
}

export function canCreateLitigationOpsSupplementDraft(input: {
  reviewStatus: EvidenceGapReviewStatus;
}) {
  if (input.reviewStatus === "LAWYER_APPROVED" || input.reviewStatus === "LAWYER_MODIFIED") {
    return { allowed: true as const, blockedBy: null };
  }
  return { allowed: false, blockedBy: "LAWYER_REVIEW_REQUIRED_FOR_REQUEST" as const };
}

export function buildEvidenceGapCandidate(input: BuildEvidenceGapCandidateInput): EvidenceGapCandidate {
  if (!input.auditRef.trim()) {
    throw new ValidationError("EVIDENCE_GAP_CANDIDATE_AUDIT_REQUIRED");
  }
  if (!input.sourceTrace.length) {
    throw new ValidationError("NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE");
  }
  if (!input.suggestedSupplementItems.length) {
    throw new ValidationError("NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE");
  }

  const reasoningGate = evaluateReasoningContextForEvidenceGap({
    reasoningContext: input.reasoningContext,
    caseId: input.caseId,
    tenantId: input.tenantId,
  });
  if (!reasoningGate.allowed) {
    const blockedBy = reasoningGate.blockedBy;
    if (blockedBy === "NO_STRATEGY_FROM_AI_CANDIDATE_MEMORY") {
      throw new ValidationError("NO_RAW_CLIENT_FACT_GLOBAL_LEARNING");
    }
    throw new ValidationError(blockedBy ?? "GONGBUHO_REASONING_CONTEXT_REQUIRED");
  }

  const strategyGate = evaluateLinkedStrategyCandidate({
    strategyCandidate: input.strategyCandidate,
    caseId: input.caseId,
    tenantId: input.tenantId,
  });
  if (!strategyGate.allowed) {
    throw new ValidationError(strategyGate.blockedBy ?? "NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE");
  }

  for (const trace of input.sourceTrace) {
    assertEvidenceGapSourceTraceAllowed(trace);
    if (trace.reasoningContextAuditRef !== input.reasoningContextAuditRef) {
      throw new ValidationError("GONGBUHO_REASONING_CONTEXT_REQUIRED");
    }
  }

  if (input.clientRequestDraft && !input.clientRequestDraft.lawyerApprovalRequired) {
    throw new ValidationError("NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL");
  }

  const candidate: EvidenceGapCandidate = {
    marker: PHASE62A_EVIDENCE_GAP_CANDIDATE_SCHEMA_MARKER,
    version: PHASE62A_EVIDENCE_GAP_CANDIDATE_VERSION,
    gapCandidateId: input.gapCandidateId,
    caseId: input.caseId,
    tenantId: input.tenantId,
    claimRef: input.claimRef,
    gapKind: input.gapKind,
    severity: input.severity,
    litigationImpactScore: input.litigationImpactScore,
    proofImportanceScore: input.proofImportanceScore,
    priorityRank: input.priorityRank,
    title: input.title,
    summary: input.summary,
    rationale: input.rationale,
    suggestedSupplementItems: input.suggestedSupplementItems,
    clientRequestDraft: input.clientRequestDraft,
    reviewStatus: input.reviewStatus,
    strategyCandidateId: input.strategyCandidate?.candidateId,
    reasoningContextAuditRef: input.reasoningContextAuditRef,
    reasoningContextBundleVersion: "59-C.1",
    sourceTrace: input.sourceTrace,
    inheritedMemorySourceTrace: input.inheritedMemorySourceTrace,
    litigationOpsLinkTarget: input.litigationOpsLinkTarget,
    boundaries: DEFAULT_BOUNDARIES,
    clientVisibleByDefault: false,
    isFinalEvidenceJudgment: false,
    lawyerReviewRequiredForRequest: true,
    auditRef: input.auditRef,
    phase61VerifyScript: PHASE62A_PHASE61_VERIFY_SCRIPT,
    phase62VerifyScript: PHASE62A_EVIDENCE_GAP_CANDIDATE_VERIFY_SCRIPT,
    controlTowerBrainVerifyScript: PHASE62A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
    createdAt: new Date().toISOString(),
  };

  return evidenceGapCandidateSchema.parse(candidate);
}
