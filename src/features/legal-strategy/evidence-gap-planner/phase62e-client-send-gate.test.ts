import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import { gongbuhoMemoryPacketSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { buildStrategyCandidate } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.policy";
import { buildEvidenceGapDetectionReport } from "./phase62b-evidence-gap-detection-engine.service";
import { generateSupplementRequestDraftFromDetectionReport } from "./phase62c-supplement-request-draft.service";
import {
  approveSupplementRequestDraftForPortalSync,
  syncApprovedSupplementDraftToClientPortal,
} from "./phase62d-lawyer-approval-portal-sync.policy";
import type { ClientPortalSupplementDraftSync } from "./phase62d-lawyer-approval-portal-sync.schema";
import {
  approvePortalDraftForClientVisibility,
  assertClientVisibleSendGateAllowed,
  buildClientVisibleSupplementRequestPayload,
  canSendViaMessagingChannel,
  enableNotificationWithMessagePolicy,
  enableSupplementRequestSendGate,
  evaluateClientVisiblePayloadMessage,
  evaluatePortalSyncForClientVisibility,
  linkSupplementRequestToLitigationOpsDraft,
  PHASE62E_BOUNDARY_MARKERS,
} from "./phase62e-client-send-gate.policy";
import {
  PHASE62E_CLIENT_SEND_GATE_EVIDENCE_TAG,
  PHASE62E_CLIENT_SEND_GATE_LOCK,
} from "./phase62e-client-send-gate.lock";
import { clientVisibleSupplementRequestPayloadSchema } from "./phase62e-client-send-gate.schema";

const baseTrace = {
  traceId: "trace-base",
  sourceKind: "CASE_INTERVIEW" as const,
  sourceRef: "interview:1",
  capturedAt: "2026-05-26T10:00:00.000Z",
};

function buildPortalSyncBundle() {
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
    reportId: "report-62e-1",
    caseId: "case-1",
    tenantId: "tenant-1",
    reasoningContext,
    strategyCandidates: [strategyCandidate],
    auditRef: "audit-detect-62e-1",
  });

  const draft = generateSupplementRequestDraftFromDetectionReport({
    detectionReport,
    auditRef: "audit-draft-62e-1",
    draftId: "draft-62e-1",
  });

  const review = approveSupplementRequestDraftForPortalSync({
    draft,
    lawyerId: "lawyer-1",
    auditRef: "audit-decision-62e-1",
    ledgerEntryId: "ledger-portal-1",
  });

  const sync = syncApprovedSupplementDraftToClientPortal({
    draft: review.draft,
    ledgerEntry: review.ledgerEntry,
    auditRef: "audit-sync-62e-1",
    syncId: "sync-62e-1",
  });

  return { draft, review, sync };
}

