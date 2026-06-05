import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import { gongbuhoMemoryPacketSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { buildOpponentArgumentFromMemoryClaim } from "./phase63a-opponent-argument.policy";
import { buildCounterArgumentCandidateFromOpponentArgument } from "./phase63b-counter-argument-candidate.service";
import type { CounterArgumentCandidate } from "./phase63b-counter-argument-candidate.schema";
import { buildBackfireRiskReport } from "./phase63c-risk-backfire-check.policy";
import type { BackfireRiskReport } from "./phase63c-risk-backfire-check.schema";
import { runBackfireRiskCheck } from "./phase63c-risk-backfire-check.service";
import {
  buildCounterArgumentDraftParagraph,
  evaluateBackfireRiskReportForDraftParagraphGeneration,
  evaluateDraftParagraphForClientVisibility,
  evaluateDraftParagraphForDocumentInsert,
  evaluateDraftParagraphGenerationGate,
  PHASE63D_BOUNDARY_MARKERS,
} from "./phase63d-draft-paragraph-generator.policy";
import {
  PHASE63D_DRAFT_PARAGRAPH_GENERATOR_EVIDENCE_TAG,
  PHASE63D_DRAFT_PARAGRAPH_GENERATOR_LOCK,
} from "./phase63d-draft-paragraph-generator.lock";
import {
  generateDraftParagraphsFromCandidate,
  summarizeDraftParagraph,
} from "./phase63d-draft-paragraph-generator.service";
import { counterArgumentDraftParagraphSchema } from "./phase63d-draft-paragraph-generator.schema";

const baseTrace = {
  traceId: "trace-base",
  sourceKind: "CASE_INTERVIEW" as const,
  sourceRef: "interview:1",
  capturedAt: "2026-05-26T10:00:00.000Z",
};

function buildMemoryPacket() {
  return gongbuhoMemoryPacketSchema.parse({
    packetId: "gmp-63d-1",
    caseId: "case-63d-1",
    tenantId: "tenant-63d-1",
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
    caseId: "case-63d-1",
    tenantId: "tenant-63d-1",
    purpose: "STRONG_REASONING",
    memoryPacket: buildMemoryPacket(),
    realTimeSignals: [],
    auditRef: "audit-reasoning-63d-1",
  });
}

function buildCounterCandidate(overrides?: {
  counterDirection?: string;
  weakLinkScore?: number;
}): CounterArgumentCandidate {
  const reasoningContext = buildReasoningContext();
  const memoryPacket = buildMemoryPacket();

  const opponentArgument = buildOpponentArgumentFromMemoryClaim({
    opponentArgumentId: "oa-63d-1",
    caseId: "case-63d-1",
    tenantId: "tenant-63d-1",
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
        traceId: "oat-63d-1",
        sourceKind: "OPPONENT_CLAIM_MEMORY",
        sourceRef: "opp-claim-1",
        reasoningContextAuditRef: reasoningContext.auditRef,
        opponentClaimId: "opp-claim-1",
        memoryReviewStatus: "LAWYER_CONFIRMED",
        capturedAt: "2026-05-26T12:00:00.000Z",
      },
    ],
    auditRef: "audit-oa-63d-1",
  });

  const candidate = buildCounterArgumentCandidateFromOpponentArgument({
    opponentArgument,
    reasoningContext,
    auditRef: "audit-cac-63d-1",
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
    },
  };
}

function buildSafeBackfireReport(): {
  candidate: CounterArgumentCandidate;
  reasoningContext: ReturnType<typeof buildReasoningContext>;
  report: BackfireRiskReport;
} {
  const reasoningContext = buildReasoningContext();
  const candidate = buildCounterCandidate({
    counterDirection: "확정 사실과 판례 근거를 중심으로 반박 방향을 검토",
    weakLinkScore: 0.4,
  });
  const report = runBackfireRiskCheck({
    reportId: "backfire-report-63d-safe",
    counterArgumentCandidate: candidate,
    reasoningContext,
    auditRef: "audit-backfire-63d-safe",
  });

  return { candidate, reasoningContext, report };
}

