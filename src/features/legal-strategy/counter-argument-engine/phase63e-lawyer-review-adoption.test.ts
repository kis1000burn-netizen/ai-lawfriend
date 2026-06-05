import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import { gongbuhoMemoryPacketSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { buildOpponentArgumentFromMemoryClaim } from "./phase63a-opponent-argument.policy";
import { buildCounterArgumentCandidateFromOpponentArgument } from "./phase63b-counter-argument-candidate.service";
import { runBackfireRiskCheck } from "./phase63c-risk-backfire-check.service";
import { generateDraftParagraphsFromCandidate } from "./phase63d-draft-paragraph-generator.service";
import type { CounterArgumentDraftParagraph } from "./phase63d-draft-paragraph-generator.schema";
import {
  adoptDraftParagraph,
  evaluateDocumentInsertCandidateForAutoFile,
  evaluateDocumentInsertCandidateForClientVisibility,
  evaluateDraftParagraphForLawyerReview,
  modifyDraftParagraph,
  rejectDraftParagraph,
  PHASE63E_BOUNDARY_MARKERS,
} from "./phase63e-lawyer-review-adoption.policy";
import {
  PHASE63E_LAWYER_REVIEW_ADOPTION_EVIDENCE_TAG,
  PHASE63E_LAWYER_REVIEW_ADOPTION_LOCK,
} from "./phase63e-lawyer-review-adoption.lock";
import {
  processLawyerAdoptionReview,
  summarizeAdoptionReviewResult,
} from "./phase63e-lawyer-review-adoption.service";
import { counterArgumentDocumentInsertCandidateSchema } from "./phase63e-lawyer-review-adoption.schema";

const baseTrace = {
  traceId: "trace-base",
  sourceKind: "CASE_INTERVIEW" as const,
  sourceRef: "interview:1",
  capturedAt: "2026-05-26T10:00:00.000Z",
};

function buildMemoryPacket() {
  return gongbuhoMemoryPacketSchema.parse({
    packetId: "gmp-63e-1",
    caseId: "case-63e-1",
    tenantId: "tenant-63e-1",
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
    caseId: "case-63e-1",
    tenantId: "tenant-63e-1",
    purpose: "STRONG_REASONING",
    memoryPacket: buildMemoryPacket(),
    realTimeSignals: [],
    auditRef: "audit-reasoning-63e-1",
  });
}

function buildDraftParagraph(): CounterArgumentDraftParagraph {
  const reasoningContext = buildReasoningContext();
  const memoryPacket = buildMemoryPacket();

  const opponentArgument = buildOpponentArgumentFromMemoryClaim({
    opponentArgumentId: "oa-63e-1",
    caseId: "case-63e-1",
    tenantId: "tenant-63e-1",
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
        traceId: "oat-63e-1",
        sourceKind: "OPPONENT_CLAIM_MEMORY",
        sourceRef: "opp-claim-1",
        reasoningContextAuditRef: reasoningContext.auditRef,
        opponentClaimId: "opp-claim-1",
        memoryReviewStatus: "LAWYER_CONFIRMED",
        capturedAt: "2026-05-26T12:00:00.000Z",
      },
    ],
    auditRef: "audit-oa-63e-1",
  });

  const candidate = buildCounterArgumentCandidateFromOpponentArgument({
    opponentArgument,
    reasoningContext,
    auditRef: "audit-cac-63e-1",
  });

  const safeCandidate = {
    ...candidate,
    decomposition: {
      ...candidate.decomposition,
      counterDirection: "확정 사실과 판례 근거를 중심으로 반박 방향을 검토",
      weakLinkScore: 0.4,
      additionalEvidenceNeeded: [],
    },
  };

  const report = runBackfireRiskCheck({
    reportId: "backfire-report-63e-safe",
    counterArgumentCandidate: safeCandidate,
    reasoningContext,
    auditRef: "audit-backfire-63e-safe",
  });

  const paragraphs = generateDraftParagraphsFromCandidate({
    counterArgumentCandidate: safeCandidate,
    backfireRiskReport: report,
    reasoningContext,
    auditRef: "audit-paragraph-63e-1",
  });

  return paragraphs[0]!;
}

