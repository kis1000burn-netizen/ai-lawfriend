import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import {
  gongbuhoMemoryPacketSchema,
  type GongbuhoMemoryPacket,
} from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { realTimeLegalSignalSchema } from "@/features/gongbuho-intelligence-layer/phase59b-real-time-legal-signal.schema";
import { buildStrategyCandidate } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.policy";
import {
  strategyCandidateSchema,
  type StrategyCandidate,
} from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";
import {
  assertEvidenceGapDetectionAllowed,
  evaluateStrategyCandidateForDetection,
  PHASE62B_BOUNDARY_MARKERS,
  createEmptyDetectionExcludedItems,
} from "./phase62b-evidence-gap-detection-engine.policy";
import {
  PHASE62B_EVIDENCE_GAP_DETECTION_EVIDENCE_TAG,
  PHASE62B_EVIDENCE_GAP_DETECTION_LOCK,
} from "./phase62b-evidence-gap-detection-engine.lock";
import {
  buildEvidenceGapDetectionReport,
  detectEvidenceGapsFromReasoningContext,
  rankEvidenceGapCandidates,
} from "./phase62b-evidence-gap-detection-engine.service";
import { evidenceGapDetectionReportSchema } from "./phase62b-evidence-gap-detection-engine.schema";

const baseTrace = {
  traceId: "trace-base",
  sourceKind: "CASE_INTERVIEW" as const,
  sourceRef: "interview:1",
  capturedAt: "2026-05-26T10:00:00.000Z",
};

function buildMemoryPacket(overrides: Partial<GongbuhoMemoryPacket> = {}) {
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
      {
        factId: "fact-no-evidence",
        label: "자료 없는 사실",
        summary: "뒷받침 자료 없음",
        reviewStatus: "LAWYER_CONFIRMED",
        linkedClaimIds: ["claim-2"],
        linkedEvidenceIds: [],
        sourceTraceIds: ["trace-base"],
      },
    ],
    disputedFacts: [],
    clientWeaknesses: [],
    opponentClaims: [],
    evidenceMap: [
      {
        linkId: "link-weak",
        evidenceRef: "evidence-0",
        claimRef: "claim-1",
        supportStrength: "WEAK",
        reviewStatus: "LAWYER_CONFIRMED",
        sourceTraceIds: ["trace-base"],
      },
    ],
    judgmentLinks: [
      {
        referenceId: "judgment-1",
        judgmentRef: "2024da12345",
        relevanceSummary: "유사 요건 판례",
        reviewStatus: "LAWYER_CONFIRMED",
        sourceTraceIds: ["trace-base"],
        realTimeSignalStatus: "APPROVED_FOR_AI_USE",
      },
    ],
    lawyerConfirmedIssues: [],
    sourceTrace: [baseTrace],
    caseScopeOnly: true,
    tenantIsolationRequired: true,
    createdAt: "2026-05-26T10:00:00.000Z",
    updatedAt: "2026-05-26T11:00:00.000Z",
    ...overrides,
  });
}

function buildReasoningContext(overrides?: { auditRef?: string; memoryPacket?: GongbuhoMemoryPacket }) {
  return buildGongbuhoReasoningContextBundle({
    caseId: "case-1",
    tenantId: "tenant-1",
    purpose: "STRONG_REASONING",
    memoryPacket: overrides?.memoryPacket ?? buildMemoryPacket(),
    realTimeSignals: [],
    auditRef: overrides?.auditRef ?? "audit-reasoning-1",
  });
}

function buildEvidenceGapStrategyCandidate(
  reasoningContext: ReturnType<typeof buildReasoningContext>,
  overrides?: Partial<Parameters<typeof buildStrategyCandidate>[0]>,
): StrategyCandidate {
  return buildStrategyCandidate({
    candidateId: "sc-gap-1",
    caseId: "case-1",
    tenantId: "tenant-1",
    candidateKind: "EVIDENCE_GAP",
    title: "증거공백 전략 후보",
    summary: "claim-1 증거 연결 약함",
    rationale: "evidence map supportStrength WEAK",
    riskNotes: [],
    suggestedInternalActions: ["보완자료 검토"],
    reasoningContextAuditRef: reasoningContext.auditRef,
    reasoningContext,
    reusablePatterns: [],
    sourceTrace: [
      {
        traceId: "st-1",
        sourceKind: "GONGBUHO_REASONING_CONTEXT",
        sourceRef: "claim-1",
        reasoningContextAuditRef: reasoningContext.auditRef,
        capturedAt: "2026-05-26T12:00:00.000Z",
      },
    ],
    auditRef: "audit-strategy-1",
    ...overrides,
  });
}

