import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import { gongbuhoMemoryPacketSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { buildStrategyCandidate } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.policy";
import { buildEvidenceGapDetectionReport } from "./phase62b-evidence-gap-detection-engine.service";
import { generateSupplementRequestDraftFromDetectionReport } from "./phase62c-supplement-request-draft.service";
import type { SupplementRequestDraft } from "./phase62c-supplement-request-draft.schema";
import {
  approveSupplementRequestDraftForPortalSync,
  evaluatePortalDraftMessage,
  evaluatePortalDraftSyncAllowed,
  modifySupplementRequestDraftForPortalSync,
  rejectSupplementRequestDraft,
  syncApprovedSupplementDraftToClientPortal,
  PHASE62D_BOUNDARY_MARKERS,
} from "./phase62d-lawyer-approval-portal-sync.policy";
import {
  PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_EVIDENCE_TAG,
  PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_LOCK,
} from "./phase62d-lawyer-approval-portal-sync.lock";
import { clientPortalSupplementDraftSyncSchema } from "./phase62d-lawyer-approval-portal-sync.schema";

const baseTrace = {
  traceId: "trace-base",
  sourceKind: "CASE_INTERVIEW" as const,
  sourceRef: "interview:1",
  capturedAt: "2026-05-26T10:00:00.000Z",
};

function buildSupplementDraft(): SupplementRequestDraft {
  const memoryPacket = gongbuhoMemoryPacketSchema.parse({
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

  const reasoningContext = buildGongbuhoReasoningContextBundle({
    caseId: "case-1",
    tenantId: "tenant-1",
    purpose: "STRONG_REASONING",
    memoryPacket,
    realTimeSignals: [],
    auditRef: "audit-reasoning-1",
  });

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

  const detectionReport = buildEvidenceGapDetectionReport({
    reportId: "report-62d-1",
    caseId: "case-1",
    tenantId: "tenant-1",
    reasoningContext,
    strategyCandidates: [strategyCandidate],
    auditRef: "audit-detect-62d-1",
  });

  return generateSupplementRequestDraftFromDetectionReport({
    detectionReport,
    auditRef: "audit-draft-62d-1",
    draftId: "draft-62d-1",
  });
}

describe("Phase 62-D Lawyer Approval & Portal Draft Sync", () => {
  it("exposes portal sync boundary markers", () => {
    expect(PHASE62D_BOUNDARY_MARKERS).toContain("NO_PORTAL_SYNC_WITHOUT_LAWYER_APPROVAL");
    expect(PHASE62D_BOUNDARY_MARKERS).toContain("LAWYER_DECISION_LEDGER_REQUIRED");
    expect(PHASE62D_BOUNDARY_MARKERS).toHaveLength(9);
  });

  it("locks lawyer approval portal sync SSOT", () => {
    expect(PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_EVIDENCE_TAG).toContain("PHASE62D");
  });

  it("blocks portal sync for LAWYER_REVIEW_REQUIRED draft", () => {
    const draft = buildSupplementDraft();
    expect(draft.reviewStatus).toBe("LAWYER_REVIEW_REQUIRED");

    const gate = evaluatePortalDraftSyncAllowed({
      draft,
      auditRef: "audit-sync-1",
    });

    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("NO_PORTAL_SYNC_WITHOUT_LAWYER_APPROVAL");
  });

  it("syncs LAWYER_APPROVED draft to client portal draft", () => {
    const draft = buildSupplementDraft();
    const review = approveSupplementRequestDraftForPortalSync({
      draft,
      lawyerId: "lawyer-1",
      auditRef: "audit-decision-1",
      ledgerEntryId: "ledger-approve-1",
    });

    const sync = syncApprovedSupplementDraftToClientPortal({
      draft: review.draft,
      ledgerEntry: review.ledgerEntry,
      auditRef: "audit-sync-2",
      syncId: "sync-1",
    });

    const parsed = clientPortalSupplementDraftSyncSchema.parse(sync);
    expect(parsed.reviewStatus).toBe("LAWYER_APPROVED");
    expect(parsed.portalDraftItems.length).toBeGreaterThan(0);
    expect(parsed.lawyerDecisionLedgerEntryId).toBe("ledger-approve-1");
  });

  it("syncs LAWYER_MODIFIED draft using modified client-safe items only", () => {
    const draft = buildSupplementDraft();
    const modifiedItems = draft.clientSafeDraftItems.map((item) => ({
      ...item,
      clientSafeQuestionDraft: "계약서 사본을 사건 정리를 위해 제출해 주실 수 있을까요?",
    }));

    const review = modifySupplementRequestDraftForPortalSync({
      draft,
      lawyerId: "lawyer-1",
      auditRef: "audit-decision-2",
      modifiedClientSafeDraftItems: modifiedItems,
      ledgerEntryId: "ledger-modify-1",
    });

    const sync = syncApprovedSupplementDraftToClientPortal({
      draft: review.draft,
      ledgerEntry: review.ledgerEntry,
      auditRef: "audit-sync-3",
    });

    expect(sync.reviewStatus).toBe("LAWYER_MODIFIED");
    expect(sync.portalDraftItems[0]?.clientMessageDraft).toContain("계약서 사본");
  });

  it("blocks portal sync for REJECTED draft", () => {
    const draft = buildSupplementDraft();
    const review = rejectSupplementRequestDraft({
      draft,
      lawyerId: "lawyer-1",
      auditRef: "audit-decision-3",
      ledgerEntryId: "ledger-reject-1",
    });

    expect(review.draft.reviewStatus).toBe("REJECTED");

    expect(() =>
      syncApprovedSupplementDraftToClientPortal({
        draft: review.draft,
        ledgerEntry: review.ledgerEntry,
        auditRef: "audit-sync-4",
      }),
    ).toThrow("NO_PORTAL_SYNC_FROM_REJECTED_DRAFT");
  });

  it("keeps send, notification, and task execution blocked after portal sync", () => {
    const draft = buildSupplementDraft();
    const review = approveSupplementRequestDraftForPortalSync({
      draft,
      lawyerId: "lawyer-1",
      auditRef: "audit-decision-4",
      ledgerEntryId: "ledger-approve-2",
    });

    const sync = syncApprovedSupplementDraftToClientPortal({
      draft: review.draft,
      ledgerEntry: review.ledgerEntry,
      auditRef: "audit-sync-5",
    });

    expect(sync.sendAllowed).toBe(false);
    expect(sync.notificationAllowed).toBe(false);
    expect(sync.autoTaskExecutionAllowed).toBe(false);
    expect(sync.clientVisible).toBe(false);
  });

  it("blocks internal strategy wording in portal draft messages", () => {
    const leak = evaluatePortalDraftMessage("의뢰인 약점 보완을 위해 자료를 요청합니다.");
    expect(leak.allowed).toBe(false);
    expect(leak.blockedBy).toBe("NO_INTERNAL_STRATEGY_LEAK_TO_PORTAL");
  });

  it("blocks portal sync without lawyer decision ledger", () => {
    const draft = buildSupplementDraft();
    const review = approveSupplementRequestDraftForPortalSync({
      draft,
      lawyerId: "lawyer-1",
      auditRef: "audit-decision-5",
      ledgerEntryId: "ledger-approve-3",
    });

    const gate = evaluatePortalDraftSyncAllowed({
      draft: review.draft,
      auditRef: "audit-sync-6",
    });

    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("LAWYER_DECISION_LEDGER_REQUIRED");
  });

  it("blocks portal sync without auditRef", () => {
    const draft = buildSupplementDraft();
    const review = approveSupplementRequestDraftForPortalSync({
      draft,
      lawyerId: "lawyer-1",
      auditRef: "audit-decision-6",
      ledgerEntryId: "ledger-approve-4",
    });

    expect(() =>
      syncApprovedSupplementDraftToClientPortal({
        draft: review.draft,
        ledgerEntry: review.ledgerEntry,
        auditRef: "",
      }),
    ).toThrow("PORTAL_DRAFT_SYNC_AUDIT_REQUIRED");
  });
});