function buildDraftInput(overrides?: {
  candidate?: CounterArgumentCandidate;
  report?: BackfireRiskReport;
  reasoningContext?: ReturnType<typeof buildReasoningContext>;
  draftText?: string;
}) {
  const safe = buildSafeBackfireReport();
  const candidate = overrides?.candidate ?? safe.candidate;
  const reasoningContext = overrides?.reasoningContext ?? safe.reasoningContext;
  const report = overrides?.report ?? safe.report;
  const sourceTrace = candidate.sourceTrace.map((trace) => ({
    ...trace,
    backfireRiskReportId: report.reportId,
    draftParagraphPurpose: "FACTUAL_REBUTTAL" as const,
  }));

  return {
    paragraphId: "paragraph-63d-1",
    counterArgumentCandidate: candidate,
    backfireRiskReport: report,
    reasoningContext,
    paragraphPurpose: "FACTUAL_REBUTTAL" as const,
    draftText: overrides?.draftText ?? "[변호사 검토용 초안] 사실관계 반박 검토 문단",
    sourceTrace,
    auditRef: "audit-paragraph-63d-1",
  };
}

describe("Phase 63-D Draft Paragraph Generator", () => {
  it("exposes draft paragraph boundary markers", () => {
    expect(PHASE63D_BOUNDARY_MARKERS).toContain("NO_DRAFT_PARAGRAPH_WITHOUT_COUNTER_ARGUMENT");
    expect(PHASE63D_BOUNDARY_MARKERS).toContain("NO_DRAFT_PARAGRAPH_FROM_CRITICAL_RISK");
    expect(PHASE63D_BOUNDARY_MARKERS).toHaveLength(10);
  });

  it("locks draft paragraph generator SSOT", () => {
    expect(PHASE63D_DRAFT_PARAGRAPH_GENERATOR_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE63D_DRAFT_PARAGRAPH_GENERATOR_EVIDENCE_TAG).toContain("PHASE63D");
    expect(PHASE63D_DRAFT_PARAGRAPH_GENERATOR_LOCK.controlTowerBrainVerify).toBe(
      "verify:aibeopchin-control-tower-brain-rc",
    );
  });

  it("blocks paragraph generation without counter-argument candidate", () => {
    const reasoningContext = buildReasoningContext();
    const { report } = buildSafeBackfireReport();

    const gate = evaluateDraftParagraphGenerationGate({
      counterArgumentCandidate: undefined,
      backfireRiskReport: report,
      reasoningContext,
    });
    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("NO_DRAFT_PARAGRAPH_WITHOUT_COUNTER_ARGUMENT");
  });

  it("blocks paragraph generation without backfire risk report", () => {
    const reasoningContext = buildReasoningContext();
    const candidate = buildCounterCandidate();

    const gate = evaluateDraftParagraphGenerationGate({
      counterArgumentCandidate: candidate,
      backfireRiskReport: undefined,
      reasoningContext,
    });
    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("NO_DRAFT_PARAGRAPH_WITHOUT_BACKFIRE_CHECK");
  });

  it("blocks paragraph generation from CRITICAL backfire risk report", () => {
    const reasoningContext = buildReasoningContext();
    const candidate = buildCounterCandidate({
      counterDirection: "계약이 존재하지 않음을 중심으로 반박",
    });
    const report = runBackfireRiskCheck({
      reportId: "backfire-report-63d-critical",
      counterArgumentCandidate: candidate,
      reasoningContext,
      auditRef: "audit-backfire-63d-critical",
    });

    expect(report.riskLevel).toBe("CRITICAL");
    const gate = evaluateBackfireRiskReportForDraftParagraphGeneration(report);
    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("NO_DRAFT_PARAGRAPH_FROM_CRITICAL_RISK");
  });

  it("allows LOW/MEDIUM/HIGH risk when recommendation permits draft generation", () => {
    const { report: lowReport } = buildSafeBackfireReport();
    expect(evaluateBackfireRiskReportForDraftParagraphGeneration(lowReport).allowed).toBe(true);

    const reasoningContext = buildReasoningContext();
    const highCandidate = buildCounterCandidate({
      counterDirection: "명백히 단정할 수 있듯 상대방 주장은 성립하지 않는다",
    });
    const highReport = runBackfireRiskCheck({
      reportId: "backfire-report-63d-high",
      counterArgumentCandidate: highCandidate,
      reasoningContext,
      auditRef: "audit-backfire-63d-high",
    });
    expect(highReport.riskLevel).toBe("HIGH");
    expect(highReport.recommendation).toBe("REVIEW_WITH_CAUTION");
    expect(evaluateBackfireRiskReportForDraftParagraphGeneration(highReport).allowed).toBe(true);

    const requiresRevisionReport = buildBackfireRiskReport({
      reportId: "backfire-report-63d-revision",
      counterArgumentCandidate: highCandidate,
      reasoningContext,
      auditRef: "audit-backfire-63d-revision",
      riskSignals: [
        {
          signalId: "s1",
          riskType: "OVERSTATED_FACT",
          severity: "HIGH",
          summary: "a",
          sourceTrace: highCandidate.sourceTrace,
          mitigationSuggestion: "m1",
        },
        {
          signalId: "s2",
          riskType: "UNFAVORABLE_JUDGMENT_LINK",
          severity: "HIGH",
          summary: "b",
          sourceTrace: highCandidate.sourceTrace,
          mitigationSuggestion: "m2",
        },
      ],
    });
    expect(requiresRevisionReport.recommendation).toBe("REQUIRES_REVISION");
    expect(evaluateBackfireRiskReportForDraftParagraphGeneration(requiresRevisionReport).allowed).toBe(
      false,
    );
  });

  it("blocks paragraph build with empty draftText", () => {
    expect(() =>
      buildCounterArgumentDraftParagraph({
        ...buildDraftInput(),
        draftText: "   ",
      }),
    ).toThrow("NO_FINAL_DOCUMENT_TEXT_BY_AI");
  });

  it("blocks paragraph build without sourceTrace", () => {
    expect(() =>
      buildCounterArgumentDraftParagraph({
        ...buildDraftInput(),
        sourceTrace: [],
      }),
    ).toThrow("NO_PARAGRAPH_WITHOUT_SOURCE_TRACE");
  });

  it("blocks paragraph build without auditRef", () => {
    expect(() =>
      buildCounterArgumentDraftParagraph({
        ...buildDraftInput(),
        auditRef: "",
      }),
    ).toThrow("NO_PARAGRAPH_WITHOUT_AUDIT_REF");
  });

  it("creates draft paragraph with fixed false gates and LAWYER_REVIEW_REQUIRED", () => {
    const { candidate, reasoningContext, report } = buildSafeBackfireReport();
    const paragraphs = generateDraftParagraphsFromCandidate({
      counterArgumentCandidate: candidate,
      backfireRiskReport: report,
      reasoningContext,
      auditRef: "audit-paragraph-63d-batch",
    });

    expect(paragraphs.length).toBeGreaterThan(0);
    for (const paragraph of paragraphs) {
      const parsed = counterArgumentDraftParagraphSchema.parse(paragraph);
      expect(parsed.isFinalDocumentText).toBe(false);
      expect(parsed.documentInsertAllowed).toBe(false);
      expect(parsed.clientVisibleAllowed).toBe(false);
      expect(parsed.autoFileAllowed).toBe(false);
      expect(parsed.reviewStatus).toBe("LAWYER_REVIEW_REQUIRED");
      expect(parsed.draftText.length).toBeGreaterThan(0);
      expect(parsed.sourceTrace.length).toBeGreaterThan(0);
    }
  });

  it("blocks document insert and client visibility by default", () => {
    const paragraph = buildCounterArgumentDraftParagraph(buildDraftInput());
    expect(evaluateDraftParagraphForDocumentInsert(paragraph).allowed).toBe(false);
    expect(evaluateDraftParagraphForClientVisibility(paragraph).allowed).toBe(false);
  });

  it("summarizes draft paragraph", () => {
    const paragraph = buildCounterArgumentDraftParagraph(buildDraftInput());
    const summary = summarizeDraftParagraph(paragraph);
    expect(summary.reviewStatus).toBe("LAWYER_REVIEW_REQUIRED");
    expect(summary.autoFileAllowed).toBe(false);
  });
});
