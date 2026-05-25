import { describe, expect, it } from "vitest";
import { gongbuhoMemoryPacketSchema } from "./phase59a-gongbuho-memory-packet.schema";
import { realTimeLegalSignalSchema } from "./phase59b-real-time-legal-signal.schema";
import { buildGongbuhoReasoningContextBundle } from "./phase59c-gongbuho-reasoning-context.builder";
import {
  canIncludeMemoryItemInStrongReasoning,
  canIncludeRealTimeSignalInContext,
  PHASE59C_BOUNDARY_MARKERS,
} from "./phase59c-gongbuho-reasoning-context.policy";
import {
  PHASE59C_GONGBUHO_REASONING_CONTEXT_EVIDENCE_TAG,
  PHASE59C_GONGBUHO_REASONING_CONTEXT_LOCK,
} from "./phase59c-gongbuho-reasoning-context.lock";
import { gongbuhoReasoningContextBundleSchema } from "./phase59c-gongbuho-reasoning-context.schema";

const NOW = new Date("2026-05-26T12:00:00.000Z");

const baseTrace = {
  traceId: "trace-base",
  sourceKind: "CASE_INTERVIEW" as const,
  sourceRef: "interview:1",
  capturedAt: "2026-05-26T10:00:00.000Z",
};

function buildMemoryPacket(
  overrides: Partial<ReturnType<typeof gongbuhoMemoryPacketSchema.parse>> = {},
) {
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
        factId: "fact-candidate",
        label: "후보 사실",
        summary: "AI 후보",
        reviewStatus: "AI_CANDIDATE",
        linkedClaimIds: [],
        linkedEvidenceIds: [],
        sourceTraceIds: ["trace-base"],
      },
    ],
    disputedFacts: [],
    clientWeaknesses: [],
    opponentClaims: [],
    evidenceMap: [
      {
        linkId: "link-locked",
        evidenceRef: "evidence-1",
        claimRef: "claim-1",
        supportStrength: "STRONG",
        reviewStatus: "LOCKED",
        sourceTraceIds: ["trace-base"],
      },
    ],
    judgmentLinks: [],
    lawyerConfirmedIssues: [],
    sourceTrace: [baseTrace],
    caseScopeOnly: true,
    tenantIsolationRequired: true,
    createdAt: "2026-05-26T10:00:00.000Z",
    updatedAt: "2026-05-26T11:00:00.000Z",
    ...overrides,
  });
}

function buildApprovedSignal(
  overrides: Partial<ReturnType<typeof realTimeLegalSignalSchema.parse>> = {},
) {
  return realTimeLegalSignalSchema.parse({
    signalId: "sig-approved",
    caseId: "case-1",
    tenantId: "tenant-1",
    title: "대법원 판례",
    summaryPointer: "precedent://2024da12345",
    signalKind: "PRECEDENT",
    status: "APPROVED_FOR_AI_USE",
    sourceReliability: "HIGH",
    conflictStatus: "CLEAR",
    caseRelevanceScore: 0.85,
    lawyerReviewRequired: false,
    lawyerReviewed: true,
    staleAfter: "2026-06-26T12:00:00.000Z",
    fetchedAt: "2026-05-26T10:00:00.000Z",
    updatedAt: "2026-05-26T11:00:00.000Z",
    sourceTrace: {
      traceId: "trace-signal",
      sourceKind: "PRECEDENT",
      canonicalSourceRef: "SCOURT:2024DA12345",
      summaryPointer: "holding summary",
      fetchedAt: "2026-05-26T10:00:00.000Z",
    },
    compilerPolicyApplied: true,
    caseScopeOnly: true,
    tenantIsolationRequired: true,
    ...overrides,
  });
}