describe("Phase 63-E Lawyer Review & Adoption Gate", () => {
  it("exposes lawyer review adoption boundary markers", () => {
    expect(PHASE63E_BOUNDARY_MARKERS).toContain("NO_ADOPTION_WITHOUT_LAWYER_DECISION");
    expect(PHASE63E_BOUNDARY_MARKERS).toContain("NO_REJECTED_PARAGRAPH_DOCUMENT_INSERT");
    expect(PHASE63E_BOUNDARY_MARKERS).toHaveLength(10);
  });

  it("locks lawyer review adoption SSOT", () => {
    expect(PHASE63E_LAWYER_REVIEW_ADOPTION_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE63E_LAWYER_REVIEW_ADOPTION_EVIDENCE_TAG).toContain("PHASE63E");
    expect(PHASE63E_LAWYER_REVIEW_ADOPTION_LOCK.controlTowerBrainVerify).toBe(
      "verify:aibeopchin-control-tower-brain-rc",
    );
  });

  it("blocks adoption without lawyer decision context", () => {
    const gate = evaluateDraftParagraphForLawyerReview(undefined);
    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("NO_ADOPTION_WITHOUT_LAWYER_DECISION");

    expect(() =>
      adoptDraftParagraph({
        draftParagraph: buildDraftParagraph(),
        lawyerReviewerId: "   ",
        decisionLedgerRef: "ledger-63e-1",
        auditRef: "audit-adopt-63e-1",
      }),
    ).toThrow("NO_ADOPTION_WITHOUT_LAWYER_DECISION");
  });

  it("creates document insert candidate on ADOPT using original draft text", () => {
    const draftParagraph = buildDraftParagraph();
    const result = adoptDraftParagraph({
      draftParagraph,
      lawyerReviewerId: "lawyer-63e-1",
      decisionLedgerRef: "ledger-63e-adopt",
      auditRef: "audit-adopt-63e-1",
      insertTarget: "ANSWER",
    });

    expect(result.decision.decision).toBe("ADOPT");
    expect(result.documentInsertCandidate).not.toBeNull();
    expect(result.documentInsertCandidate!.paragraphText).toBe(draftParagraph.draftText);
    expect(result.documentInsertCandidate!.insertStatus).toBe("DOCUMENT_INSERT_CANDIDATE");
  });

  it("blocks MODIFY without modifiedText", () => {
    expect(() =>
      modifyDraftParagraph({
        draftParagraph: buildDraftParagraph(),
        lawyerReviewerId: "lawyer-63e-1",
        modifiedText: "   ",
        decisionLedgerRef: "ledger-63e-modify",
        auditRef: "audit-modify-63e-1",
      }),
    ).toThrow("NO_MODIFIED_PARAGRAPH_WITHOUT_MODIFIED_TEXT");
  });

  it("creates document insert candidate on MODIFY using modifiedText only", () => {
    const draftParagraph = buildDraftParagraph();
    const modifiedText = "[변호사 수정] 계약 성립 사실관계를 중심으로 반박 방향을 검토합니다.";

    const result = modifyDraftParagraph({
      draftParagraph,
      lawyerReviewerId: "lawyer-63e-1",
      modifiedText,
      decisionLedgerRef: "ledger-63e-modify",
      auditRef: "audit-modify-63e-1",
      insertTarget: "PREPARATORY_BRIEF",
    });

    expect(result.decision.decision).toBe("MODIFY");
    expect(result.documentInsertCandidate).not.toBeNull();
    expect(result.documentInsertCandidate!.paragraphText).toBe(modifiedText);
    expect(result.documentInsertCandidate!.paragraphText).not.toBe(draftParagraph.draftText);
    expect(result.documentInsertCandidate!.insertTarget).toBe("PREPARATORY_BRIEF");
  });

  it("blocks document insert candidate on REJECT", () => {
    const result = rejectDraftParagraph({
      draftParagraph: buildDraftParagraph(),
      lawyerReviewerId: "lawyer-63e-1",
      rejectionReason: "반박 방향 재검토 필요",
      decisionLedgerRef: "ledger-63e-reject",
      auditRef: "audit-reject-63e-1",
    });

    expect(result.decision.decision).toBe("REJECT");
    expect(result.documentInsertCandidate).toBeNull();
  });

  it("blocks adoption without decisionLedgerRef", () => {
    expect(() =>
      adoptDraftParagraph({
        draftParagraph: buildDraftParagraph(),
        lawyerReviewerId: "lawyer-63e-1",
        decisionLedgerRef: "",
        auditRef: "audit-adopt-63e-1",
      }),
    ).toThrow("LAWYER_DECISION_LEDGER_REQUIRED");
  });

  it("blocks adoption without auditRef", () => {
    expect(() =>
      adoptDraftParagraph({
        draftParagraph: buildDraftParagraph(),
        lawyerReviewerId: "lawyer-63e-1",
        decisionLedgerRef: "ledger-63e-1",
        auditRef: "",
      }),
    ).toThrow("ADOPTION_AUDIT_REQUIRED");
  });

  it("keeps insert candidate gates fixed to false defaults", () => {
    const result = adoptDraftParagraph({
      draftParagraph: buildDraftParagraph(),
      lawyerReviewerId: "lawyer-63e-1",
      decisionLedgerRef: "ledger-63e-gates",
      auditRef: "audit-gates-63e-1",
    });

    const candidate = counterArgumentDocumentInsertCandidateSchema.parse(
      result.documentInsertCandidate,
    );
    expect(candidate.isFinalDocumentText).toBe(false);
    expect(candidate.clientVisibleAllowed).toBe(false);
    expect(candidate.autoFileAllowed).toBe(false);
    expect(evaluateDocumentInsertCandidateForClientVisibility(candidate).allowed).toBe(false);
    expect(evaluateDocumentInsertCandidateForAutoFile(candidate).allowed).toBe(false);
  });

  it("processes lawyer adoption review through service entrypoint", () => {
    const result = processLawyerAdoptionReview({
      action: "ADOPT",
      draftParagraph: buildDraftParagraph(),
      lawyerReviewerId: "lawyer-63e-1",
      decisionLedgerRef: "ledger-63e-service",
      auditRef: "audit-service-63e-1",
    });

    const summary = summarizeAdoptionReviewResult(result);
    expect(summary.hasDocumentInsertCandidate).toBe(true);
    expect(summary.isFinalDocumentText).toBe(false);
    expect(summary.clientVisibleAllowed).toBe(false);
    expect(summary.autoFileAllowed).toBe(false);
  });
});
