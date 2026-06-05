import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import { gongbuhoMemoryPacketSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import {
  buildOpponentArgument,
  buildOpponentArgumentFromMemoryClaim,
  canExposeCounterStrategyToClient,
  canFileCounterArgument,
  canUseOpponentArgumentForCounterArgumentBuilder,
  evaluateOpponentArgumentSourceTrace,
  PHASE63A_BOUNDARY_MARKERS,
} from "./phase63a-opponent-argument.policy";
import {
  PHASE63A_OPPONENT_ARGUMENT_EVIDENCE_TAG,
  PHASE63A_OPPONENT_ARGUMENT_LOCK,
} from "./phase63a-opponent-argument.lock";
import { opponentArgumentSchema } from "./phase63a-opponent-argument.schema";

const baseTrace = {
  traceId: "trace-base",
  sourceKind: "CASE_INTERVIEW" as const,
  sourceRef: "interview:1",
  capturedAt: "2026-05-26T10:00:00.000Z",
};

function buildMemoryPacket() {
  return gongbuhoMemoryPacketSchema.parse({
    packetId: "gmp-63a-1",
    caseId: "case-63a-1",
    tenantId: "tenant-63a-1",
    status: "ACTIVE",
    confidenceLevel: "MEDIUM",
    reviewStatus: "LAWYER_CONFIRMED",
    confirmedFacts: [],
    disputedFacts: [],
    clientWeaknesses: [],
    opponentClaims: [
      {
        claimId: "opp-claim-1",
        title: "상대방 주장 — 계약 불성립",
        summary: "의뢰인과 계약 관계가 없다고 주장",
        expectedLegalTheory: "계약 성립 요건 미충족",
        reviewStatus: "LAWYER_CONFIRMED",
        linkedGraphNodeIds: ["node-opp-1"],
        sourceTraceIds: ["trace-base"],
      },
    ],
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
    caseId: "case-63a-1",
    tenantId: "tenant-63a-1",
    purpose: "STRONG_REASONING",
    memoryPacket: buildMemoryPacket(),
    realTimeSignals: [],
    auditRef: "audit-reasoning-63a-1",
  });
}

function buildSourceTrace(reasoningContextAuditRef: string) {
  return [
    {
      traceId: "oat-1",
      sourceKind: "OPPONENT_CLAIM_MEMORY" as const,
      sourceRef: "opp-claim-1",
      reasoningContextAuditRef,
      opponentClaimId: "opp-claim-1",
      memoryReviewStatus: "LAWYER_CONFIRMED" as const,
      capturedAt: "2026-05-26T12:00:00.000Z",
    },
  ];
}

function buildPremiseFacts() {
  return [
    {
      premiseId: "premise-1",
      summary: "2024년 3월 구두 계약 체결 주장",
      factStatus: "DISPUTED" as const,
      reviewStatus: "LAWYER_CONFIRMED" as const,
      sourceTraceIds: ["trace-base"],
    },
  ];
}

function buildLegalPoints() {
  return [
    {
      pointId: "legal-1",
      legalTheory: "계약 성립에는 청약·승낙의 합치가 필요",
      statuteRef: "민법 제535조",
      reviewStatus: "LAWYER_CONFIRMED" as const,
      sourceTraceIds: ["trace-base"],
    },
  ];
}

describe("Phase 63-A Opponent Argument Schema", () => {
  it("exposes opponent argument boundary markers", () => {
    expect(PHASE63A_BOUNDARY_MARKERS).toContain("NO_AUTO_CONFIRMED_OPPONENT_ARGUMENT");
    expect(PHASE63A_BOUNDARY_MARKERS).toContain("NO_AUTO_FILED_COUNTER_ARGUMENT");
    expect(PHASE63A_BOUNDARY_MARKERS).toContain("NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE");
    expect(PHASE63A_BOUNDARY_MARKERS).toHaveLength(10);
  });

  it("locks opponent argument SSOT", () => {
    expect(PHASE63A_OPPONENT_ARGUMENT_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE63A_OPPONENT_ARGUMENT_EVIDENCE_TAG).toContain("PHASE63A");
    expect(PHASE63A_OPPONENT_ARGUMENT_LOCK.controlTowerBrainVerify).toBe(
      "verify:aibeopchin-control-tower-brain-rc",
    );
  });

  it("builds structured opponent argument for counter-argument candidate input", () => {
    const reasoningContext = buildReasoningContext();

    const opponentArgument = buildOpponentArgument({
      opponentArgumentId: "oa-1",
      caseId: "case-63a-1",
      tenantId: "tenant-63a-1",
      documentKind: "ANSWER_BRIEF",
      argumentKind: "LEGAL_DEFENSE",
      title: "계약 불성립 항변",
      summary: "상대방은 계약 관계 부인",
      statementText: "원고와 피고 사이에 유효한 계약이 존재하지 않는다.",
      premiseFacts: buildPremiseFacts(),
      legalPoints: buildLegalPoints(),
      submittedEvidence: [],
      linkedOpponentClaimId: "opp-claim-1",
      reasoningContextAuditRef: reasoningContext.auditRef,
      reasoningContext,
      sourceTrace: buildSourceTrace(reasoningContext.auditRef),
      auditRef: "audit-oa-1",
    });

    const parsed = opponentArgumentSchema.parse(opponentArgument);
    expect(parsed.reviewStatus).toBe("LAWYER_REVIEW_REQUIRED");
    expect(parsed.isOpponentArgumentConfirmed).toBe(false);
    expect(parsed.clientVisibleByDefault).toBe(false);
    expect(parsed.isFinalLegalArgument).toBe(false);
    expect(parsed.autoFileAllowed).toBe(false);
    expect(parsed.premiseFacts).toHaveLength(1);
    expect(parsed.legalPoints).toHaveLength(1);
  });

  it("builds opponent argument from memory packet opponent claim", () => {
    const reasoningContext = buildReasoningContext();
    const memoryPacket = buildMemoryPacket();

    const opponentArgument = buildOpponentArgumentFromMemoryClaim({
      opponentArgumentId: "oa-memory-1",
      caseId: "case-63a-1",
      tenantId: "tenant-63a-1",
      documentKind: "ANSWER_BRIEF",
      opponentClaim: memoryPacket.opponentClaims[0]!,
      premiseFacts: buildPremiseFacts(),
      legalPoints: buildLegalPoints(),
      reasoningContextAuditRef: reasoningContext.auditRef,
      reasoningContext,
      sourceTrace: buildSourceTrace(reasoningContext.auditRef),
      auditRef: "audit-oa-memory-1",
    });

    expect(opponentArgument.linkedOpponentClaimId).toBe("opp-claim-1");
    expect(opponentArgument.reviewStatus).toBe("LAWYER_REVIEW_REQUIRED");
  });

  it("blocks opponent argument without source trace ref", () => {
    const result = evaluateOpponentArgumentSourceTrace({
      traceId: "",
      sourceKind: "OPPONENT_DOCUMENT",
      sourceRef: "answer-brief-1",
      reasoningContextAuditRef: "audit-reasoning-63a-1",
      capturedAt: "2026-05-26T12:00:00.000Z",
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE");
  });

  it("blocks unapproved realtime signal in source trace", () => {
    const result = evaluateOpponentArgumentSourceTrace({
      traceId: "oat-unapproved",
      sourceKind: "OPPONENT_DOCUMENT",
      sourceRef: "signal-1",
      reasoningContextAuditRef: "audit-reasoning-63a-1",
      realTimeSignalStatus: "FETCHED",
      capturedAt: "2026-05-26T12:00:00.000Z",
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL");
  });

  it("blocks auto-confirmed opponent argument review status", () => {
    const reasoningContext = buildReasoningContext();

    expect(() =>
      buildOpponentArgument({
        opponentArgumentId: "oa-confirmed-blocked",
        caseId: "case-63a-1",
        tenantId: "tenant-63a-1",
        documentKind: "ANSWER_BRIEF",
        argumentKind: "FACTUAL_CLAIM",
        title: "자동 확정 시도",
        summary: "자동 확정 금지",
        statementText: "자동 확정 금지",
        premiseFacts: buildPremiseFacts(),
        legalPoints: buildLegalPoints(),
        reviewStatus: "LAWYER_CONFIRMED",
        reasoningContextAuditRef: reasoningContext.auditRef,
        reasoningContext,
        sourceTrace: buildSourceTrace(reasoningContext.auditRef),
        auditRef: "audit-oa-confirmed-blocked",
      }),
    ).toThrow("NO_AUTO_CONFIRMED_OPPONENT_ARGUMENT");
  });

  it("blocks counter-argument filing by default", () => {
    const gate = canFileCounterArgument();
    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("NO_AUTO_FILED_COUNTER_ARGUMENT");
  });

  it("blocks client-visible counter strategy by default", () => {
    const gate = canExposeCounterStrategyToClient();
    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("NO_CLIENT_VISIBLE_COUNTER_STRATEGY_BY_DEFAULT");
  });

  it("allows counter-argument builder input when opponent argument is not auto-confirmed", () => {
    const gate = canUseOpponentArgumentForCounterArgumentBuilder({
      reviewStatus: "LAWYER_REVIEW_REQUIRED",
      isOpponentArgumentConfirmed: false,
    });
    expect(gate.allowed).toBe(true);
  });
});