describe("Phase 59-C Gongbuho Reasoning Context", () => {
  it("includes LAWYER_CONFIRMED memory in context bundle", () => {
    const bundle = buildGongbuhoReasoningContextBundle({
      caseId: "case-1",
      tenantId: "tenant-1",
      memoryPacket: buildMemoryPacket(),
      realTimeSignals: [],
      auditRef: "audit:bundle-1",
      now: NOW,
    });

    expect(bundle.memoryGrounds.confirmedFacts.some((f) => f.factId === "fact-confirmed")).toBe(
      true,
    );
    expect(canIncludeMemoryItemInStrongReasoning({
      reviewStatus: "LAWYER_CONFIRMED",
      sourceTraceIds: ["trace-base"],
    }).allowed).toBe(true);
  });

  it("includes LOCKED memory as strong reasoning ground", () => {
    const bundle = buildGongbuhoReasoningContextBundle({
      caseId: "case-1",
      tenantId: "tenant-1",
      memoryPacket: buildMemoryPacket(),
      realTimeSignals: [],
      auditRef: "audit:bundle-2",
      now: NOW,
    });

    expect(bundle.memoryGrounds.evidenceMap.some((e) => e.linkId === "link-locked")).toBe(true);
    expect(canIncludeMemoryItemInStrongReasoning({
      reviewStatus: "LOCKED",
      sourceTraceIds: ["trace-base"],
    }).allowed).toBe(true);
  });

  it("excludes AI_CANDIDATE memory from strong reasoning context", () => {
    const bundle = buildGongbuhoReasoningContextBundle({
      caseId: "case-1",
      tenantId: "tenant-1",
      memoryPacket: buildMemoryPacket(),
      realTimeSignals: [],
      auditRef: "audit:bundle-3",
      now: NOW,
    });

    expect(bundle.memoryGrounds.confirmedFacts.some((f) => f.factId === "fact-candidate")).toBe(
      false,
    );
    expect(bundle.excludedItems.aiCandidateMemoryCount).toBe(1);
  });

  it("includes only APPROVED_FOR_AI_USE signals", () => {
    const bundle = buildGongbuhoReasoningContextBundle({
      caseId: "case-1",
      tenantId: "tenant-1",
      memoryPacket: buildMemoryPacket(),
      realTimeSignals: [
        buildApprovedSignal(),
        buildApprovedSignal({
          signalId: "sig-fetched",
          status: "FETCHED",
          signalKind: "STATUTE",
        }),
      ],
      auditRef: "audit:bundle-4",
      now: NOW,
    });

    expect(bundle.approvedRealTimeSignals.judgments).toHaveLength(1);
    expect(bundle.excludedItems.unapprovedSignalCount).toBe(1);
  });

  it("excludes STALE CONFLICTED and UNVERIFIED_SOURCE signals", () => {
    const bundle = buildGongbuhoReasoningContextBundle({
      caseId: "case-1",
      tenantId: "tenant-1",
      memoryPacket: buildMemoryPacket(),
      realTimeSignals: [
        buildApprovedSignal({
          signalId: "sig-stale",
          status: "STALE",
          staleAfter: "2026-05-25T12:00:00.000Z",
        }),
        buildApprovedSignal({
          signalId: "sig-conflicted",
          status: "CONFLICTED",
          conflictStatus: "CONFLICTED",
        }),
        buildApprovedSignal({
          signalId: "sig-unverified",
          status: "UNVERIFIED_SOURCE",
        }),
      ],
      auditRef: "audit:bundle-5",
      now: NOW,
    });

    expect(bundle.approvedRealTimeSignals.judgments).toHaveLength(0);
    expect(bundle.excludedItems.staleSignalCount).toBe(1);
    expect(bundle.excludedItems.conflictedSignalCount).toBe(1);
    expect(bundle.excludedItems.unapprovedSignalCount).toBe(1);
  });

  it("excludes tenantId mismatched items", () => {
    const decision = canIncludeRealTimeSignalInContext({
      signal: buildApprovedSignal({ tenantId: "tenant-2" }),
      targetCaseId: "case-1",
      targetTenantId: "tenant-1",
      purpose: "STRONG_REASONING",
      now: NOW,
    });

    expect(decision.allowed).toBe(false);
    expect(decision.blockedReason).toBe("NO_CROSS_TENANT_REASONING_CONTEXT");
  });

  it("excludes caseId mismatched items", () => {
    const decision = canIncludeRealTimeSignalInContext({
      signal: buildApprovedSignal({ caseId: "case-2" }),
      targetCaseId: "case-1",
      targetTenantId: "tenant-1",
      purpose: "STRONG_REASONING",
      now: NOW,
    });

    expect(decision.allowed).toBe(false);
    expect(decision.blockedReason).toBe("NO_CROSS_CASE_MEMORY_MERGE_WITHOUT_POLICY");
  });

  it("excludes sourceTrace-less memory items", () => {
    expect(
      canIncludeMemoryItemInStrongReasoning({
        reviewStatus: "LAWYER_CONFIRMED",
        sourceTraceIds: [],
      }).blockedReason,
    ).toBe("NO_SOURCELESS_CONTEXT_ITEM");
  });

  it("records excludedItems counts accurately", () => {
    const bundle = buildGongbuhoReasoningContextBundle({
      caseId: "case-1",
      tenantId: "tenant-1",
      memoryPacket: buildMemoryPacket(),
      realTimeSignals: [
        buildApprovedSignal(),
        buildApprovedSignal({ signalId: "sig-stale-2", status: "STALE", staleAfter: "2026-05-20T00:00:00.000Z" }),
        buildApprovedSignal({ signalId: "sig-fetch", status: "FETCHED" }),
      ],
      auditRef: "audit:bundle-6",
      now: NOW,
    });

    expect(bundle.excludedItems.aiCandidateMemoryCount).toBe(1);
    expect(bundle.excludedItems.staleSignalCount).toBe(1);
    expect(bundle.excludedItems.unapprovedSignalCount).toBe(1);
    expect(bundle.excludedItems.conflictedSignalCount).toBe(0);
  });

  it("allows client visible purpose only for lawyer reviewed signals", () => {
    const approved = canIncludeRealTimeSignalInContext({
      signal: buildApprovedSignal({ lawyerReviewed: true }),
      targetCaseId: "case-1",
      targetTenantId: "tenant-1",
      purpose: "CLIENT_VISIBLE",
      now: NOW,
    });
    const pending = canIncludeRealTimeSignalInContext({
      signal: buildApprovedSignal({ lawyerReviewRequired: false, lawyerReviewed: false }),
      targetCaseId: "case-1",
      targetTenantId: "tenant-1",
      purpose: "CLIENT_VISIBLE",
      now: NOW,
    });

    expect(approved.allowed).toBe(true);
    expect(pending.allowed).toBe(false);
    expect(pending.blockedReason).toBe("NO_CLIENT_VISIBLE_REASONING_WITHOUT_LAWYER_REVIEW");
  });

  it("always includes reasoningLimits and sourceTrace in bundle", () => {
    const bundle = buildGongbuhoReasoningContextBundle({
      caseId: "case-1",
      tenantId: "tenant-1",
      memoryPacket: buildMemoryPacket(),
      realTimeSignals: [buildApprovedSignal()],
      auditRef: "audit:bundle-7",
      now: NOW,
    });

    const parsed = gongbuhoReasoningContextBundleSchema.parse(bundle);

    expect(parsed.reasoningLimits.strongReasoningOnlyFromConfirmedOrLocked).toBe(true);
    expect(parsed.reasoningLimits.approvedSignalsOnly).toBe(true);
    expect(parsed.reasoningLimits.noRawClientFactGlobalLearning).toBe(true);
    expect(parsed.sourceTrace.length).toBeGreaterThan(0);
    expect(parsed.bundleVersion).toBe("59-C.1");
    expect(PHASE59C_BOUNDARY_MARKERS).toHaveLength(9);
    expect(PHASE59C_GONGBUHO_REASONING_CONTEXT_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE59C_GONGBUHO_REASONING_CONTEXT_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59C-REASONING-CONTEXT",
    );
  });
});
