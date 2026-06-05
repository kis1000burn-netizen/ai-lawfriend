import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import { gongbuhoMemoryPacketSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import {
  buildOpponentArgument,
  buildOpponentArgumentFromMemoryClaim,
  canUseOpponentArgumentForCounterArgumentBuilder,
} from "./phase63a-opponent-argument.policy";
import {
  PHASE63A_OPPONENT_ARGUMENT_LOCK,
  PHASE63A_OPPONENT_ARGUMENT_LOCK_MARKER,
} from "./phase63a-opponent-argument.lock";
import {
  buildCounterArgumentCandidate,
  evaluateCounterArgumentSourceTrace,
} from "./phase63b-counter-argument-candidate.policy";
import {
  PHASE63B_COUNTER_ARGUMENT_CANDIDATE_LOCK,
  PHASE63B_COUNTER_ARGUMENT_CANDIDATE_LOCK_MARKER,
} from "./phase63b-counter-argument-candidate.lock";
import { buildCounterArgumentCandidateFromOpponentArgument } from "./phase63b-counter-argument-candidate.service";
import {
  PHASE63C_RISK_BACKFIRE_CHECK_LOCK,
  PHASE63C_RISK_BACKFIRE_CHECK_LOCK_MARKER,
} from "./phase63c-risk-backfire-check.lock";
import { runBackfireRiskCheck } from "./phase63c-risk-backfire-check.service";
import {
  evaluateBackfireRiskReportForDraftParagraphGeneration,
  evaluateDraftParagraphGenerationGate,
} from "./phase63d-draft-paragraph-generator.policy";
import { generateDraftParagraphsFromCandidate } from "./phase63d-draft-paragraph-generator.service";
import {
  PHASE63D_DRAFT_PARAGRAPH_GENERATOR_LOCK,
  PHASE63D_DRAFT_PARAGRAPH_GENERATOR_LOCK_MARKER,
} from "./phase63d-draft-paragraph-generator.lock";
import {
  adoptDraftParagraph,
  evaluateAdoptionDecisionForDocumentInsert,
  evaluateDocumentInsertCandidateForAutoFile,
  evaluateDocumentInsertCandidateForClientVisibility,
  rejectDraftParagraph,
} from "./phase63e-lawyer-review-adoption.policy";
import {
  PHASE63E_LAWYER_REVIEW_ADOPTION_LOCK,
  PHASE63E_LAWYER_REVIEW_ADOPTION_LOCK_MARKER,
} from "./phase63e-lawyer-review-adoption.lock";
import {
  assertCounterArgumentDraftEngineRcGateAllowed,
  evaluateCounterArgumentDraftEngineRcGate,
  PHASE63F_CONSOLIDATED_RC_BOUNDARY_MARKERS,
  PHASE63F_RC_GATE_BOUNDARY_MARKERS,
} from "./phase63f-counter-argument-draft-engine-rc.policy";
import {
  PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_BUNDLED_VERIFY_SCRIPTS,
  PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_EVIDENCE_TAG,
  PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCK,
  PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_MASTER_VERIFY_SCRIPT,
  PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_VERSION,
  PHASE63F_SUB_PHASE_LOCK_MARKERS,
} from "./phase63f-counter-argument-draft-engine-rc.lock";
import { readFileSync } from "node:fs";
import path from "node:path";

const allLockedInput = {
  phase63aOpponentArgumentLocked: true,
  phase63bCandidateLocked: true,
  phase63cBackfireCheckLocked: true,
  phase63dDraftParagraphLocked: true,
  phase63eAdoptionLocked: true,
  controlTowerBrainRcLocked: true,
  evidenceChainComplete: true,
  masterVerifyPassed: true,
};

const baseTrace = {
  traceId: "trace-base",
  sourceKind: "CASE_INTERVIEW" as const,
  sourceRef: "interview:1",
  capturedAt: "2026-05-26T10:00:00.000Z",
};

function buildMemoryPacket() {
  return gongbuhoMemoryPacketSchema.parse({
    packetId: "gmp-rc-63-1",
    caseId: "case-rc-63-1",
    tenantId: "tenant-rc-63-1",
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

function buildFullWorkflowBundle() {
  const reasoningContext = buildGongbuhoReasoningContextBundle({
    caseId: "case-rc-63-1",
    tenantId: "tenant-rc-63-1",
    purpose: "STRONG_REASONING",
    memoryPacket: buildMemoryPacket(),
    realTimeSignals: [],
    auditRef: "audit-reasoning-rc-63-1",
  });
  const memoryPacket = buildMemoryPacket();

  const opponentArgument = buildOpponentArgumentFromMemoryClaim({
    opponentArgumentId: "oa-rc-63-1",
    caseId: "case-rc-63-1",
    tenantId: "tenant-rc-63-1",
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
        traceId: "oat-rc-63-1",
        sourceKind: "OPPONENT_CLAIM_MEMORY",
        sourceRef: "opp-claim-1",
        reasoningContextAuditRef: reasoningContext.auditRef,
        opponentClaimId: "opp-claim-1",
        memoryReviewStatus: "LAWYER_CONFIRMED",
        capturedAt: "2026-05-26T12:00:00.000Z",
      },
    ],
    auditRef: "audit-oa-rc-63-1",
  });

  const candidate = buildCounterArgumentCandidateFromOpponentArgument({
    opponentArgument,
    reasoningContext,
    auditRef: "audit-cac-rc-63-1",
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

  const backfireReport = runBackfireRiskCheck({
    reportId: "backfire-report-rc-63-1",
    counterArgumentCandidate: safeCandidate,
    reasoningContext,
    auditRef: "audit-backfire-rc-63-1",
  });

  const draftParagraphs = generateDraftParagraphsFromCandidate({
    counterArgumentCandidate: safeCandidate,
    backfireRiskReport: backfireReport,
    reasoningContext,
    auditRef: "audit-paragraph-rc-63-1",
  });

  const draftParagraph = draftParagraphs[0]!;

  const adoption = adoptDraftParagraph({
    draftParagraph,
    lawyerReviewerId: "lawyer-rc-63-1",
    decisionLedgerRef: "ledger-rc-63-adopt",
    auditRef: "audit-adopt-rc-63-1",
    insertTarget: "ANSWER",
  });

  return {
    reasoningContext,
    opponentArgument,
    candidate: safeCandidate,
    backfireReport,
    draftParagraph,
    adoption,
  };
}

describe("Phase 63-F Counter-Argument Draft Engine RC", () => {
  it("requires all 63-A~63-E sub-phase lock markers for RC", () => {
    expect(PHASE63F_SUB_PHASE_LOCK_MARKERS).toEqual([
      PHASE63A_OPPONENT_ARGUMENT_LOCK_MARKER,
      PHASE63B_COUNTER_ARGUMENT_CANDIDATE_LOCK_MARKER,
      PHASE63C_RISK_BACKFIRE_CHECK_LOCK_MARKER,
      PHASE63D_DRAFT_PARAGRAPH_GENERATOR_LOCK_MARKER,
      PHASE63E_LAWYER_REVIEW_ADOPTION_LOCK_MARKER,
    ]);
    expect(PHASE63A_OPPONENT_ARGUMENT_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE63B_COUNTER_ARGUMENT_CANDIDATE_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE63C_RISK_BACKFIRE_CHECK_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE63D_DRAFT_PARAGRAPH_GENERATOR_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE63E_LAWYER_REVIEW_ADOPTION_LOCK.status).toBe("COMPLETE_LOCKED");
  });

  it("blocks RC without Control Tower Brain RC lock", () => {
    const result = evaluateCounterArgumentDraftEngineRcGate({
      ...allLockedInput,
      controlTowerBrainRcLocked: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe(
      "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_CONTROL_TOWER_BRAIN_RC",
    );
  });

  it("keeps OpponentArgument from auto-confirmed state", () => {
    const { opponentArgument } = buildFullWorkflowBundle();
    expect(opponentArgument.reviewStatus).toBe("LAWYER_REVIEW_REQUIRED");
    expect(opponentArgument.isOpponentArgumentConfirmed).toBe(false);
    expect(
      canUseOpponentArgumentForCounterArgumentBuilder({
        reviewStatus: opponentArgument.reviewStatus,
        isOpponentArgumentConfirmed: opponentArgument.isOpponentArgumentConfirmed,
      }).allowed,
    ).toBe(true);
  });

  it("blocks CounterArgumentCandidate without sourceTrace", () => {
    const { reasoningContext, opponentArgument, candidate } = buildFullWorkflowBundle();

    expect(() =>
      buildCounterArgumentCandidate({
        counterArgumentCandidateId: "cac-no-trace",
        opponentArgument,
        reasoningContext,
        decomposition: candidate.decomposition,
        sourceTrace: [],
        auditRef: "audit-no-trace",
      }),
    ).toThrow("NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE");
  });

  it("blocks counter-argument from unapproved signal and AI candidate memory", () => {
    const unapprovedSignal = evaluateCounterArgumentSourceTrace({
      traceId: "trace-unapproved",
      sourceKind: "GONGBUHO_REASONING_CONTEXT",
      sourceRef: "signal-1",
      reasoningContextAuditRef: "audit-reasoning-rc-63-1",
      realTimeSignalStatus: "AI_CANDIDATE",
      capturedAt: "2026-05-26T12:00:00.000Z",
    });
    expect(unapprovedSignal.allowed).toBe(false);
    expect(unapprovedSignal.blockedBy).toBe("NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL");

    const aiMemory = evaluateCounterArgumentSourceTrace({
      traceId: "trace-ai-memory",
      sourceKind: "GONGBUHO_REASONING_CONTEXT",
      sourceRef: "memory-1",
      reasoningContextAuditRef: "audit-reasoning-rc-63-1",
      memoryReviewStatus: "AI_CANDIDATE",
      capturedAt: "2026-05-26T12:00:00.000Z",
    });
    expect(aiMemory.allowed).toBe(false);
    expect(aiMemory.blockedBy).toBe("NO_COUNTER_ARGUMENT_FROM_AI_CANDIDATE_MEMORY");
  });

  it("blocks counter-argument use without backfire check", () => {
    const { candidate, reasoningContext } = buildFullWorkflowBundle();

    const gate = evaluateDraftParagraphGenerationGate({
      counterArgumentCandidate: candidate,
      backfireRiskReport: undefined,
      reasoningContext,
    });
    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("NO_DRAFT_PARAGRAPH_WITHOUT_BACKFIRE_CHECK");
  });

  it("blocks CRITICAL risk from draft paragraph generation and document use", () => {
    const { candidate, reasoningContext } = buildFullWorkflowBundle();
    const criticalCandidate = {
      ...candidate,
      decomposition: {
        ...candidate.decomposition,
        counterDirection: "계약이 존재하지 않음을 중심으로 반박",
      },
    };

    const criticalReport = runBackfireRiskCheck({
      reportId: "backfire-report-rc-critical",
      counterArgumentCandidate: criticalCandidate,
      reasoningContext,
      auditRef: "audit-backfire-rc-critical",
    });

    expect(criticalReport.riskLevel).toBe("CRITICAL");
    expect(evaluateBackfireRiskReportForDraftParagraphGeneration(criticalReport).allowed).toBe(
      false,
    );
  });

  it("keeps draft paragraph as non-final document text", () => {
    const { draftParagraph } = buildFullWorkflowBundle();
    expect(draftParagraph.isFinalDocumentText).toBe(false);
    expect(draftParagraph.documentInsertAllowed).toBe(false);
    expect(draftParagraph.clientVisibleAllowed).toBe(false);
    expect(draftParagraph.autoFileAllowed).toBe(false);
  });

  it("promotes insert candidate only on ADOPT and blocks REJECT", () => {
    const { draftParagraph, adoption } = buildFullWorkflowBundle();

    expect(adoption.documentInsertCandidate).not.toBeNull();
    expect(evaluateAdoptionDecisionForDocumentInsert(adoption.decision).allowed).toBe(true);

    const rejected = rejectDraftParagraph({
      draftParagraph,
      lawyerReviewerId: "lawyer-rc-63-1",
      rejectionReason: "반박 방향 재검토",
      decisionLedgerRef: "ledger-rc-63-reject",
      auditRef: "audit-reject-rc-63-1",
    });

    expect(rejected.documentInsertCandidate).toBeNull();
    expect(evaluateAdoptionDecisionForDocumentInsert(rejected.decision).allowed).toBe(false);
  });

  it("keeps DocumentInsertCandidate clientVisibleAllowed and autoFileAllowed false", () => {
    const { adoption } = buildFullWorkflowBundle();
    const candidate = adoption.documentInsertCandidate!;

    expect(candidate.clientVisibleAllowed).toBe(false);
    expect(candidate.autoFileAllowed).toBe(false);
    expect(evaluateDocumentInsertCandidateForClientVisibility(candidate).allowed).toBe(false);
    expect(evaluateDocumentInsertCandidateForAutoFile(candidate).allowed).toBe(false);
  });

  it("blocks adoption without decision ledger and auditRef", () => {
    const { draftParagraph } = buildFullWorkflowBundle();

    expect(() =>
      adoptDraftParagraph({
        draftParagraph,
        lawyerReviewerId: "lawyer-rc-63-1",
        decisionLedgerRef: "",
        auditRef: "audit-adopt-rc-63-1",
      }),
    ).toThrow("LAWYER_DECISION_LEDGER_REQUIRED");

    expect(() =>
      adoptDraftParagraph({
        draftParagraph,
        lawyerReviewerId: "lawyer-rc-63-1",
        decisionLedgerRef: "ledger-rc-63-adopt",
        auditRef: "",
      }),
    ).toThrow("ADOPTION_AUDIT_REQUIRED");
  });

  it("matches bundled verify scripts with lock file and package.json", () => {
    expect(PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_BUNDLED_VERIFY_SCRIPTS).toHaveLength(6);
    expect(PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_BUNDLED_VERIFY_SCRIPTS[0]).toBe(
      "verify:aibeopchin-control-tower-brain-rc",
    );
    expect(PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-counter-argument-draft-engine-rc",
    );

    const pkg = readFileSync(path.join(process.cwd(), "package.json"), "utf8");
    for (const script of [
      ...PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_BUNDLED_VERIFY_SCRIPTS,
      PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_MASTER_VERIFY_SCRIPT,
      "verify:aibeopchin-legal-strategy-phase63f",
    ]) {
      expect(pkg.includes(script)).toBe(true);
    }
  });

  it("locks RC SSOT with consolidated boundaries and allows gate when complete", () => {
    expect(PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_VERSION).toBe("63-F.1");
    expect(PHASE63F_CONSOLIDATED_RC_BOUNDARY_MARKERS).toHaveLength(19);
    expect(PHASE63F_RC_GATE_BOUNDARY_MARKERS).toHaveLength(8);
    expect(PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_EVIDENCE_TAG).toContain("PHASE63F");
    expect(PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCK.platformStatus).toBe(
      "COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCKED",
    );

    const result = evaluateCounterArgumentDraftEngineRcGate(allLockedInput);
    expect(result.allowed).toBe(true);
    expect(() => assertCounterArgumentDraftEngineRcGateAllowed(allLockedInput)).not.toThrow();
  });

  it("blocks auto-confirmed opponent argument build", () => {
    const { reasoningContext, opponentArgument } = buildFullWorkflowBundle();

    expect(() =>
      buildOpponentArgument({
        opponentArgumentId: "oa-auto-confirm",
        caseId: opponentArgument.caseId,
        tenantId: opponentArgument.tenantId,
        documentKind: opponentArgument.documentKind,
        argumentKind: opponentArgument.argumentKind,
        title: opponentArgument.title,
        summary: opponentArgument.summary,
        statementText: opponentArgument.statementText,
        premiseFacts: opponentArgument.premiseFacts,
        legalPoints: opponentArgument.legalPoints,
        submittedEvidence: opponentArgument.submittedEvidence,
        reasoningContextAuditRef: reasoningContext.auditRef,
        reasoningContext,
        reviewStatus: "LAWYER_CONFIRMED",
        sourceTrace: opponentArgument.sourceTrace,
        inheritedMemorySourceTrace: opponentArgument.inheritedMemorySourceTrace,
        auditRef: "audit-auto-confirm",
      }),
    ).toThrow("NO_AUTO_CONFIRMED_OPPONENT_ARGUMENT");
  });
});
