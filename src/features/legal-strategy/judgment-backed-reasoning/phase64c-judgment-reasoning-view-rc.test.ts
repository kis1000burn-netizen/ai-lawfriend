import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import { gongbuhoMemoryPacketSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { strategyCandidateSchema } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";
import { buildJudgmentReasoningSourceMapFromStrategyCandidate } from "./phase64a-judgment-reasoning-source-map.policy";
import {
  PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_LOCK,
  PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_LOCK_MARKER,
} from "./phase64a-judgment-reasoning-source-map.lock";
import {
  PHASE64B_JUDGMENT_REASONING_VIEW_LOCK,
  PHASE64B_JUDGMENT_REASONING_VIEW_LOCK_MARKER,
} from "./phase64b-judgment-reasoning-view.lock";
import {
  assertJudgmentReasoningViewAllowed,
  buildJudgmentReasoningCards,
  buildJudgmentReasoningView,
  buildUncertaintyPanel,
} from "./phase64b-judgment-reasoning-view.policy";
import { composeJudgmentReasoningView } from "./phase64b-judgment-reasoning-view.service";
import {
  assertJudgmentBackedReasoningRcGateAllowed,
  evaluateJudgmentBackedReasoningRcGate,
  PHASE64C_CONSOLIDATED_RC_BOUNDARY_MARKERS,
  PHASE64C_RC_GATE_BOUNDARY_MARKERS,
} from "./phase64c-judgment-reasoning-view-rc.policy";
import {
  PHASE64C_JUDGMENT_BACKED_REASONING_SUB_PHASES,
  PHASE64C_JUDGMENT_REASONING_VIEW_RC_BUNDLED_VERIFY_SCRIPTS,
  PHASE64C_JUDGMENT_REASONING_VIEW_RC_EVIDENCE_TAG,
  PHASE64C_JUDGMENT_REASONING_VIEW_RC_LOCK,
  PHASE64C_JUDGMENT_REASONING_VIEW_RC_MASTER_VERIFY_SCRIPT,
  PHASE64C_JUDGMENT_REASONING_VIEW_RC_VERSION,
  PHASE64C_SUB_PHASE_LOCK_MARKERS,
} from "./phase64c-judgment-reasoning-view-rc.lock";
import { readFileSync } from "node:fs";
import path from "node:path";

const allLockedInput = {
  phase64aSourceMapLocked: true,
  phase64bViewBuilderLocked: true,
  controlTowerBrainRcLocked: true,
  evidenceChainComplete: true,
  masterVerifyPassed: true,
};

const baseTrace = {
  traceId: "trace-64c-base",
  sourceKind: "CASE_INTERVIEW" as const,
  sourceRef: "interview:64c",
  capturedAt: "2026-06-05T10:00:00.000Z",
};

function buildMemoryPacket() {
  return gongbuhoMemoryPacketSchema.parse({
    packetId: "gmp-64c-1",
    caseId: "case-64c-1",
    tenantId: "tenant-64c-1",
    status: "ACTIVE",
    confidenceLevel: "MEDIUM",
    reviewStatus: "LAWYER_CONFIRMED",
    confirmedFacts: [
      {
        factId: "fact-64c-1",
        label: "계약 체결",
        summary: "2024년 3월 계약서에 서명",
        reviewStatus: "LAWYER_CONFIRMED",
        linkedClaimIds: ["claim-64c-1"],
        linkedEvidenceIds: ["evidence-64c-1"],
        sourceTraceIds: ["trace-64c-base"],
      },
    ],
    disputedFacts: [],
    clientWeaknesses: [],
    opponentClaims: [],
    evidenceMap: [
      {
        linkId: "evidence-link-64c-1",
        evidenceRef: "evidence-64c-1",
        claimRef: "claim-64c-1",
        supportStrength: "STRONG",
        reviewStatus: "LAWYER_CONFIRMED",
        sourceTraceIds: ["trace-64c-base"],
      },
    ],
    judgmentLinks: [
      {
        referenceId: "judgment-64c-1",
        judgmentRef: "2023다99999",
        relevanceSummary: "계약 성립 청약·승낙 합치 요건 관련 판례",
        canonicalSourceRef: "SCOURT:2023DA99999",
        reviewStatus: "LAWYER_CONFIRMED",
        sourceTraceIds: ["trace-64c-base"],
      },
    ],
    lawyerConfirmedIssues: [],
    sourceTrace: [baseTrace],
    caseScopeOnly: true,
    tenantIsolationRequired: true,
    createdAt: "2026-06-05T10:00:00.000Z",
    updatedAt: "2026-06-05T11:00:00.000Z",
  });
}

function buildFullWorkflowBundle() {
  const reasoningContext = buildGongbuhoReasoningContextBundle({
    caseId: "case-64c-1",
    tenantId: "tenant-64c-1",
    purpose: "STRONG_REASONING",
    memoryPacket: buildMemoryPacket(),
    realTimeSignals: [],
    auditRef: "audit-reasoning-64c-1",
  });

  const candidate = strategyCandidateSchema.parse({
    marker: "phase61a-strategy-candidate-schema",
    version: "61-A.1",
    candidateId: "sc-64c-1",
    caseId: "case-64c-1",
    tenantId: "tenant-64c-1",
    candidateKind: "PRECEDENT_LINK",
    title: "판례 연결 전략 (64-C RC 통합 테스트)",
    summary: "계약 성립 관련 판례를 연결",
    rationale: "공부호 확정 사실과 판례를 연결",
    riskNotes: ["상대방이 계약 불성립을 주장할 수 있음"],
    suggestedInternalActions: ["판례 대조표 작성"],
    reviewStatus: "LAWYER_REVIEW_REQUIRED",
    reasoningContextAuditRef: reasoningContext.auditRef,
    reasoningContextBundleVersion: "59-C.1",
    reusablePatternIds: [],
    sourceTrace: [
      {
        traceId: "sct-64c-1",
        sourceKind: "GONGBUHO_REASONING_CONTEXT",
        sourceRef: reasoningContext.auditRef,
        reasoningContextAuditRef: reasoningContext.auditRef,
        capturedAt: "2026-06-05T12:00:00.000Z",
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
    auditRef: "audit-sc-64c-1",
    phase61VerifyScript: "verify:aibeopchin-legal-strategy-phase61a",
    controlTowerBrainVerifyScript: "verify:aibeopchin-control-tower-brain-rc",
    createdAt: "2026-06-05T12:00:00.000Z",
  });

  const sourceMap = buildJudgmentReasoningSourceMapFromStrategyCandidate({
    mapId: "jrs-map-64c-1",
    strategyCandidate: candidate,
    reasoningContext,
    auditRef: "audit-jrs-64c-1",
  });

  const view = composeJudgmentReasoningView({
    viewId: "jrv-64c-1",
    sourceMap,
    auditRef: "audit-jrv-64c-1",
  });

  return { reasoningContext, candidate, sourceMap, view };
}

describe("Phase 64-C Judgment-backed Reasoning View RC", () => {
  it("requires all 64-A~64-B sub-phase lock markers for RC", () => {
    expect(PHASE64C_SUB_PHASE_LOCK_MARKERS).toEqual([
      PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_LOCK_MARKER,
      PHASE64B_JUDGMENT_REASONING_VIEW_LOCK_MARKER,
    ]);
    expect(PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE64B_JUDGMENT_REASONING_VIEW_LOCK.status).toBe("COMPLETE_LOCKED");
  });

  it("blocks RC without Control Tower Brain RC lock", () => {
    const result = evaluateJudgmentBackedReasoningRcGate({
      ...allLockedInput,
      controlTowerBrainRcLocked: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe(
      "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_CONTROL_TOWER_BRAIN_RC",
    );
  });

  it("blocks RC without 64-A source map lock", () => {
    const result = evaluateJudgmentBackedReasoningRcGate({
      ...allLockedInput,
      phase64aSourceMapLocked: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe(
      "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_64A_SOURCE_MAP_LOCK",
    );
  });

  it("blocks RC without 64-B view builder lock", () => {
    const result = evaluateJudgmentBackedReasoningRcGate({
      ...allLockedInput,
      phase64bViewBuilderLocked: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe(
      "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_64B_VIEW_BUILDER_LOCK",
    );
  });

  it("blocks RC with broken evidence chain", () => {
    const result = evaluateJudgmentBackedReasoningRcGate({
      ...allLockedInput,
      evidenceChainComplete: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe(
      "NO_JUDGMENT_BACKED_REASONING_RC_WITH_BROKEN_EVIDENCE_CHAIN",
    );
  });

  it("blocks RC without master verify passed", () => {
    const result = evaluateJudgmentBackedReasoningRcGate({
      ...allLockedInput,
      masterVerifyPassed: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe(
      "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_MASTER_VERIFY",
    );
  });

  it("allows RC gate when all sub-phases are locked and evidence chain complete", () => {
    const result = evaluateJudgmentBackedReasoningRcGate(allLockedInput);
    expect(result.allowed).toBe(true);
    expect(() => assertJudgmentBackedReasoningRcGateAllowed(allLockedInput)).not.toThrow();
  });

  it("blocks reasoning view without source map (64-A boundary enforced in RC)", () => {
    expect(() => assertJudgmentReasoningViewAllowed(undefined)).toThrow(
      "NO_VIEW_WITHOUT_SOURCE_MAP",
    );
  });

  it("blocks uncertainty panel without signals (64-B boundary enforced in RC)", () => {
    expect(() => buildUncertaintyPanel({ panelId: "panel-empty", signals: [] })).toThrow(
      "UNCERTAINTY_PANEL_REQUIRED",
    );
  });

  it("end-to-end: builds lawyer-review-required view with full boundary compliance", () => {
    const { sourceMap, view } = buildFullWorkflowBundle();

    expect(view.reviewStatus).toBe("LAWYER_REVIEW_REQUIRED");
    expect(view.clientVisibleAllowed).toBe(false);
    expect(view.lawyerReviewRequiredForUse).toBe(true);
    expect(view.reasoningCards.length).toBe(sourceMap.sourceEntries.length);
    expect(view.reasoningCards.every((card) => card.hiddenSourceVisible)).toBe(true);
    expect(view.reasoningCards.every((card) => card.sourceTraceRefs.length > 0)).toBe(true);
    expect(view.uncertaintyPanel.signals.length).toBeGreaterThan(0);
  });

  it("end-to-end: buildJudgmentReasoningCards covers every source map entry", () => {
    const { sourceMap } = buildFullWorkflowBundle();
    const cards = buildJudgmentReasoningCards(sourceMap);
    expect(cards.length).toBe(sourceMap.sourceEntries.length);
  });

  it("end-to-end: buildJudgmentReasoningView is consistent with composeJudgmentReasoningView", () => {
    const { sourceMap } = buildFullWorkflowBundle();
    const view1 = buildJudgmentReasoningView({
      viewId: "jrv-64c-cmp-1",
      sourceMap,
      auditRef: "audit-cmp-64c-1",
    });
    const view2 = composeJudgmentReasoningView({
      viewId: "jrv-64c-cmp-2",
      sourceMap,
      auditRef: "audit-cmp-64c-2",
    });
    expect(view1.reasoningCards.length).toBe(view2.reasoningCards.length);
    expect(view1.clientVisibleAllowed).toBe(view2.clientVisibleAllowed);
    expect(view1.reviewStatus).toBe(view2.reviewStatus);
  });

  it("matches bundled verify scripts with lock file and package.json", () => {
    expect(PHASE64C_JUDGMENT_REASONING_VIEW_RC_BUNDLED_VERIFY_SCRIPTS).toHaveLength(3);
    expect(PHASE64C_JUDGMENT_REASONING_VIEW_RC_BUNDLED_VERIFY_SCRIPTS[0]).toBe(
      "verify:aibeopchin-control-tower-brain-rc",
    );
    expect(PHASE64C_JUDGMENT_REASONING_VIEW_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-judgment-backed-reasoning-rc",
    );

    const pkg = readFileSync(path.join(process.cwd(), "package.json"), "utf8");
    for (const script of [
      ...PHASE64C_JUDGMENT_REASONING_VIEW_RC_BUNDLED_VERIFY_SCRIPTS,
      PHASE64C_JUDGMENT_REASONING_VIEW_RC_MASTER_VERIFY_SCRIPT,
      "verify:aibeopchin-legal-strategy-phase64c",
    ]) {
      expect(pkg.includes(script)).toBe(true);
    }
  });

  it("locks RC SSOT with consolidated boundaries and sub-phases", () => {
    expect(PHASE64C_JUDGMENT_REASONING_VIEW_RC_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE64C_JUDGMENT_REASONING_VIEW_RC_VERSION).toBe("64-C.1");
    expect(PHASE64C_CONSOLIDATED_RC_BOUNDARY_MARKERS).toHaveLength(15);
    expect(PHASE64C_RC_GATE_BOUNDARY_MARKERS).toHaveLength(5);
    expect(PHASE64C_JUDGMENT_REASONING_VIEW_RC_EVIDENCE_TAG).toContain("PHASE64C");
    expect(PHASE64C_JUDGMENT_REASONING_VIEW_RC_LOCK.platformStatus).toBe(
      "JUDGMENT_BACKED_REASONING_RC_LOCKED",
    );
    expect(PHASE64C_JUDGMENT_BACKED_REASONING_SUB_PHASES["64-A"]).toBe(
      "Judgment Reasoning Source Map Schema",
    );
    expect(PHASE64C_JUDGMENT_BACKED_REASONING_SUB_PHASES["64-B"]).toBe(
      "Judgment Reasoning View Builder",
    );
    expect(PHASE64C_JUDGMENT_BACKED_REASONING_SUB_PHASES["64-C"]).toBe(
      "Judgment-backed Reasoning View RC",
    );
  });
});
