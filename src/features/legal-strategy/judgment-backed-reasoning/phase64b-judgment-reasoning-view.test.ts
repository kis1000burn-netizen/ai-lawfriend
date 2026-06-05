import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import { gongbuhoMemoryPacketSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { realTimeLegalSignalSchema } from "@/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal.schema";
import { strategyCandidateSchema } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";
import { buildJudgmentReasoningSourceMapFromStrategyCandidate } from "./phase64a-judgment-reasoning-source-map.policy";
import type { JudgmentReasoningSourceMap } from "./phase64a-judgment-reasoning-source-map.schema";
import {
  assertJudgmentReasoningViewAllowed,
  buildJudgmentFavorabilityBadge,
  buildJudgmentReasoningCards,
  buildJudgmentReasoningView,
  buildUncertaintyPanel,
  computeAggregateFavorabilityBadge,
  evaluateJudgmentReasoningCard,
  evaluateJudgmentReasoningCardFromEntry,
  PHASE64B_BOUNDARY_MARKERS,
} from "./phase64b-judgment-reasoning-view.policy";
import {
  PHASE64B_JUDGMENT_REASONING_VIEW_EVIDENCE_TAG,
  PHASE64B_JUDGMENT_REASONING_VIEW_LOCK,
} from "./phase64b-judgment-reasoning-view.lock";
import { composeJudgmentReasoningView } from "./phase64b-judgment-reasoning-view.service";
import {
  judgmentFavorabilityBadgeSchema,
  judgmentReasoningViewSchema,
} from "./phase64b-judgment-reasoning-view.schema";

const baseTrace = {
  traceId: "trace-64b-base",
  sourceKind: "CASE_INTERVIEW" as const,
  sourceRef: "interview:64b",
  capturedAt: "2026-05-26T10:00:00.000Z",
};

function buildApprovedSignal() {
  return realTimeLegalSignalSchema.parse({
    signalId: "rts-64b-1",
    caseId: "case-64b-1",
    tenantId: "tenant-64b-1",
    title: "Approved precedent signal",
    summaryPointer: "summary://rts-64b-1",
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
      traceId: "rts-trace-64b-1",
      sourceKind: "PRECEDENT",
      canonicalSourceRef: "SCOURT:2024DA12345",
      summaryPointer: "summary://rts-64b-1",
      fetchedAt: "2026-05-26T09:00:00.000Z",
    },
    compilerPolicyApplied: true,
    caseScopeOnly: true,
    tenantIsolationRequired: true,
  });
}

