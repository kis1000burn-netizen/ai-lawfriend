import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import { gongbuhoMemoryPacketSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { buildStrategyCandidate as buildCounterStrategyCandidateFromContext } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.policy";
import {
  buildOpponentArgument,
  buildOpponentArgumentFromMemoryClaim,
} from "./phase63a-opponent-argument.policy";
import {
  buildCounterArgumentCandidate,
  canFileCounterArgumentCandidate,
  evaluateCounterArgumentSourceTrace,
  evaluateOpponentArgumentForCounterArgument,
  evaluateReasoningContextForCounterArgument,
  PHASE63B_BOUNDARY_MARKERS,
} from "./phase63b-counter-argument-candidate.policy";
import {
  buildCounterArgumentCandidateFromOpponentArgument,
  buildCounterArgumentDecomposition,
  generateCounterArgumentCandidatesFromOpponentArguments,
  summarizeCounterArgumentCandidate,
} from "./phase63b-counter-argument-candidate.service";
import {
  PHASE63B_COUNTER_ARGUMENT_CANDIDATE_EVIDENCE_TAG,
  PHASE63B_COUNTER_ARGUMENT_CANDIDATE_LOCK,
} from "./phase63b-counter-argument-candidate.lock";
import { counterArgumentCandidateSchema } from "./phase63b-counter-argument-candidate.schema";

const baseTrace = {
  traceId: "trace-base",
  sourceKind: "CASE_INTERVIEW" as const,
  sourceRef: "interview:1",
  capturedAt: "2026-05-26T10:00:00.000Z",
};

function buildMemoryPacket() {
  return gongbuhoMemoryPacketSchema.parse({
    packetId: "gmp-63b-1",
    caseId: "case-63b-1",
    tenantId: "tenant-63b-1",
    status: "ACTIVE",
    confidenceLevel: "MEDIUM",
    reviewStatus: "LAWYER_CONFIRMED",
    confirmedFacts: [
      {
        factId: "fact-ours-1",
        label: "우리 측 확정 사실",
        summary: "2024년 3월 계약서 교부 및 이행 시작",
        reviewStatus: "LAWYER_CONFIRMED",
        linkedClaimIds: ["claim-ours-1"],
        linkedEvidenceIds: ["evidence-ours-1"],
        sourceTraceIds: ["trace-base"],
      },
    ],
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
    evidenceMap: [
      {
        linkId: "link-ours-1",
        evidenceRef: "evidence-ours-1",
        claimRef: "claim-ours-1",
        supportStrength: "STRONG",
        reviewStatus: "LAWYER_CONFIRMED",
        sourceTraceIds: ["trace-base"],
      },
    ],
    judgmentLinks: [
      {
        referenceId: "judgment-ref-1",
        judgmentRef: "2023다12345",
        relevanceSummary: "계약 성립 청약·승낙 합치 요건",
        reviewStatus: "LAWYER_CONFIRMED",
        sourceTraceIds: ["trace-base"],
      },
    ],
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
    caseId: "case-63b-1",
    tenantId: "tenant-63b-1",
    purpose: "STRONG_REASONING",
    memoryPacket: buildMemoryPacket(),
    realTimeSignals: [],
    auditRef: "audit-reasoning-63b-1",
  });
}

function buildOpponentArgumentBundle() {
  const reasoningContext = buildReasoningContext();
  const memoryPacket = buildMemoryPacket();

  return buildOpponentArgumentFromMemoryClaim({
    opponentArgumentId: "oa-63b-1",
    caseId: "case-63b-1",
    tenantId: "tenant-63b-1",
    documentKind: "ANSWER_BRIEF",
    opponentClaim: memoryPacket.opponentClaims[0]!,
    premiseFacts: [
      {
        premiseId: "premise-1",
        summary: "2024년 3월 구두 계약 체결 주장",
        factStatus: "DISPUTED",
        reviewStatus: "LAWYER_CONFIRMED",
        sourceTraceIds: ["trace-base"],
      },
    ],
    legalPoints: [
      {
        pointId: "legal-1",
        legalTheory: "계약 성립에는 청약·승낙의 합치가 필요",
        statuteRef: "민법 제535조",
        reviewStatus: "LAWYER_CONFIRMED",
        sourceTraceIds: ["trace-base"],
      },
    ],
    submittedEvidence: [
      {
        evidenceId: "opp-evidence-1",
        evidenceRef: "evidence-opp-1",
        title: "상대방 제출 이메일",
        summary: "계약 부인 이메일",
        supportRole: "CORROBORATING",
        reviewStatus: "LAWYER_CONFIRMED",
        sourceTraceIds: ["trace-base"],
      },
    ],
    reasoningContextAuditRef: reasoningContext.auditRef,
    reasoningContext,
    sourceTrace: [
      {
        traceId: "oat-63b-1",
        sourceKind: "OPPONENT_CLAIM_MEMORY",
        sourceRef: "opp-claim-1",
        reasoningContextAuditRef: reasoningContext.auditRef,
        opponentClaimId: "opp-claim-1",
        memoryReviewStatus: "LAWYER_CONFIRMED",
        capturedAt: "2026-05-26T12:00:00.000Z",
      },
    ],
    auditRef: "audit-oa-63b-1",
  });
}

function buildCounterStrategyCandidate(reasoningContext: ReturnType<typeof buildReasoningContext>) {
  return buildCounterStrategyCandidateFromContext({
    candidateId: "sc-counter-1",
    caseId: "case-63b-1",
    tenantId: "tenant-63b-1",
    candidateKind: "COUNTER_ARGUMENT",
    title: "계약 성립 반박 후보",
    summary: "상대방 계약 부인에 대한 반박 검토",
    rationale: "확정 사실과 판례 근거 활용",
    riskNotes: [],
    suggestedInternalActions: ["준비서면 반박 초안 검토"],
    reasoningContextAuditRef: reasoningContext.auditRef,
    reasoningContext,
    reusablePatterns: [],
    sourceTrace: [
      {
        traceId: "st-counter-1",
        sourceKind: "GONGBUHO_REASONING_CONTEXT",
        sourceRef: reasoningContext.auditRef,
        reasoningContextAuditRef: reasoningContext.auditRef,
        capturedAt: "2026-05-26T12:00:00.000Z",
      },
    ],
    auditRef: "audit-strategy-63b-1",
  });
}

describe("Phase 63-B Counter-Argument Candidate Builder", () => {
  it("exposes counter-argument candidate boundary markers", () => {
    expect(PHASE63B_BOUNDARY_MARKERS).toContain("NO_COUNTER_ARGUMENT_WITHOUT_OPPONENT_ARGUMENT");
    expect(PHASE63B_BOUNDARY_MARKERS).toContain("NO_COUNTER_ARGUMENT_WITHOUT_GONGBUHO_CONTEXT");
    expect(PHASE63B_BOUNDARY_MARKERS).toContain("LAWYER_REVIEW_REQUIRED_FOR_COUNTER_ARGUMENT");
    expect(PHASE63B_BOUNDARY_MARKERS).toHaveLength(11);
  });

  it("locks counter-argument candidate builder SSOT", () => {
    expect(PHASE63B_COUNTER_ARGUMENT_CANDIDATE_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE63B_COUNTER_ARGUMENT_CANDIDATE_EVIDENCE_TAG).toContain("PHASE63B");
    expect(PHASE63B_COUNTER_ARGUMENT_CANDIDATE_LOCK.controlTowerBrainVerify).toBe(
      "verify:aibeopchin-control-tower-brain-rc",
    );
  });

  it("builds LAWYER_REVIEW_REQUIRED counter-argument candidate from opponent argument", () => {
    const reasoningContext = buildReasoningContext();
    const opponentArgument = buildOpponentArgumentBundle();
    const strategyCandidate = buildCounterStrategyCandidate(reasoningContext);

    const candidate = buildCounterArgumentCandidateFromOpponentArgument({
      opponentArgument,
      reasoningContext,
      strategyCandidates: [strategyCandidate],
      auditRef: "audit-cac-63b-1",
    });

    const parsed = counterArgumentCandidateSchema.parse(candidate);
    expect(parsed.reviewStatus).toBe("LAWYER_REVIEW_REQUIRED");
    expect(parsed.isFinalLegalArgument).toBe(false);
    expect(parsed.autoFileAllowed).toBe(false);
    expect(parsed.clientVisibleByDefault).toBe(false);
    expect(parsed.decomposition.premiseFacts.length).toBeGreaterThan(0);
    expect(parsed.decomposition.gongbuhoBasisRefs.length).toBeGreaterThan(0);
    expect(parsed.decomposition.counterDirection).toContain("반박");
    expect(parsed.strategyCandidateId).toBe("sc-counter-1");
  });

  it("decomposes opponent argument into counter-argument structure", () => {
    const reasoningContext = buildReasoningContext();
    const opponentArgument = buildOpponentArgumentBundle();
    const decomposition = buildCounterArgumentDecomposition({
      opponentArgument,
      reasoningContext,
      reusablePatterns: [],
    });

    expect(decomposition.opponentClaimSummary).toContain("계약");
    expect(decomposition.weakLinkAnalysis.length).toBeGreaterThan(0);
    expect(decomposition.gongbuhoBasisRefs.length).toBeGreaterThan(0);
  });

  it("blocks counter-argument without opponent argument", () => {
    const gate = evaluateOpponentArgumentForCounterArgument({
      opponentArgument: undefined,
      caseId: "case-63b-1",
      tenantId: "tenant-63b-1",
    });
    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("NO_COUNTER_ARGUMENT_WITHOUT_OPPONENT_ARGUMENT");
  });

  it("blocks counter-argument without gongbuho reasoning context audit ref", () => {
    const reasoningContext = buildReasoningContext();
    const brokenContext = { ...reasoningContext, auditRef: "" };
    const gate = evaluateReasoningContextForCounterArgument({
      reasoningContext: brokenContext,
      caseId: "case-63b-1",
      tenantId: "tenant-63b-1",
    });
    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("NO_COUNTER_ARGUMENT_WITHOUT_GONGBUHO_CONTEXT");
  });

  it("blocks counter-argument without source trace ref", () => {
    const result = evaluateCounterArgumentSourceTrace({
      traceId: "",
      sourceKind: "OPPONENT_ARGUMENT",
      sourceRef: "oa-63b-1",
      reasoningContextAuditRef: "audit-reasoning-63b-1",
      capturedAt: "2026-05-26T12:00:00.000Z",
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE");
  });

  it("blocks unapproved realtime signal in source trace", () => {
    const result = evaluateCounterArgumentSourceTrace({
      traceId: "cat-unapproved",
      sourceKind: "GONGBUHO_REASONING_CONTEXT",
      sourceRef: "signal-1",
      reasoningContextAuditRef: "audit-reasoning-63b-1",
      realTimeSignalStatus: "FETCHED",
      capturedAt: "2026-05-26T12:00:00.000Z",
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL");
  });

  it("blocks AI_CANDIDATE memory in source trace", () => {
    const result = evaluateCounterArgumentSourceTrace({
      traceId: "cat-ai-candidate",
      sourceKind: "OPPONENT_ARGUMENT",
      sourceRef: "oa-63b-1",
      reasoningContextAuditRef: "audit-reasoning-63b-1",
      memoryReviewStatus: "AI_CANDIDATE",
      capturedAt: "2026-05-26T12:00:00.000Z",
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_COUNTER_ARGUMENT_FROM_AI_CANDIDATE_MEMORY");
  });

  it("blocks candidate build without auditRef", () => {
    const reasoningContext = buildReasoningContext();
    const opponentArgument = buildOpponentArgumentBundle();
    const decomposition = buildCounterArgumentDecomposition({
      opponentArgument,
      reasoningContext,
      reusablePatterns: [],
    });

    expect(() =>
      buildCounterArgumentCandidate({
        counterArgumentCandidateId: "cac-no-audit",
        opponentArgument,
        reasoningContext,
        decomposition,
        sourceTrace: [
          {
            traceId: "cat-1",
            sourceKind: "OPPONENT_ARGUMENT",
            sourceRef: opponentArgument.opponentArgumentId,
            reasoningContextAuditRef: reasoningContext.auditRef,
            opponentArgumentId: opponentArgument.opponentArgumentId,
            capturedAt: "2026-05-26T12:00:00.000Z",
          },
        ],
        auditRef: "",
      }),
    ).toThrow("COUNTER_ARGUMENT_AUDIT_REQUIRED");
  });

  it("blocks filing before lawyer approval", () => {
    const gate = canFileCounterArgumentCandidate({ reviewStatus: "LAWYER_REVIEW_REQUIRED" });
    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("NO_AUTO_FILED_COUNTER_ARGUMENT");
  });

  it("generates multiple candidates from opponent arguments", () => {
    const reasoningContext = buildReasoningContext();
    const opponentArgument = buildOpponentArgumentBundle();

    const candidates = generateCounterArgumentCandidatesFromOpponentArguments({
      opponentArguments: [opponentArgument],
      reasoningContext,
      auditRef: "audit-batch-63b-1",
    });

    expect(candidates).toHaveLength(1);
    expect(summarizeCounterArgumentCandidate(candidates[0]!).reviewStatus).toBe(
      "LAWYER_REVIEW_REQUIRED",
    );
  });
});
