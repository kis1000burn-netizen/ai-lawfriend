import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import { gongbuhoMemoryPacketSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import {
  buildStrategyCandidate,
  evaluateStrategyCandidateSourceTrace,
  PHASE61A_BOUNDARY_MARKERS,
  canUseStrategyCandidateForOperationalAction,
} from "./phase61a-strategy-candidate.policy";
import {
  PHASE61A_STRATEGY_CANDIDATE_EVIDENCE_TAG,
  PHASE61A_STRATEGY_CANDIDATE_LOCK,
} from "./phase61a-strategy-candidate.lock";
import { strategyCandidateSchema } from "./phase61a-strategy-candidate.schema";

const baseTrace = {
  traceId: "trace-base",
  sourceKind: "CASE_INTERVIEW" as const,
  sourceRef: "interview:1",
  capturedAt: "2026-05-26T10:00:00.000Z",
};

function buildMemoryPacket() {
  return gongbuhoMemoryPacketSchema.parse({
    packetId: "gmp-1",
    caseId: "case-1",
    tenantId: "tenant-1",
    status: "ACTIVE",
    confidenceLevel: "MEDIUM",
    reviewStatus: "LAWYER_CONFIRMED",
    confirmedFacts: [
      {
        factId: "fact-confirmed",
        label: "확정 사실",
        summary: "변호사 확인 사실",
        reviewStatus: "LAWYER_CONFIRMED",
        linkedClaimIds: ["claim-1"],
        linkedEvidenceIds: [],
        sourceTraceIds: ["trace-base"],
      },
    ],
    disputedFacts: [],
    clientWeaknesses: [],
    opponentClaims: [],
    evidenceMap: [],
    judgmentLinks: [],
    lawyerConfirmedIssues: [],
    sourceTrace: [baseTrace],
    caseScopeOnly: true,
    tenantIsolationRequired: true,
    createdAt: "2026-05-26T10:00:00.000Z",
    updatedAt: "2026-05-26T11:00:00.000Z",
  });
}

function buildReasoningContext() {
  return buildGongbuhoReasoningContextBundle({
    caseId: "case-1",
    tenantId: "tenant-1",
    purpose: "STRONG_REASONING",
    memoryPacket: buildMemoryPacket(),
    realTimeSignals: [],
    auditRef: "audit-reasoning-1",
  });
}

describe("Phase 61-A Strategy Candidate Schema", () => {
  it("exposes all strategy boundary markers", () => {
    expect(PHASE61A_BOUNDARY_MARKERS).toContain("NO_AI_FINAL_LEGAL_STRATEGY");
    expect(PHASE61A_BOUNDARY_MARKERS).toContain("CONTROL_TOWER_BRAIN_VERIFY_REQUIRED");
    expect(PHASE61A_BOUNDARY_MARKERS).toHaveLength(10);
  });

  it("locks strategy candidate SSOT", () => {
    expect(PHASE61A_STRATEGY_CANDIDATE_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE61A_STRATEGY_CANDIDATE_EVIDENCE_TAG).toContain("PHASE61A");
    expect(PHASE61A_STRATEGY_CANDIDATE_LOCK.controlTowerBrainVerify).toBe(
      "verify:aibeopchin-control-tower-brain-rc",
    );
  });

  it("builds a lawyer-review strategy candidate from Gongbuho reasoning context", () => {
    const reasoningContext = buildReasoningContext();
    const candidate = buildStrategyCandidate({
      candidateId: "sc-1",
      caseId: "case-1",
      tenantId: "tenant-1",
      candidateKind: "WEAKNESS",
      title: "증거 취약점 후보",
      summary: "핵심 증거 연결 공백 가능성",
      rationale: "claim-1에 대한 locked evidence 부족",
      riskNotes: ["상대방이 사실 부인 가능"],
      suggestedInternalActions: ["추가 증거 확보 검토"],
      reasoningContextAuditRef: reasoningContext.auditRef,
      reasoningContext,
      reusablePatterns: [],
      sourceTrace: [
        {
          traceId: "st-1",
          sourceKind: "GONGBUHO_REASONING_CONTEXT",
          sourceRef: reasoningContext.auditRef,
          reasoningContextAuditRef: reasoningContext.auditRef,
          capturedAt: "2026-05-26T12:00:00.000Z",
        },
      ],
      auditRef: "audit-strategy-1",
    });

    expect(strategyCandidateSchema.parse(candidate).reviewStatus).toBe("LAWYER_REVIEW_REQUIRED");
    expect(candidate.isFinalLegalStrategy).toBe(false);
    expect(candidate.clientVisibleByDefault).toBe(false);
    expect(candidate.controlTowerBrainVerifyScript).toBe(
      "verify:aibeopchin-control-tower-brain-rc",
    );
  });

  it("blocks strategy candidate from AI candidate memory trace", () => {
    const result = evaluateStrategyCandidateSourceTrace({
      traceId: "st-bad",
      sourceKind: "LAWYER_CONFIRMED_MEMORY",
      sourceRef: "memory:fact-candidate",
      reasoningContextAuditRef: "audit-reasoning-1",
      memoryReviewStatus: "AI_CANDIDATE",
      capturedAt: "2026-05-26T12:00:00.000Z",
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_STRATEGY_FROM_AI_CANDIDATE_MEMORY");
  });

  it("blocks strategy candidate from unapproved real-time signal", () => {
    const result = evaluateStrategyCandidateSourceTrace({
      traceId: "st-signal",
      sourceKind: "APPROVED_REAL_TIME_SIGNAL",
      sourceRef: "signal:1",
      reasoningContextAuditRef: "audit-reasoning-1",
      realTimeSignalStatus: "RELEVANCE_SCORED",
      capturedAt: "2026-05-26T12:00:00.000Z",
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_STRATEGY_FROM_UNAPPROVED_SIGNAL");
  });

  it("never allows auto filing or client request even after lawyer approval", () => {
    const gate = canUseStrategyCandidateForOperationalAction({
      reviewStatus: "LAWYER_APPROVED",
    });
    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("NO_AUTO_FILING_OR_CLIENT_REQUEST");
  });
});