function buildMemoryPacket() {
  return gongbuhoMemoryPacketSchema.parse({
    packetId: "gmp-64b-1",
    caseId: "case-64b-1",
    tenantId: "tenant-64b-1",
    status: "ACTIVE",
    confidenceLevel: "MEDIUM",
    reviewStatus: "LAWYER_CONFIRMED",
    confirmedFacts: [
      {
        factId: "fact-64b-1",
        label: "계약 체결",
        summary: "2024년 3월 계약서에 서명",
        reviewStatus: "LAWYER_CONFIRMED",
        linkedClaimIds: ["claim-1"],
        linkedEvidenceIds: ["evidence-1"],
        sourceTraceIds: ["trace-64b-base"],
      },
    ],
    disputedFacts: [],
    clientWeaknesses: [],
    opponentClaims: [],
    evidenceMap: [
      {
        linkId: "evidence-link-64b-1",
        evidenceRef: "evidence-1",
        claimRef: "claim-1",
        supportStrength: "MODERATE",
        reviewStatus: "LAWYER_CONFIRMED",
        sourceTraceIds: ["trace-64b-base"],
      },
    ],
    judgmentLinks: [
      {
        referenceId: "judgment-64b-1",
        judgmentRef: "2023다12345",
        relevanceSummary: "유사 계약 성립 판례",
        canonicalSourceRef: "SCOURT:2023DA12345",
        reviewStatus: "LAWYER_CONFIRMED",
        sourceTraceIds: ["trace-64b-base"],
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
    caseId: "case-64b-1",
    tenantId: "tenant-64b-1",
    purpose: "STRONG_REASONING",
    memoryPacket: buildMemoryPacket(),
    realTimeSignals: [buildApprovedSignal()],
    auditRef: "audit-reasoning-64b-1",
  });
}

function buildStrategyCandidate(reasoningContextAuditRef: string) {
  return strategyCandidateSchema.parse({
    marker: "phase61a-strategy-candidate-schema",
    version: "61-A.1",
    candidateId: "sc-64b-1",
    caseId: "case-64b-1",
    tenantId: "tenant-64b-1",
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
        traceId: "sct-64b-1",
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
    auditRef: "audit-sc-64b-1",
    phase61VerifyScript: "verify:aibeopchin-legal-strategy-phase61a",
    controlTowerBrainVerifyScript: "verify:aibeopchin-control-tower-brain-rc",
    createdAt: "2026-05-26T12:00:00.000Z",
  });
}

function buildSourceMap(): JudgmentReasoningSourceMap {
  const reasoningContext = buildReasoningContext();
  const candidate = buildStrategyCandidate(reasoningContext.auditRef);
  return buildJudgmentReasoningSourceMapFromStrategyCandidate({
    mapId: "jrs-map-64b-1",
    strategyCandidate: candidate,
    reasoningContext,
    auditRef: "audit-jrs-64b-1",
  });
}

describe("Phase 64-B Judgment Reasoning View Builder", () => {
  it("exposes boundary markers and lock SSOT", () => {
    expect(PHASE64B_BOUNDARY_MARKERS).toContain("NO_VIEW_WITHOUT_SOURCE_MAP");
    expect(PHASE64B_BOUNDARY_MARKERS).toContain("UNCERTAINTY_PANEL_REQUIRED");
    expect(PHASE64B_JUDGMENT_REASONING_VIEW_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE64B_JUDGMENT_REASONING_VIEW_EVIDENCE_TAG).toContain("PHASE64B");
  });

  it("blocks reasoning view without source map", () => {
    expect(() => assertJudgmentReasoningViewAllowed(undefined)).toThrow(
      "NO_VIEW_WITHOUT_SOURCE_MAP",
    );
  });

  it("blocks judgment card without canonical source", () => {
    const result = evaluateJudgmentReasoningCard({
      cardId: "card-1",
      sourceEntryId: "entry-1",
      sourceKind: "GONGBUHO_JUDGMENT_LINK",
      title: "판례 2023다12345",
      summary: "판례 요약",
      relevanceNote: "근거",
      favorabilityBadge: "UNCERTAIN",
      authorityBadge: "GONGBUHO_CONFIRMED",
      sourceTraceRefs: [{ traceId: "trace-1", sourceKind: "GONGBUHO_JUDGMENT_LINK", sourceRef: "ref-1" }],
      hiddenSourceVisible: true,
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_VIEW_WITHOUT_CANONICAL_JUDGMENT_SOURCE");
  });

  it("blocks reasoning card without sourceTrace refs", () => {
    const result = evaluateJudgmentReasoningCard({
      cardId: "card-2",
      sourceEntryId: "entry-2",
      sourceKind: "GONGBUHO_CONFIRMED_FACT",
      title: "확정 사실",
      summary: "사실 요약",
      relevanceNote: "근거",
      favorabilityBadge: "UNCERTAIN",
      authorityBadge: "GONGBUHO_CONFIRMED",
      sourceTraceRefs: [],
      hiddenSourceVisible: true,
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_HIDDEN_REASONING_SOURCE");
  });

  it("allows only FAVORABLE / UNFAVORABLE / MIXED / UNCERTAIN favorability badges", () => {
    expect(judgmentFavorabilityBadgeSchema.options).toEqual([
      "FAVORABLE",
      "UNFAVORABLE",
      "MIXED",
      "UNCERTAIN",
    ]);
    expect(buildJudgmentFavorabilityBadge({ favorability: "FAVORABLE", sourceKind: "GONGBUHO_JUDGMENT_LINK" })).toBe(
      "FAVORABLE",
    );
    expect(buildJudgmentFavorabilityBadge({ favorability: "NEUTRAL", sourceKind: "GONGBUHO_CONFIRMED_FACT" })).toBe(
      "UNCERTAIN",
    );
    expect(
      computeAggregateFavorabilityBadge([
        {
          cardId: "c1",
          sourceEntryId: "e1",
          sourceKind: "GONGBUHO_JUDGMENT_LINK",
          title: "판례 A",
          summary: "s",
          relevanceNote: "r",
          favorabilityBadge: "FAVORABLE",
          authorityBadge: "GONGBUHO_CONFIRMED",
          sourceTraceRefs: [{ traceId: "t1", sourceKind: "GONGBUHO_JUDGMENT_LINK", sourceRef: "r1" }],
          hiddenSourceVisible: true,
        },
        {
          cardId: "c2",
          sourceEntryId: "e2",
          sourceKind: "GONGBUHO_JUDGMENT_LINK",
          title: "판례 B",
          summary: "s",
          relevanceNote: "r",
          favorabilityBadge: "UNFAVORABLE",
          authorityBadge: "GONGBUHO_CONFIRMED",
          sourceTraceRefs: [{ traceId: "t2", sourceKind: "GONGBUHO_JUDGMENT_LINK", sourceRef: "r2" }],
          hiddenSourceVisible: true,
        },
      ]),
    ).toBe("MIXED");
  });

  it("blocks outcome certainty language in cards", () => {
    const result = evaluateJudgmentReasoningCard({
      cardId: "card-3",
      sourceEntryId: "entry-3",
      sourceKind: "GONGBUHO_CONFIRMED_FACT",
      title: "확정 사실",
      summary: "이 사건은 승소 확실합니다",
      relevanceNote: "근거",
      favorabilityBadge: "UNCERTAIN",
      authorityBadge: "GONGBUHO_CONFIRMED",
      sourceTraceRefs: [{ traceId: "trace-3", sourceKind: "GONGBUHO_CONFIRMED_FACT", sourceRef: "ref-3" }],
      hiddenSourceVisible: true,
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_CERTAIN_OUTCOME_LANGUAGE");
  });

  it("blocks unapproved real-time signal rendered as authority", () => {
    const sourceMap = buildSourceMap();
    const result = evaluateJudgmentReasoningCardFromEntry({
      entry: {
        entryId: "entry-unapproved",
        sourceKind: "APPROVED_REAL_TIME_SIGNAL",
        sourceRef: "rts-unapproved",
        summary: "미승인 signal",
        relevanceNote: "근거",
        canonicalSourceRef: "SCOURT:2024DA99999",
        favorability: "UNCERTAIN",
        realTimeSignalStatus: "LAWYER_REVIEW_REQUIRED",
        linkedSourceTraceIds: ["sct-64b-1"],
      },
      sourceMap,
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_UNAPPROVED_SIGNAL_RENDERED_AS_AUTHORITY");
  });

  it("blocks uncertainty panel without signals", () => {
    expect(() => buildUncertaintyPanel({ panelId: "panel-empty", signals: [] })).toThrow(
      "UNCERTAINTY_PANEL_REQUIRED",
    );
  });

  it("builds lawyer-review-required reasoning view from source map", () => {
    const sourceMap = buildSourceMap();
    const view = composeJudgmentReasoningView({
      viewId: "jrv-64b-1",
      sourceMap,
      auditRef: "audit-jrv-64b-1",
    });

    expect(judgmentReasoningViewSchema.safeParse(view).success).toBe(true);
    expect(view.clientVisibleAllowed).toBe(false);
    expect(view.reviewStatus).toBe("LAWYER_REVIEW_REQUIRED");
    expect(view.lawyerReviewRequiredForUse).toBe(true);
    expect(view.reasoningCards.length).toBe(sourceMap.sourceEntries.length);
    expect(view.uncertaintyPanel.signals.length).toBeGreaterThan(0);
    expect(view.reasoningCards.every((card) => card.hiddenSourceVisible)).toBe(true);
    expect(view.reasoningCards.every((card) => card.sourceTraceRefs.length > 0)).toBe(true);
  });

  it("requires control tower verify marker in lock", () => {
    expect(PHASE64B_JUDGMENT_REASONING_VIEW_LOCK.controlTowerBrainVerify).toBe(
      "verify:aibeopchin-control-tower-brain-rc",
    );
    expect(PHASE64B_JUDGMENT_REASONING_VIEW_LOCK.prereqEvidenceTags).toContain(
      "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE64A-JUDGMENT-REASONING-SOURCE-MAP",
    );
  });

  it("builds cards covering every source map entry", () => {
    const sourceMap = buildSourceMap();
    const cards = buildJudgmentReasoningCards(sourceMap);
    expect(cards.length).toBe(sourceMap.sourceEntries.length);
    expect(buildJudgmentReasoningView({ viewId: "jrv-cards", sourceMap, auditRef: "audit-cards" }).reasoningCards).toEqual(
      cards,
    );
  });
});
