import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import { gongbuhoMemoryPacketSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { buildStrategyCandidate } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.policy";
import {
  buildEvidenceGapCandidate,
  canCreateLitigationOpsSupplementDraft,
  canSendClientSupplementRequest,
  evaluateEvidenceGapSourceTrace,
  PHASE62A_BOUNDARY_MARKERS,
} from "./phase62a-evidence-gap-candidate.policy";
import {
  PHASE62A_EVIDENCE_GAP_CANDIDATE_EVIDENCE_TAG,
  PHASE62A_EVIDENCE_GAP_CANDIDATE_LOCK,
} from "./phase62a-evidence-gap-candidate.lock";
import { evidenceGapCandidateSchema } from "./phase62a-evidence-gap-candidate.schema";

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

describe("Phase 62-A Evidence Gap Candidate Schema", () => {
  it("exposes evidence gap boundary markers", () => {
    expect(PHASE62A_BOUNDARY_MARKERS).toContain("NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL");
    expect(PHASE62A_BOUNDARY_MARKERS).toContain("NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE");
    expect(PHASE62A_BOUNDARY_MARKERS).toHaveLength(8);
  });

  it("locks evidence gap candidate SSOT", () => {
    expect(PHASE62A_EVIDENCE_GAP_CANDIDATE_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE62A_EVIDENCE_GAP_CANDIDATE_EVIDENCE_TAG).toContain("PHASE62A");
    expect(PHASE62A_EVIDENCE_GAP_CANDIDATE_LOCK.controlTowerBrainVerify).toBe(
      "verify:aibeopchin-control-tower-brain-rc",
    );
  });

  it("builds lawyer-review evidence gap candidate from reasoning context", () => {
    const reasoningContext = buildReasoningContext();
    const strategyCandidate = buildStrategyCandidate({
      candidateId: "sc-gap-1",
      caseId: "case-1",
      tenantId: "tenant-1",
      candidateKind: "EVIDENCE_GAP",
      title: "증거공백 전략 후보",
      summary: "claim-1 증거 연결 약함",
      rationale: "evidence map supportStrength WEAK",
      riskNotes: ["입증 부족 시 불리"],
      suggestedInternalActions: ["보완자료 요청 검토"],
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

    const gapCandidate = buildEvidenceGapCandidate({
      gapCandidateId: "egc-1",
      caseId: "case-1",
      tenantId: "tenant-1",
      claimRef: "claim-1",
      gapKind: "WEAK_EVIDENCE_SUPPORT",
      severity: "HIGH",
      litigationImpactScore: 0.82,
      proofImportanceScore: 0.9,
      priorityRank: 1,
      title: "입금내역 보완 필요",
      summary: "claim-1 입증을 위한 입금내역 공백",
      rationale: "evidence-0 supportStrength WEAK",
      suggestedSupplementItems: [
        {
          itemId: "sup-1",
          documentType: "BANK_TRANSFER",
          title: "입금내역",
          description: "2024년 3~6월 계좌 입금내역",
          whyNeeded: "claim-1 사실관계 입증",
          priorityScore: 0.92,
        },
      ],
      clientRequestDraft: {
        draftId: "draft-1",
        draftText: "입금내역 제출을 부탁드립니다.",
        clientVisible: false,
        lawyerApprovalRequired: true,
      },
      strategyCandidate,
      reasoningContextAuditRef: reasoningContext.auditRef,
      reasoningContext,
      sourceTrace: [
        {
          traceId: "egt-1",
          sourceKind: "EVIDENCE_MAP",
          sourceRef: "link-weak",
          reasoningContextAuditRef: reasoningContext.auditRef,
          claimRef: "claim-1",
          evidenceRef: "evidence-0",
          capturedAt: "2026-05-26T12:00:00.000Z",
        },
      ],
      litigationOpsLinkTarget: "SUPPLEMENT_REQUEST_DRAFT",
      auditRef: "audit-gap-1",
    });

    const parsed = evidenceGapCandidateSchema.parse(gapCandidate);
    expect(parsed.reviewStatus).toBe("LAWYER_REVIEW_REQUIRED");
    expect(parsed.isFinalEvidenceJudgment).toBe(false);
    expect(parsed.clientVisibleByDefault).toBe(false);
    expect(parsed.clientRequestDraft?.clientVisible).toBe(false);
    expect(parsed.strategyCandidateId).toBe("sc-gap-1");
  });

  it("blocks evidence gap without source trace ref", () => {
    const result = evaluateEvidenceGapSourceTrace({
      traceId: "",
      sourceKind: "EVIDENCE_MAP",
      sourceRef: "link-weak",
      reasoningContextAuditRef: "audit-reasoning-1",
      capturedAt: "2026-05-26T12:00:00.000Z",
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE");
  });

  it("blocks client supplement request before lawyer approval", () => {
    const gate = canSendClientSupplementRequest({ reviewStatus: "LAWYER_REVIEW_REQUIRED" });
    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("LAWYER_REVIEW_REQUIRED_FOR_REQUEST");
  });

  it("allows litigation ops draft only after lawyer approval", () => {
    expect(
      canCreateLitigationOpsSupplementDraft({ reviewStatus: "LAWYER_REVIEW_REQUIRED" }).allowed,
    ).toBe(false);
    expect(
      canCreateLitigationOpsSupplementDraft({ reviewStatus: "LAWYER_APPROVED" }).allowed,
    ).toBe(true);
  });
});