describe("Phase 62-E Client-visible Send Gate & Litigation Ops Draft Link", () => {
  it("exposes client send gate boundary markers", () => {
    expect(PHASE62E_BOUNDARY_MARKERS).toContain("NO_CLIENT_VISIBLE_WITHOUT_FINAL_LAWYER_APPROVAL");
    expect(PHASE62E_BOUNDARY_MARKERS).toContain("NO_AUTO_LITIGATION_TASK_EXECUTION");
    expect(PHASE62E_BOUNDARY_MARKERS).toHaveLength(9);
  });

  it("locks client send gate SSOT", () => {
    expect(PHASE62E_CLIENT_SEND_GATE_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE62E_CLIENT_SEND_GATE_EVIDENCE_TAG).toContain("PHASE62E");
    expect(PHASE62E_CLIENT_SEND_GATE_LOCK.litigationOpsLinkStatus).toBe("DRAFT_LINKED");
  });

  it("blocks client-visible transition without portal-approved review status", () => {
    const { review, sync } = buildPortalSyncBundle();
    const unapprovedSync = {
      ...sync,
      reviewStatus: "LAWYER_REVIEW_REQUIRED",
    } as ClientPortalSupplementDraftSync;

    expect(() =>
      approvePortalDraftForClientVisibility({
        portalSync: unapprovedSync,
        portalReviewLedgerEntry: review.ledgerEntry,
        lawyerId: "lawyer-1",
        auditRef: "audit-final-blocked",
      }),
    ).toThrow("NO_UNAPPROVED_DRAFT_TO_CLIENT_PORTAL");
  });

  it("requires final lawyer approval before sendAllowed can become true", () => {
    const { review, sync } = buildPortalSyncBundle();
    const approved = approvePortalDraftForClientVisibility({
      portalSync: sync,
      portalReviewLedgerEntry: review.ledgerEntry,
      lawyerId: "lawyer-1",
      auditRef: "audit-final-1",
      finalLedgerEntryId: "ledger-final-1",
      payloadId: "payload-1",
    });

    expect(approved.payload.clientVisible).toBe(true);
    expect(approved.payload.sendAllowed).toBe(false);

    const sendGate = enableSupplementRequestSendGate({
      payload: approved.payload,
      finalLawyerApprovalLedgerEntry: approved.finalLawyerApprovalLedgerEntry,
      lawyerId: "lawyer-1",
      auditRef: "audit-send-gate-1",
      sendGateLedgerEntryId: "ledger-send-gate-1",
    });

    expect(sendGate.payload.sendAllowed).toBe(true);
    expect(sendGate.payload.notificationAllowed).toBe(false);
  });

  it("requires message policy gate before notificationAllowed becomes true", () => {
    const { review, sync } = buildPortalSyncBundle();
    const approved = approvePortalDraftForClientVisibility({
      portalSync: sync,
      portalReviewLedgerEntry: review.ledgerEntry,
      lawyerId: "lawyer-1",
      auditRef: "audit-final-2",
      finalLedgerEntryId: "ledger-final-2",
      payloadId: "payload-2",
    });

    const sendGate = enableSupplementRequestSendGate({
      payload: approved.payload,
      finalLawyerApprovalLedgerEntry: approved.finalLawyerApprovalLedgerEntry,
      lawyerId: "lawyer-1",
      auditRef: "audit-send-gate-2",
    });

    expect(() =>
      enableNotificationWithMessagePolicy({
        payload: sendGate.payload,
        messagePolicyGateRef: "",
        auditRef: "audit-notification-1",
      }),
    ).toThrow("NO_NOTIFICATION_WITHOUT_MESSAGE_POLICY");

    const withNotification = enableNotificationWithMessagePolicy({
      payload: sendGate.payload,
      messagePolicyGateRef: "phase20-client-messaging-policy:case-1",
      auditRef: "audit-notification-2",
    });

    expect(withNotification.notificationAllowed).toBe(true);
  });

  it("blocks internal strategy wording in client-visible payload", () => {
    const leak = evaluateClientVisiblePayloadMessage("의뢰인 약점 보완 자료를 요청합니다.");
    expect(leak.allowed).toBe(false);
    expect(leak.blockedBy).toBe("NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT");
  });

  it("links Litigation Ops task as DRAFT_LINKED only with auto execution blocked", () => {
    const { review, sync } = buildPortalSyncBundle();
    const approved = approvePortalDraftForClientVisibility({
      portalSync: sync,
      portalReviewLedgerEntry: review.ledgerEntry,
      lawyerId: "lawyer-1",
      auditRef: "audit-final-3",
      finalLedgerEntryId: "ledger-final-3",
      payloadId: "payload-3",
    });

    const link = linkSupplementRequestToLitigationOpsDraft({
      payload: approved.payload,
      auditRef: "audit-litigation-ops-1",
      linkId: "link-1",
    });

    expect(link.linkStatus).toBe("DRAFT_LINKED");
    expect(link.autoTaskExecutionAllowed).toBe(false);
    expect(approved.payload.autoTaskExecutionAllowed).toBe(false);
  });

  it("blocks messaging send before send gate and message policy", () => {
    const { review, sync } = buildPortalSyncBundle();
    const approved = approvePortalDraftForClientVisibility({
      portalSync: sync,
      portalReviewLedgerEntry: review.ledgerEntry,
      lawyerId: "lawyer-1",
      auditRef: "audit-final-4",
      finalLedgerEntryId: "ledger-final-4",
      payloadId: "payload-4",
    });

    const beforeSendGate = canSendViaMessagingChannel({
      payload: approved.payload,
      channel: "KAKAO",
    });
    expect(beforeSendGate.allowed).toBe(false);
    expect(beforeSendGate.blockedBy).toBe("NO_SEND_WITHOUT_SEND_GATE");
  });

  it("blocks client-visible transition without decision ledger", () => {
    const { sync } = buildPortalSyncBundle();

    const gate = evaluatePortalSyncForClientVisibility({
      portalSync: sync,
    });

    expect(gate.allowed).toBe(false);
    expect(gate.blockedBy).toBe("LAWYER_DECISION_LEDGER_REQUIRED");
  });

  it("blocks send gate without auditRef", () => {
    const { review, sync } = buildPortalSyncBundle();
    const approved = approvePortalDraftForClientVisibility({
      portalSync: sync,
      portalReviewLedgerEntry: review.ledgerEntry,
      lawyerId: "lawyer-1",
      auditRef: "audit-final-5",
      finalLedgerEntryId: "ledger-final-5",
      payloadId: "payload-5",
    });

    expect(() =>
      enableSupplementRequestSendGate({
        payload: approved.payload,
        finalLawyerApprovalLedgerEntry: approved.finalLawyerApprovalLedgerEntry,
        lawyerId: "lawyer-1",
        auditRef: "",
      }),
    ).toThrow("CLIENT_VISIBLE_PAYLOAD_AUDIT_REQUIRED");
  });

  it("builds client-visible payload schema with fixed auto task execution gate", () => {
    const { review, sync } = buildPortalSyncBundle();
    const approved = approvePortalDraftForClientVisibility({
      portalSync: sync,
      portalReviewLedgerEntry: review.ledgerEntry,
      lawyerId: "lawyer-1",
      auditRef: "audit-final-6",
      finalLedgerEntryId: "ledger-final-6",
      payloadId: "payload-6",
    });

    const parsed = clientVisibleSupplementRequestPayloadSchema.parse(approved.payload);
    expect(parsed.autoTaskExecutionAllowed).toBe(false);

    assertClientVisibleSendGateAllowed({
      payload: parsed,
      finalLawyerApprovalLedgerEntry: approved.finalLawyerApprovalLedgerEntry,
    });
  });

  it("supports LAWYER_MODIFIED portal sync for client visibility", () => {
    const { review, sync } = buildPortalSyncBundle();
    const modifiedSync = { ...sync, reviewStatus: "LAWYER_MODIFIED" as const };

    const approved = approvePortalDraftForClientVisibility({
      portalSync: modifiedSync,
      portalReviewLedgerEntry: review.ledgerEntry,
      lawyerId: "lawyer-1",
      auditRef: "audit-final-modified",
      finalLedgerEntryId: "ledger-final-modified",
      payloadId: "payload-modified",
    });

    const payload = buildClientVisibleSupplementRequestPayload({
      portalSync: modifiedSync,
      finalLawyerApprovalLedgerEntry: approved.finalLawyerApprovalLedgerEntry,
      auditRef: "audit-final-modified",
      payloadId: "payload-modified",
      clientVisible: true,
    });

    expect(payload.clientVisible).toBe(true);
  });
});
