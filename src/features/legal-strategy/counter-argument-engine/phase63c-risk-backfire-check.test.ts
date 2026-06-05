import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import { gongbuhoMemoryPacketSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { buildOpponentArgumentFromMemoryClaim } from "./phase63a-opponent-argument.policy";
import { buildCounterArgumentCandidateFromOpponentArgument } from "./phase63b-counter-argument-candidate.service";
import type { CounterArgumentCandidate } from "./phase63b-counter-argument-candidate.schema";
import {
  assertMinimumBackfireRecommendation,
  buildBackfireRiskReport,
  computeBackfireRiskRecommendation,
  evaluateBackfireRiskReportForClientVisibility,
  evaluateBackfireRiskReportForDocumentUse,
  evaluateCounterArgumentCandidateForBackfireCheck,
  PHASE63C_BOUNDARY_MARKERS,
} from "./phase63c-risk-backfire-check.policy";
import {
  PHASE63C_RISK_BACKFIRE_CHECK_EVIDENCE_TAG,
  PHASE63C_RISK_BACKFIRE_CHECK_LOCK,
} from "./phase63c-risk-backfire-check.lock";
import {
  detectBackfireRiskSignals,
  runBackfireRiskCheck,
  summarizeBackfireRiskReport,
} from "./phase63c-risk-backfire-check.service";
import { backfireRiskReportSchema } from "./phase63c-risk-backfire-check.schema";

const baseTrace = {
  traceId: "trace-base",
  sourceKind: "CASE_INTERVIEW" as const,
  sourceRef: "interview:1",
  capturedAt: "2026-05-26T10:00:00.000Z",
};

function buildMemoryPacket() {
  return gongbuhoMemoryPacketSchema.parse({
    packetId: "gmp-63c-1",
    caseId: "case-63c-1",
    tenantId: "tenant-63c-1",
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
    caseId: "case-63c-1",
    tenantId: "tenant-63c-1",
    purpose: "STRONG_REASONING",
    memoryPacket: buildMemoryPacket(),
    realTimeSignals: [],
    auditRef: "audit-reasoning-63c-1",
  });
}

function buildCounterCandidate(overrides?: {
  counterDirection?: string;
  weakLinkScore?: number;
  gongbuhoBasisSummary?: string;
}): CounterArgumentCandidate {
  const reasoningContext = buildReasoningContext();
  const memoryPacket = buildMemoryPacket();

  const opponentArgument = buildOpponentArgumentFromMemoryClaim({
    opponentArgumentId: "oa-63c-1",
    caseId: "case-63c-1",
    tenantId: "tenant-63c-1",
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
    submittedEvidence: [],
    reasoningContextAuditRef: reasoningContext.auditRef,
    reasoningContext,
    sourceTrace: [
      {
        traceId: "oat-63c-1",
        sourceKind: "OPPONENT_CLAIM_MEMORY",
        sourceRef: "opp-claim-1",
        reasoningContextAuditRef: reasoningContext.auditRef,
        opponentClaimId: "opp-claim-1",
        memoryReviewStatus: "LAWYER_CONFIRMED",
        capturedAt: "2026-05-26T12:00:00.000Z",
      },
    ],
    auditRef: "audit-oa-63c-1",
  });

  const candidate = buildCounterArgumentCandidateFromOpponentArgument({
    opponentArgument,
    reasoningContext,
    auditRef: "audit-cac-63c-1",
  });

  if (!overrides) {
    return candidate;
  }

  return {
    ...candidate,
    decomposition: {
      ...candidate.decomposition,
      counterDirection:
        overrides.counterDirection ?? candidate.decomposition.counterDirection,
      weakLinkScore: overrides.weakLinkScore ?? candidate.decomposition.weakLinkScore,
      additionalEvidenceNeeded:
        overrides.weakLinkScore !== undefined && overrides.weakLinkScore < 0.6
          ? []
          : candidate.decomposition.additionalEvidenceNeeded,
      gongbuhoBasisRefs: overrides.gongbuhoBasisSummary
        ? [
            {
              basisId: "basis-unfav-1",
              basisKind: "JUDGMENT_LINK",
              ref: "judgment-ref-unfav",
              summary: overrides.gongbuhoBasisSummary,
            },
          ]
        : candidate.decomposition.gongbuhoBasisRefs,
    },
  };
}

describe("Phase 63-C Risk & Backfire Check", () => {
  it("exposes backfire risk boundary markers", () => {
    expect(PHASE63C_BOUNDARY_MARKERS).toContain("NO_COUNTER_ARGUMENT_USE_WITHOUT_BACKFIRE_CHECK");
    expect(PHASE63C_BOUNDARY_MARKERS).toContain("NO_DOCUMENT_USE_WHEN_BACKFIRE_CRITICAL");
    expect(PHASE63C_BOUNDARY_MARKERS).toHaveLength(10);
  });

  it("locks backfire risk check SSOT", () => {
    expect(PHASE63C_RISK_BACKFIRE_CHECK_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE63C_RISK_BACKFIRE_CHECK_EVIDENCE_TAG).toContain("PHASE63C");
    expect(PHASE63C_RISK_BACKFIRE_CHECK_LOCK.controlTowerBrainVerify).toBe(
      "verify:aibeopchin-control-tower-brain-rc",
    );
  });

  it("blocks risk report without counter-argument candidate", () => {
    const reasoningContext = buildReasoningContext();
    const gate = evaluateCounterArgumentCandidateForBackfireCheck({
      counterArgumentCandidate: undefined,
      reasoningContext,
    });
    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("NO_COUNTER_ARGUMENT_USE_WITHOUT_BACKFIRE_CHECK");
  });

  it("blocks risk check when candidate has no sourceTrace", () => {
    const reasoningContext = buildReasoningContext();
    const candidate = { ...buildCounterCandidate(), sourceTrace: [] };

    const gate = evaluateCounterArgumentCandidateForBackfireCheck({
      counterArgumentCandidate: candidate,
      reasoningContext,
    });
    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("NO_COUNTER_ARGUMENT_WITH_INCONSISTENT_SOURCE");
  });

  it("creates LOW risk report for safe counter-argument candidate", () => {
    const reasoningContext = buildReasoningContext();
    const candidate = buildCounterCandidate({
      counterDirection: "확정 사실과 판례 근거를 중심으로 반박 방향을 검토",
      weakLinkScore: 0.4,
    });

    const report = runBackfireRiskCheck({
      reportId: "backfire-report-safe",
      counterArgumentCandidate: candidate,
      reasoningContext,
      auditRef: "audit-backfire-safe",
    });

    const parsed = backfireRiskReportSchema.parse(report);
    expect(parsed.riskLevel).toBe("LOW");
    expect(parsed.recommendation).toBe("SAFE_TO_REVIEW");
    expect(parsed.reviewStatus).toBe("LAWYER_REVIEW_REQUIRED");
    expect(parsed.clientVisibleAllowed).toBe(false);
    expect(parsed.autoFileAllowed).toBe(false);
  });

  it("detects OVERSTATED_FACT and sets HIGH risk recommendation at least REVIEW_WITH_CAUTION", () => {
    const reasoningContext = buildReasoningContext();
    const candidate = buildCounterCandidate({
      counterDirection: "명백히 단정할 수 있듯 상대방 주장은 성립하지 않는다",
    });

    const signals = detectBackfireRiskSignals({
      counterArgumentCandidate: candidate,
      reasoningContext,
    });
    expect(signals.some((signal) => signal.riskType === "OVERSTATED_FACT")).toBe(true);

    const report = runBackfireRiskCheck({
      reportId: "backfire-report-overstated",
      counterArgumentCandidate: candidate,
      reasoningContext,
      auditRef: "audit-backfire-overstated",
    });

    expect(report.riskLevel).toBe("HIGH");
    assertMinimumBackfireRecommendation({
      recommendation: report.recommendation,
      minimum: "REVIEW_WITH_CAUTION",
    });
  });

  it("detects INCONSISTENT_WITH_PRIOR_STATEMENT as CRITICAL and blocks document use", () => {
    const reasoningContext = buildReasoningContext();
    const candidate = buildCounterCandidate({
      counterDirection: "계약이 존재하지 않음을 중심으로 반박",
    });

    const report = runBackfireRiskCheck({
      reportId: "backfire-report-inconsistent",
      counterArgumentCandidate: candidate,
      reasoningContext,
      auditRef: "audit-backfire-inconsistent",
    });

    expect(report.riskLevel).toBe("CRITICAL");
    expect(report.recommendation).toBe("DO_NOT_USE");
    expect(report.riskSignals.some((s) => s.riskType === "INCONSISTENT_WITH_PRIOR_STATEMENT")).toBe(
      true,
    );

    const docGate = evaluateBackfireRiskReportForDocumentUse(report);
    expect(docGate.allowed).toBe(false);
    expect(docGate.blockedBy).toBe("NO_DOCUMENT_USE_WHEN_BACKFIRE_CRITICAL");
    expect(report.documentUseAllowed).toBe(false);
  });

  it("detects UNFAVORABLE_JUDGMENT_LINK", () => {
    const reasoningContext = buildReasoningContext();
    const candidate = buildCounterCandidate({
      gongbuhoBasisSummary: "원고에게 불리한 판례 해석 가능",
    });

    const report = runBackfireRiskCheck({
      reportId: "backfire-report-judgment",
      counterArgumentCandidate: candidate,
      reasoningContext,
      auditRef: "audit-backfire-judgment",
    });

    expect(report.riskSignals.some((s) => s.riskType === "UNFAVORABLE_JUDGMENT_LINK")).toBe(true);
  });

  it("blocks client-visible backfire risk by default", () => {
    const reasoningContext = buildReasoningContext();
    const candidate = buildCounterCandidate();
    const report = runBackfireRiskCheck({
      reportId: "backfire-report-client-blocked",
      counterArgumentCandidate: candidate,
      reasoningContext,
      auditRef: "audit-backfire-client",
    });

    const gate = evaluateBackfireRiskReportForClientVisibility(report);
    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("NO_CLIENT_VISIBLE_BACKFIRE_RISK");
  });

  it("blocks report build without auditRef", () => {
    const reasoningContext = buildReasoningContext();
    const candidate = buildCounterCandidate();

    expect(() =>
      buildBackfireRiskReport({
        reportId: "backfire-no-audit",
        counterArgumentCandidate: candidate,
        reasoningContext,
        riskSignals: [],
        auditRef: "",
      }),
    ).toThrow("BACKFIRE_RISK_REPORT_AUDIT_REQUIRED");
  });

  it("summarizes backfire risk report", () => {
    const reasoningContext = buildReasoningContext();
    const candidate = buildCounterCandidate();
    const report = runBackfireRiskCheck({
      reportId: "backfire-summary",
      counterArgumentCandidate: candidate,
      reasoningContext,
      auditRef: "audit-backfire-summary",
    });

    const summary = summarizeBackfireRiskReport(report);
    expect(summary.sourceCounterArgumentCandidateId).toBe(candidate.counterArgumentCandidateId);
    expect(summary.autoFileAllowed).toBe(false);
  });

  it("requires revision recommendation for multiple HIGH severity signals", () => {
    const recommendation = computeBackfireRiskRecommendation({
      riskLevel: "HIGH",
      riskSignals: [
        {
          signalId: "s1",
          riskType: "OVERSTATED_FACT",
          severity: "HIGH",
          summary: "a",
          sourceTrace: [
            {
              traceId: "t1",
              sourceKind: "GONGBUHO_REASONING_CONTEXT",
              sourceRef: "audit",
              reasoningContextAuditRef: "audit",
              capturedAt: "2026-05-26T12:00:00.000Z",
            },
          ],
          mitigationSuggestion: "m1",
        },
        {
          signalId: "s2",
          riskType: "UNFAVORABLE_JUDGMENT_LINK",
          severity: "HIGH",
          summary: "b",
          sourceTrace: [
            {
              traceId: "t2",
              sourceKind: "GONGBUHO_REASONING_CONTEXT",
              sourceRef: "audit",
              reasoningContextAuditRef: "audit",
              capturedAt: "2026-05-26T12:00:00.000Z",
            },
          ],
          mitigationSuggestion: "m2",
        },
      ],
    });

    expect(recommendation).toBe("REQUIRES_REVISION");
  });
});