function buildRawStrategyCandidate(
  reasoningContext: ReturnType<typeof buildReasoningContext>,
  overrides: Partial<StrategyCandidate> = {},
): StrategyCandidate {
  const base = buildEvidenceGapStrategyCandidate(reasoningContext);
  return strategyCandidateSchema.parse({ ...base, ...overrides });
}

describe("Phase 62-B Evidence Gap Detection Engine", () => {
  it("exposes detection boundary markers", () => {
    expect(PHASE62B_BOUNDARY_MARKERS).toContain("NO_DETECTION_WITHOUT_REASONING_CONTEXT");
    expect(PHASE62B_BOUNDARY_MARKERS).toContain("CONTROL_TOWER_BRAIN_VERIFY_REQUIRED");
    expect(PHASE62B_BOUNDARY_MARKERS).toHaveLength(11);
  });

  it("locks detection engine SSOT", () => {
    expect(PHASE62B_EVIDENCE_GAP_DETECTION_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE62B_EVIDENCE_GAP_DETECTION_EVIDENCE_TAG).toContain("PHASE62B");
  });

  it("blocks detection without reasoningContextAuditRef", () => {
    const reasoningContext = {
      ...buildReasoningContext(),
      auditRef: "",
    };
    expect(() =>
      assertEvidenceGapDetectionAllowed({
        reasoningContext,
        caseId: "case-1",
        tenantId: "tenant-1",
        auditRef: "audit-detect-1",
      }),
    ).toThrow("NO_DETECTION_WITHOUT_REASONING_CONTEXT");
  });

  it("excludes sourceTrace-less strategy traces from gap evaluation", () => {
    const excludedItems = createEmptyDetectionExcludedItems();
    const reasoningContext = buildReasoningContext();
    const candidate = buildRawStrategyCandidate(reasoningContext, {
      sourceTrace: [
        {
          traceId: " ",
          sourceKind: "GONGBUHO_REASONING_CONTEXT",
          sourceRef: "claim-1",
          reasoningContextAuditRef: reasoningContext.auditRef,
          capturedAt: "2026-05-26T12:00:00.000Z",
        },
      ],
    });

    evaluateStrategyCandidateForDetection({
      candidate,
      targetCaseId: "case-1",
      targetTenantId: "tenant-1",
      excludedItems,
    });

    expect(excludedItems.missingSourceTraceCount).toBeGreaterThanOrEqual(1);
  });

  it("excludes unapproved signal and AI candidate memory sources", () => {
    const excludedItems = createEmptyDetectionExcludedItems();
    const reasoningContext = buildReasoningContext();
    const candidate = buildRawStrategyCandidate(reasoningContext, {
      sourceTrace: [
        {
          traceId: "st-bad-signal",
          sourceKind: "APPROVED_REAL_TIME_SIGNAL",
          sourceRef: "signal-1",
          reasoningContextAuditRef: reasoningContext.auditRef,
          realTimeSignalStatus: "RELEVANCE_SCORED",
          capturedAt: "2026-05-26T12:00:00.000Z",
        },
        {
          traceId: "st-bad-memory",
          sourceKind: "LAWYER_CONFIRMED_MEMORY",
          sourceRef: "claim-9",
          reasoningContextAuditRef: reasoningContext.auditRef,
          memoryReviewStatus: "AI_CANDIDATE",
          capturedAt: "2026-05-26T12:00:00.000Z",
        },
        {
          traceId: "st-good",
          sourceKind: "GONGBUHO_REASONING_CONTEXT",
          sourceRef: "claim-1",
          reasoningContextAuditRef: reasoningContext.auditRef,
          capturedAt: "2026-05-26T12:00:00.000Z",
        },
      ],
    });

    evaluateStrategyCandidateForDetection({
      candidate,
      targetCaseId: "case-1",
      targetTenantId: "tenant-1",
      excludedItems,
    });

    expect(excludedItems.unapprovedSignalSourceCount).toBeGreaterThanOrEqual(1);
    expect(excludedItems.aiCandidateMemorySourceCount).toBeGreaterThanOrEqual(1);
  });

  it("excludes cross-tenant strategy candidate", () => {
    const excludedItems = createEmptyDetectionExcludedItems();
    const reasoningContext = buildReasoningContext();
    const candidate = buildRawStrategyCandidate(reasoningContext, {
      tenantId: "tenant-2",
    });

    const result = evaluateStrategyCandidateForDetection({
      candidate,
      targetCaseId: "case-1",
      targetTenantId: "tenant-1",
      excludedItems,
    });

    expect(result.allowed).toBe(false);
    expect(excludedItems.crossTenantSourceCount).toBe(1);
  });

  it("detects gaps and builds report with fixed operational gates", () => {
    const reasoningContext = buildReasoningContext();
    const strategyCandidate = buildEvidenceGapStrategyCandidate(reasoningContext);

    const report = buildEvidenceGapDetectionReport({
      reportId: "report-1",
      caseId: "case-1",
      tenantId: "tenant-1",
      reasoningContext,
      strategyCandidates: [strategyCandidate],
      auditRef: "audit-detect-1",
    });

    const parsed = evidenceGapDetectionReportSchema.parse(report);
    expect(parsed.clientVisible).toBe(false);
    expect(parsed.autoTaskCreationAllowed).toBe(false);
    expect(parsed.autoFilingAllowed).toBe(false);
    expect(parsed.lawyerReviewRequired).toBe(true);
    expect(parsed.detectedCandidates.length).toBeGreaterThan(0);
    expect(parsed.detectedCandidates.every((c) => c.reviewStatus === "LAWYER_REVIEW_REQUIRED")).toBe(
      true,
    );
    expect(parsed.detectionSummary.totalGapCount).toBe(parsed.detectedCandidates.length);
    expect(parsed.detectionSummary.criticalGapCount).toBe(
      parsed.detectedCandidates.filter((c) => c.severity === "CRITICAL").length,
    );
    expect(parsed.detectionSummary.highPriorityGapCount).toBe(
      parsed.detectedCandidates.filter((c) => c.severity === "HIGH").length,
    );
    expect(parsed.excludedItems.missingSourceTraceCount).toBeGreaterThanOrEqual(0);
  });

  it("ranks candidates by severity and assigns priorityRank", () => {
    const reasoningContext = buildReasoningContext();
    const candidates = detectEvidenceGapsFromReasoningContext({
      reportId: "report-2",
      caseId: "case-1",
      tenantId: "tenant-1",
      reasoningContext,
      strategyCandidates: [],
      auditRef: "audit-detect-2",
    });

    const ranked = rankEvidenceGapCandidates(candidates);
    expect(ranked[0]?.priorityRank).toBe(1);
    if (ranked.length > 1) {
      const firstScore =
        (ranked[0]?.litigationImpactScore ?? 0) * (ranked[0]?.proofImportanceScore ?? 0);
      const secondScore =
        (ranked[1]?.litigationImpactScore ?? 0) * (ranked[1]?.proofImportanceScore ?? 0);
      expect(firstScore).toBeGreaterThanOrEqual(secondScore);
    }
  });

  it("counts excluded unapproved signal from reasoning context bundle", () => {
    const unapprovedSignal = realTimeLegalSignalSchema.parse({
      signalId: "sig-unapproved",
      caseId: "case-1",
      tenantId: "tenant-1",
      title: "미승인 신호",
      summaryPointer: "statute://x",
      signalKind: "STATUTE",
      status: "RELEVANCE_SCORED",
      sourceReliability: "HIGH",
      conflictStatus: "CLEAR",
      caseRelevanceScore: 0.7,
      lawyerReviewRequired: true,
      lawyerReviewed: false,
      staleAfter: "2026-06-26T12:00:00.000Z",
      fetchedAt: "2026-05-26T10:00:00.000Z",
      updatedAt: "2026-05-26T11:00:00.000Z",
      sourceTrace: {
        traceId: "trace-signal",
        sourceKind: "STATUTE",
        canonicalSourceRef: "law://1",
        summaryPointer: "statute://x",
        fetchedAt: "2026-05-26T10:00:00.000Z",
      },
      compilerPolicyApplied: true,
      caseScopeOnly: true,
      tenantIsolationRequired: true,
    });

    const reasoningContext = buildGongbuhoReasoningContextBundle({
      caseId: "case-1",
      tenantId: "tenant-1",
      purpose: "STRONG_REASONING",
      memoryPacket: buildMemoryPacket(),
      realTimeSignals: [unapprovedSignal],
      auditRef: "audit-reasoning-1",
    });

    const report = buildEvidenceGapDetectionReport({
      reportId: "report-3",
      caseId: "case-1",
      tenantId: "tenant-1",
      reasoningContext,
      strategyCandidates: [],
      auditRef: "audit-detect-3",
    });

    expect(report.excludedItems.unapprovedSignalSourceCount).toBeGreaterThanOrEqual(1);
  });
});
