import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import { gongbuhoMemoryPacketSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { buildStrategyCandidate } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.policy";
import { buildEvidenceGapDetectionReport } from "./phase62b-evidence-gap-detection-engine.service";
import type { EvidenceGapDetectionReport } from "./phase62b-evidence-gap-detection-engine.schema";
import {
  assertClientSafeQuestionDraftAllowed,
  assertSupplementRequestDraftAllowed,
  buildSupplementRequestDraft,
  evaluateClientSafeQuestionDraft,
  PHASE62C_BOUNDARY_MARKERS,
} from "./phase62c-supplement-request-draft.policy";
import {
  PHASE62C_SUPPLEMENT_REQUEST_DRAFT_EVIDENCE_TAG,
  PHASE62C_SUPPLEMENT_REQUEST_DRAFT_LOCK,
} from "./phase62c-supplement-request-draft.lock";
import {
  generateSupplementRequestDraftFromDetectionReport,
  generateSupplementRequestDraftsFromDetectionReport,
} from "./phase62c-supplement-request-draft.service";
import { supplementRequestDraftSchema } from "./phase62c-supplement-request-draft.schema";

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
      {
        factId: "fact-no-evidence",
        label: "자료 없는 사실",
        summary: "뒷밓침 자료 없음",
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

function buildDetectionReport(): EvidenceGapDetectionReport {
  const reasoningContext = buildReasoningContext();
  const strategyCandidate = buildStrategyCandidate({
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
  });

  return buildEvidenceGapDetectionReport({
    reportId: "report-62c-1",
    caseId: "case-1",
    tenantId: "tenant-1",
    reasoningContext,
    strategyCandidates: [strategyCandidate],
    auditRef: "audit-detect-62c-1",
  });
}

describe("Phase 62-C Supplement Request Draft Generator", () => {
  it("exposes supplement draft boundary markers", () => {
    expect(PHASE62C_BOUNDARY_MARKERS).toContain("NO_SUPPLEMENT_REQUEST_WITHOUT_EVIDENCE_GAP");
    expect(PHASE62C_BOUNDARY_MARKERS).toContain("NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT");
    expect(PHASE62C_BOUNDARY_MARKERS).toContain("CONTROL_TOWER_BRAIN_VERIFY_REQUIRED");
    expect(PHASE62C_BOUNDARY_MARKERS).toHaveLength(10);
  });

  it("locks supplement request draft generator SSOT", () => {
    expect(PHASE62C_SUPPLEMENT_REQUEST_DRAFT_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE62C_SUPPLEMENT_REQUEST_DRAFT_EVIDENCE_TAG).toContain("PHASE62C");
    expect(PHASE62C_SUPPLEMENT_REQUEST_DRAFT_LOCK.portalDraftStatus).toBe(
      "CLIENT_COLLABORATION_PORTAL_DRAFT",
    );
  });

  it("blocks draft generation without evidence gap candidates", () => {
    const detectionReport = {
      ...buildDetectionReport(),
      detectedCandidates: [],
    };

    expect(() =>
      assertSupplementRequestDraftAllowed({
        detectionReport,
        auditRef: "audit-draft-1",
        sourceTraceCount: 1,
      }),
    ).toThrow("NO_SUPPLEMENT_REQUEST_WITHOUT_EVIDENCE_GAP");
  });

  it("blocks draft generation without sourceDetectionReportId", () => {
    const detectionReport = {
      ...buildDetectionReport(),
      reportId: "",
    };

    expect(() =>
      buildSupplementRequestDraft({
        draftId: "draft-1",
        detectionReport,
        auditRef: "audit-draft-1",
      }),
    ).toThrow("NO_SUPPLEMENT_REQUEST_WITHOUT_EVIDENCE_GAP");
  });

  it("blocks draft generation without sourceTrace", () => {
    const detectionReport = buildDetectionReport();
    const candidateWithoutTrace = {
      ...detectionReport.detectedCandidates[0]!,
      sourceTrace: [],
    };

    expect(() =>
      buildSupplementRequestDraft({
        draftId: "draft-2",
        detectionReport: {
          ...detectionReport,
          detectedCandidates: [candidateWithoutTrace],
        },
        auditRef: "audit-draft-2",
      }),
    ).toThrow("NO_DRAFT_WITHOUT_SOURCE_TRACE");
  });

  it("blocks draft generation without auditRef", () => {
    const detectionReport = buildDetectionReport();

    expect(() =>
      buildSupplementRequestDraft({
        draftId: "draft-3",
        detectionReport,
        auditRef: "",
      }),
    ).toThrow("NO_DRAFT_WITHOUT_AUDIT_REF");
  });

  it("generates draft with fixed operational gates and lawyer review default", () => {
    const detectionReport = buildDetectionReport();
    const draft = generateSupplementRequestDraftFromDetectionReport({
      detectionReport,
      auditRef: "audit-draft-4",
      draftId: "draft-4",
    });

    const parsed = supplementRequestDraftSchema.parse(draft);
    expect(parsed.clientVisible).toBe(false);
    expect(parsed.sendAllowed).toBe(false);
    expect(parsed.autoMessageAllowed).toBe(false);
    expect(parsed.autoTaskCreationAllowed).toBe(false);
    expect(parsed.reviewStatus).toBe("LAWYER_REVIEW_REQUIRED");
    expect(parsed.portalDraftStatus).toBe("CLIENT_COLLABORATION_PORTAL_DRAFT");
    expect(parsed.sourceDetectionReportId).toBe("report-62c-1");
    expect(parsed.sourceEvidenceGapCandidateIds.length).toBeGreaterThan(0);
    expect(parsed.clientSafeDraftItems.length).toBeGreaterThan(0);
    expect(parsed.sourceTrace.length).toBeGreaterThan(0);
  });

  it("blocks internal strategy wording in clientSafeQuestionDraft", () => {
    const leak = evaluateClientSafeQuestionDraft("의뢰인 약점을 보완하기 위해 자료를 요청합니다.");
    expect(leak.allowed).toBe(false);
    expect(leak.blockedBy).toBe("NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT");

    expect(() =>
      assertClientSafeQuestionDraftAllowed("내부 전략에 따라 반박 자료가 필요합니다."),
    ).toThrow("NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT");
  });

  it("generates drafts from detection report via service batch helper", () => {
    const detectionReport = buildDetectionReport();
    const drafts = generateSupplementRequestDraftsFromDetectionReport({
      detectionReport,
      auditRef: "audit-draft-5",
      draftIdPrefix: "supplement-draft",
    });

    expect(drafts).toHaveLength(1);
    expect(drafts[0]?.draftId).toBe("supplement-draft-report-62c-1");
  });
});
