import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import { gongbuhoMemoryPacketSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { realTimeLegalSignalSchema } from "@/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal.schema";
import { strategyCandidateSchema } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";
import {
  buildJudgmentReasoningSourceMap,
  buildJudgmentReasoningSourceMapFromStrategyCandidate,
  canExposeJudgmentReasoningToClient,
  canRenderJudgmentReasoningView,
  detectOutcomePredictionAsCertainty,
  evaluateJudgmentReasoningSourceEntry,
  PHASE64A_BOUNDARY_MARKERS,
} from "./phase64a-judgment-reasoning-source-map.policy";
import {
  PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_EVIDENCE_TAG,
  PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_LOCK,
} from "./phase64a-judgment-reasoning-source-map.lock";
import { judgmentReasoningSourceMapSchema } from "./phase64a-judgment-reasoning-source-map.schema";

const baseTrace = {
  traceId: "trace-64a-base",
  sourceKind: "CASE_INTERVIEW" as const,
  sourceRef: "interview:64a",
  capturedAt: "2026-05-26T10:00:00.000Z",
};

function buildApprovedSignal() {
  return realTimeLegalSignalSchema.parse({
    signalId: "rts-64a-1",
    caseId: "case-64a-1",
    tenantId: "tenant-64a-1",
    title: "Approved precedent signal",
    summaryPointer: "summary://rts-64a-1",
    signalKind: "PRECEDENT",
    status: "APPROVED_FOR_AI_USE",
    sourceReliability: "HIGH",
    conflictStatus: "CLEAR",
    caseRelevanceScore: 0.82,
    lawyerReviewRequired: false,
    lawyerReviewed: true,
    staleAfter: "2026-06-26T10:00:00.000Z",
    fetchedAt: "2026-05-26T09:00:00.000Z",
    updatedAt: "2026-05-26T09:30:00.000Z",
    sourceTrace: {
      traceId: "rts-trace-64a-1",
      sourceKind: "PRECEDENT",
      canonicalSourceRef: "SCOURT:2024DA12345",
      summaryPointer: "summary://rts-64a-1",
      fetchedAt: "2026-05-26T09:00:00.000Z",
    },
    compilerPolicyApplied: true,
    caseScopeOnly: true,
    tenantIsolationRequired: true,
  });
}

function buildMemoryPacket() {
  return gongbuhoMemoryPacketSchema.parse({
    packetId: "gmp-64a-1",
    caseId: "case-64a-1",
    tenantId: "tenant-64a-1",
    status: "ACTIVE",
    confidenceLevel: "MEDIUM",
    reviewStatus: "LAWYER_CONFIRMED",
    confirmedFacts: [
      {
        factId: "fact-64a-1",
        label: "계약 체결",
        summary: "2024년 3월 계약서에 서명",
        reviewStatus: "LAWYER_CONFIRMED",
        linkedClaimIds: ["claim-1"],
        linkedEvidenceIds: ["evidence-1"],
        sourceTraceIds: ["trace-64a-base"],
      },
    ],
    disputedFacts: [],
    clientWeaknesses: [],
    opponentClaims: [],
    evidenceMap: [
      {
        linkId: "evidence-link-64a-1",
        evidenceRef: "evidence-1",
        claimRef: "claim-1",
        supportStrength: "MODERATE",
        reviewStatus: "LAWYER_CONFIRMED",
        sourceTraceIds: ["trace-64a-base"],
      },
    ],
    judgmentLinks: [
      {
        referenceId: "judgment-64a-1",
        judgmentRef: "2023다12345",
        relevanceSummary: "유사 계약 성립 판례",
        canonicalSourceRef: "SCOURT:2023DA12345",
        reviewStatus: "LAWYER_CONFIRMED",
        sourceTraceIds: ["trace-64a-base"],
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
    caseId: "case-64a-1",
    tenantId: "tenant-64a-1",
    purpose: "STRONG_REASONING",
    memoryPacket: buildMemoryPacket(),
    realTimeSignals: [buildApprovedSignal()],
    auditRef: "audit-reasoning-64a-1",
  });
}

function buildStrategyCandidate(reasoningContextAuditRef: string) {
  return strategyCandidateSchema.parse({
    marker: "phase61a-strategy-candidate-schema",
    version: "61-A.1",
    candidateId: "sc-64a-1",
    caseId: "case-64a-1",
    tenantId: "tenant-64a-1",
    candidateKind: "PRECEDENT_LINK",
    title: "판례 연결 전략",
    summary: "계약 성립 관련 판례를 연결",
    rationale: "공부호 확정 사실과 판례를 연결",
    riskNotes: ["상대방이 계약 불성립을 주장할 수 있음"],
    suggestedInternalActions: ["판례 대조표 작성"],
    reviewStatus: "LAWYER_REVIEW_REQUIRED",
    reasoningContextAuditRef,
    reasoningContextBundleVersion: "59-C.1",
    reusablePatternIds: [],
    sourceTrace: [
      {
        traceId: "sct-64a-1",
        sourceKind: "GONGBUHO_REASONING_CONTEXT",
        sourceRef: reasoningContextAuditRef,
        reasoningContextAuditRef,
        capturedAt: "2026-05-26T12:00:00.000Z",
      },
    ],
    inheritedMemorySourceTrace: [baseTrace],
    boundaries: {
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
    },
    clientVisibleByDefault: false,
    isFinalLegalStrategy: false,
    lawyerReviewRequiredForUse: true,
    auditRef: "audit-sc-64a-1",
    phase61VerifyScript: "verify:aibeopchin-legal-strategy-phase61a",
    controlTowerBrainVerifyScript: "verify:aibeopchin-control-tower-brain-rc",
    createdAt: "2026-05-26T12:00:00.000Z",
  });
}

describe("Phase 64-A Judgment Reasoning Source Map", () => {
  it("exposes boundary markers and lock SSOT", () => {
    expect(PHASE64A_BOUNDARY_MARKERS).toContain("NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE");
    expect(PHASE64A_BOUNDARY_MARKERS).toContain("UNCERTAINTY_SIGNAL_REQUIRED");
    expect(PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_EVIDENCE_TAG).toContain("PHASE64A");
  });

  it("blocks judgment entry without canonical source", () => {
    const result = evaluateJudgmentReasoningSourceEntry({
      entryId: "entry-1",
      sourceKind: "GONGBUHO_JUDGMENT_LINK",
      sourceRef: "2023다12345",
      summary: "판례",
      relevanceNote: "근거",
      favorability: "UNCERTAIN",
      linkedSourceTraceIds: ["trace-1"],
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_JUDGMENT_USE_WITHOUT_CANONICAL_SOURCE");
  });

  it("blocks unapproved real-time signal in reasoning view", () => {
    const result = evaluateJudgmentReasoningSourceEntry({
      entryId: "entry-2",
      sourceKind: "APPROVED_REAL_TIME_SIGNAL",
      sourceRef: "rts-1",
      summary: "signal",
      relevanceNote: "근거",
      canonicalSourceRef: "SCOURT:2024DA12345",
      favorability: "UNCERTAIN",
      realTimeSignalStatus: "LAWYER_REVIEW_REQUIRED",
      linkedSourceTraceIds: ["trace-1"],
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_REASONING_VIEW");
  });

  it("detects outcome prediction as certainty language", () => {
    expect(detectOutcomePredictionAsCertainty("이 사건은 승소 확실합니다").detected).toBe(true);
    expect(detectOutcomePredictionAsCertainty("검토가 필요합니다").detected).toBe(false);
  });

  it("blocks client exposure by default", () => {
    expect(
      canExposeJudgmentReasoningToClient({
        clientVisibleAllowed: false,
        lawyerReviewApproved: true,
      }).allowed,
    ).toBe(false);
  });

  it("blocks reasoning view without uncertainty signals", () => {
    expect(
      canRenderJudgmentReasoningView({
        artifactSourceTrace: [
          {
            traceId: "trace-1",
            sourceKind: "GONGBUHO_REASONING_CONTEXT",
            sourceRef: "ctx-1",
            reasoningContextAuditRef: "audit-1",
            capturedAt: "2026-05-26T12:00:00.000Z",
          },
        ],
        sourceEntries: [
          {
            entryId: "entry-1",
            sourceKind: "ARTIFACT_SOURCE_TRACE",
            sourceRef: "ctx-1",
            summary: "trace",
            relevanceNote: "trace",
            favorability: "NEUTRAL",
            linkedSourceTraceIds: ["trace-1"],
          },
        ],
        uncertaintySignals: [],
        auditRef: "audit-map-1",
      }).blockedBy,
    ).toBe("UNCERTAINTY_SIGNAL_REQUIRED");
  });

  it("builds source map from strategy candidate with judgment links and uncertainty", () => {
    const reasoningContext = buildReasoningContext();
    const candidate = buildStrategyCandidate(reasoningContext.auditRef);

    const map = buildJudgmentReasoningSourceMapFromStrategyCandidate({
      mapId: "jrs-map-64a-1",
      strategyCandidate: candidate,
      reasoningContext,
      auditRef: "audit-jrs-64a-1",
    });

    expect(judgmentReasoningSourceMapSchema.safeParse(map).success).toBe(true);
    expect(map.targetKind).toBe("STRATEGY_CANDIDATE");
    expect(map.clientVisibleAllowed).toBe(false);
    expect(map.uncertaintySignals.length).toBeGreaterThan(0);
    expect(map.sourceEntries.some((entry) => entry.sourceKind === "GONGBUHO_JUDGMENT_LINK")).toBe(
      true,
    );
    expect(
      map.sourceEntries.some((entry) => entry.sourceKind === "APPROVED_REAL_TIME_SIGNAL"),
    ).toBe(true);
  });

  it("throws when artifact source trace is missing", () => {
    const reasoningContext = buildReasoningContext();
    expect(() =>
      buildJudgmentReasoningSourceMap({
        mapId: "jrs-map-empty",
        caseId: "case-64a-1",
        tenantId: "tenant-64a-1",
        targetKind: "STRATEGY_CANDIDATE",
        targetRef: "sc-64a-1",
        reasoningContextAuditRef: reasoningContext.auditRef,
        reasoningContext,
        strategyCandidate: buildStrategyCandidate(reasoningContext.auditRef),
        artifactSourceTrace: [],
        auditRef: "audit-jrs-empty",
      }),
    ).toThrow("NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE");
  });

  it("requires control tower verify marker in lock", () => {
    expect(PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_LOCK.controlTowerBrainVerify).toBe(
      "verify:aibeopchin-control-tower-brain-rc",
    );
    expect(PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_LOCK.prereqEvidenceTags).toContain(
      "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63F-COUNTER-ARGUMENT-DRAFT-ENGINE-RC",
    );
  });
});
