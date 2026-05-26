/**
 * Product Phase 62-B — Evidence Gap Detection Engine policy SSOT.
 */
import { ValidationError } from "@/lib/errors";
import type { GongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import type { StrategyCandidate } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";
import type { StrategyCandidateSourceTrace } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";
import type { EvidenceGapDetectionExcludedItems } from "./phase62b-evidence-gap-detection-engine.schema";

export const PHASE62B_EVIDENCE_GAP_DETECTION_POLICY_MARKER =
  "phase62b-evidence-gap-detection-policy" as const;

export const PHASE62B_ONE_LINE_STANDARD =
  "Phase 62-B는 59-C Gongbuho Reasoning Context의 confirmedFacts·evidenceMap·judgmentLinks와 61-A StrategyCandidate sourceTrace를 비교하여 증거공백 후보를 자동 탐지하되, 탐지 결과는 EvidenceGapCandidate DRAFT로만 생성하고 변호사 승인 전에는 client-visible·task·filing으로 연결하지 않는다." as const;

export const PHASE62B_BOUNDARY_MARKERS = [
  "NO_DETECTION_WITHOUT_REASONING_CONTEXT",
  "NO_DETECTION_WITHOUT_SOURCE_TRACE",
  "NO_CLIENT_VISIBLE_DETECTION_REPORT",
  "NO_AUTO_SUPPLEMENT_REQUEST_FROM_DETECTION",
  "NO_AUTO_TASK_CREATION_FROM_DETECTION",
  "NO_AUTO_FILING_FROM_DETECTION",
  "NO_GAP_FROM_UNAPPROVED_SIGNAL",
  "NO_GAP_FROM_AI_CANDIDATE_MEMORY",
  "NO_CROSS_TENANT_GAP_DETECTION",
  "DETECTION_REPORT_AUDIT_REQUIRED",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
] as const;

export type EvidenceGapDetectionBoundaryMarker = (typeof PHASE62B_BOUNDARY_MARKERS)[number];

export const PHASE62B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT =
  "verify:aibeopchin-control-tower-brain-rc" as const;

export const PHASE62B_EVIDENCE_GAP_DETECTION_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase62b" as const;

export function createEmptyDetectionExcludedItems(): EvidenceGapDetectionExcludedItems {
  return {
    missingSourceTraceCount: 0,
    unapprovedSignalSourceCount: 0,
    aiCandidateMemorySourceCount: 0,
    crossTenantSourceCount: 0,
  };
}

export function evaluateReasoningContextForEvidenceGapDetection(input: {
  reasoningContext: GongbuhoReasoningContextBundle;
  caseId: string;
  tenantId: string;
}) {
  if (!input.reasoningContext.auditRef.trim()) {
    return { allowed: false, blockedBy: "NO_DETECTION_WITHOUT_REASONING_CONTEXT" as const };
  }
  if (
    input.reasoningContext.caseId !== input.caseId ||
    input.reasoningContext.tenantId !== input.tenantId
  ) {
    return { allowed: false, blockedBy: "NO_CROSS_TENANT_GAP_DETECTION" as const };
  }
  if (input.reasoningContext.purpose !== "STRONG_REASONING") {
    return { allowed: false, blockedBy: "NO_DETECTION_WITHOUT_REASONING_CONTEXT" as const };
  }
  return { allowed: true as const, blockedBy: null };
}

export function assertEvidenceGapDetectionAllowed(input: {
  reasoningContext: GongbuhoReasoningContextBundle;
  caseId: string;
  tenantId: string;
  auditRef: string;
}) {
  if (!input.auditRef.trim()) {
    throw new ValidationError("DETECTION_REPORT_AUDIT_REQUIRED");
  }
  if (!input.reasoningContext.auditRef.trim()) {
    throw new ValidationError("NO_DETECTION_WITHOUT_REASONING_CONTEXT");
  }

  const gate = evaluateReasoningContextForEvidenceGapDetection({
    reasoningContext: input.reasoningContext,
    caseId: input.caseId,
    tenantId: input.tenantId,
  });
  if (!gate.allowed) {
    throw new ValidationError(gate.blockedBy ?? "NO_DETECTION_WITHOUT_REASONING_CONTEXT");
  }
}

export function evaluateStrategyCandidateForDetection(input: {
  candidate: StrategyCandidate;
  targetCaseId: string;
  targetTenantId: string;
  excludedItems: EvidenceGapDetectionExcludedItems;
}): { allowed: boolean; claimRefs: string[] } {
  const { candidate, targetCaseId, targetTenantId, excludedItems } = input;

  if (candidate.tenantId !== targetTenantId || candidate.caseId !== targetCaseId) {
    excludedItems.crossTenantSourceCount += 1;
    return { allowed: false, claimRefs: [] };
  }

  const claimRefs = new Set<string>();

  for (const trace of candidate.sourceTrace) {
    const traceGate = evaluateStrategySourceTraceForDetection(trace, excludedItems);
    if (!traceGate.allowed) {
      continue;
    }
    if (trace.sourceRef.startsWith("claim-")) {
      claimRefs.add(trace.sourceRef);
    }
  }

  return { allowed: true, claimRefs: [...claimRefs] };
}

function evaluateStrategySourceTraceForDetection(
  trace: StrategyCandidateSourceTrace,
  excludedItems: EvidenceGapDetectionExcludedItems,
): { allowed: boolean } {
  if (!trace.traceId.trim() || !trace.sourceRef.trim()) {
    excludedItems.missingSourceTraceCount += 1;
    return { allowed: false };
  }
  if (trace.memoryReviewStatus === "AI_CANDIDATE") {
    excludedItems.aiCandidateMemorySourceCount += 1;
    return { allowed: false };
  }
  if (
    trace.realTimeSignalStatus &&
    trace.realTimeSignalStatus !== "APPROVED_FOR_AI_USE"
  ) {
    excludedItems.unapprovedSignalSourceCount += 1;
    return { allowed: false };
  }
  return { allowed: true };
}

export function hasStrongOrModerateEvidenceForClaim(input: {
  claimRef: string;
  evidenceMap: GongbuhoReasoningContextBundle["memoryGrounds"]["evidenceMap"];
}): boolean {
  return input.evidenceMap.some(
    (link) =>
      link.claimRef === input.claimRef &&
      (link.supportStrength === "STRONG" || link.supportStrength === "MODERATE") &&
      link.sourceTraceIds.length > 0,
  );
}
