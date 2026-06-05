import { describe, expect, it } from "vitest";
import { buildGongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.builder";
import { gongbuhoMemoryPacketSchema } from "@/features/gongbuho-intelligence-layer/phase59a-gongbuho-memory-packet.schema";
import { buildStrategyCandidate } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.policy";
import {
  assertEvidenceGapAutoPlannerRcGateAllowed,
  evaluateEvidenceGapAutoPlannerRcGate,
  evaluateEvidenceGapPlannerClientPayloadForRc,
  PHASE62F_CONSOLIDATED_RC_BOUNDARY_MARKERS,
  PHASE62F_RC_GATE_BOUNDARY_MARKERS,
} from "./phase62f-evidence-gap-auto-planner-rc.policy";
import {
  PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_BUNDLED_VERIFY_SCRIPTS,
  PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_EVIDENCE_TAG,
  PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_LOCK,
  PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_MASTER_VERIFY_SCRIPT,
  PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_VERSION,
} from "./phase62f-evidence-gap-auto-planner-rc.lock";
import {
  PHASE62A_EVIDENCE_GAP_CANDIDATE_LOCK,
  PHASE62A_EVIDENCE_GAP_CANDIDATE_LOCK_MARKER,
} from "./phase62a-evidence-gap-candidate.lock";
import {
  PHASE62B_EVIDENCE_GAP_DETECTION_LOCK,
  PHASE62B_EVIDENCE_GAP_DETECTION_LOCK_MARKER,
} from "./phase62b-evidence-gap-detection-engine.lock";
import {
  PHASE62C_SUPPLEMENT_REQUEST_DRAFT_LOCK,
  PHASE62C_SUPPLEMENT_REQUEST_DRAFT_LOCK_MARKER,
} from "./phase62c-supplement-request-draft.lock";
import {
  PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_LOCK,
  PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_LOCK_MARKER,
} from "./phase62d-lawyer-approval-portal-sync.lock";
import {
  PHASE62E_CLIENT_SEND_GATE_LOCK,
  PHASE62E_CLIENT_SEND_GATE_LOCK_MARKER,
} from "./phase62e-client-send-gate.lock";
import { buildEvidenceGapCandidate } from "./phase62a-evidence-gap-candidate.policy";
import { buildEvidenceGapDetectionReport } from "./phase62b-evidence-gap-detection-engine.service";
import { generateSupplementRequestDraftFromDetectionReport } from "./phase62c-supplement-request-draft.service";
import {
  approveSupplementRequestDraftForPortalSync,
  syncApprovedSupplementDraftToClientPortal,
} from "./phase62d-lawyer-approval-portal-sync.policy";
import {
  approvePortalDraftForClientVisibility,
  enableNotificationWithMessagePolicy,
  enableSupplementRequestSendGate,
  linkSupplementRequestToLitigationOpsDraft,
} from "./phase62e-client-send-gate.policy";

const allLockedInput = {
  phase62aCandidateLocked: true,
  phase62bDetectionLocked: true,
  phase62cDraftLocked: true,
  phase62dPortalSyncLocked: true,
  phase62eSendGateLocked: true,
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

function buildFullWorkflowBundle() {
  const memoryPacket = gongbuhoMemoryPacketSchema.parse({
    packetId: "gmp-rc-1",
    caseId: "case-rc-1",
    tenantId: "tenant-rc-1",
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
    caseId: "case-rc-1",
    tenantId: "tenant-rc-1",
    purpose: "STRONG_REASONING",
    memoryPacket,
    realTimeSignals: [],
    auditRef: "audit-reasoning-rc-1",
  });

  const strategyCandidate = buildStrategyCandidate({
    candidateId: "sc-gap-rc-1",
    caseId: "case-rc-1",
    tenantId: "tenant-rc-1",
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
        traceId: "st-rc-1",
        sourceKind: "GONGBUHO_REASONING_CONTEXT",
        sourceRef: "claim-1",
        reasoningContextAuditRef: reasoningContext.auditRef,
        capturedAt: "2026-05-26T12:00:00.000Z",
      },
    ],
    auditRef: "audit-strategy-rc-1",
  });

  const detectionReport = buildEvidenceGapDetectionReport({
    reportId: "report-rc-1",
    caseId: "case-rc-1",
    tenantId: "tenant-rc-1",
    reasoningContext,
    strategyCandidates: [strategyCandidate],
    auditRef: "audit-detect-rc-1",
  });

  const draft = generateSupplementRequestDraftFromDetectionReport({
    detectionReport,
    auditRef: "audit-draft-rc-1",
    draftId: "draft-rc-1",
  });

  const review = approveSupplementRequestDraftForPortalSync({
    draft,
    lawyerId: "lawyer-rc-1",
    auditRef: "audit-decision-rc-1",
    ledgerEntryId: "ledger-portal-rc-1",
  });

  const sync = syncApprovedSupplementDraftToClientPortal({
    draft: review.draft,
    ledgerEntry: review.ledgerEntry,
    auditRef: "audit-sync-rc-1",
    syncId: "sync-rc-1",
  });

  const approved = approvePortalDraftForClientVisibility({
    portalSync: sync,
    portalReviewLedgerEntry: review.ledgerEntry,
    lawyerId: "lawyer-rc-1",
    auditRef: "audit-final-rc-1",
    finalLedgerEntryId: "ledger-final-rc-1",
    payloadId: "payload-rc-1",
  });

  return {
    reasoningContext,
    strategyCandidate,
    detectionReport,
    draft,
    review,
    sync,
    approved,
  };
}

describe("Phase 62-F Evidence Gap Auto Planner RC", () => {
  it("exposes consolidated RC boundaries", () => {
    expect(PHASE62F_CONSOLIDATED_RC_BOUNDARY_MARKERS).toContain(
      "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
    );
    expect(PHASE62F_CONSOLIDATED_RC_BOUNDARY_MARKERS).toContain(
      "NO_AUTO_SUPPLEMENT_REQUEST_FROM_DETECTION",
    );
    expect(PHASE62F_CONSOLIDATED_RC_BOUNDARY_MARKERS).toContain(
      "EVIDENCE_GAP_AUTO_PLANNER_MASTER_VERIFY_REQUIRED",
    );
    expect(PHASE62F_CONSOLIDATED_RC_BOUNDARY_MARKERS).toHaveLength(16);
  });

  it("requires all 62-A~62-E lock markers before RC", () => {
    expect(PHASE62A_EVIDENCE_GAP_CANDIDATE_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE62A_EVIDENCE_GAP_CANDIDATE_LOCK.marker).toBe(
      PHASE62A_EVIDENCE_GAP_CANDIDATE_LOCK_MARKER,
    );
    expect(PHASE62B_EVIDENCE_GAP_DETECTION_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE62B_EVIDENCE_GAP_DETECTION_LOCK.marker).toBe(
      PHASE62B_EVIDENCE_GAP_DETECTION_LOCK_MARKER,
    );
    expect(PHASE62C_SUPPLEMENT_REQUEST_DRAFT_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE62C_SUPPLEMENT_REQUEST_DRAFT_LOCK.marker).toBe(
      PHASE62C_SUPPLEMENT_REQUEST_DRAFT_LOCK_MARKER,
    );
    expect(PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_LOCK.marker).toBe(
      PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_LOCK_MARKER,
    );
    expect(PHASE62E_CLIENT_SEND_GATE_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE62E_CLIENT_SEND_GATE_LOCK.marker).toBe(PHASE62E_CLIENT_SEND_GATE_LOCK_MARKER);
  });

  it("blocks RC without 62-E send gate lock", () => {
    expect(() =>
      assertEvidenceGapAutoPlannerRcGateAllowed({
        ...allLockedInput,
        phase62eSendGateLocked: false,
      }),
    ).toThrow("NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62E_SEND_GATE_LOCK");
  });

  it("blocks RC without Control Tower Brain RC", () => {
    const result = evaluateEvidenceGapAutoPlannerRcGate({
      ...allLockedInput,
      controlTowerBrainRcLocked: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_CONTROL_TOWER_BRAIN_RC");
  });

  it("blocks RC without master verify", () => {
    const result = evaluateEvidenceGapAutoPlannerRcGate({
      ...allLockedInput,
      masterVerifyPassed: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_MASTER_VERIFY");
  });

  it("locks RC SSOT with bundled verify scripts", () => {
    expect(PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_VERSION).toBe("62-F.1");
    expect(PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-evidence-gap-auto-planner-rc",
    );
    expect(PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_BUNDLED_VERIFY_SCRIPTS).toHaveLength(6);
    expect(PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_BUNDLED_VERIFY_SCRIPTS[0]).toBe(
      "verify:aibeopchin-control-tower-brain-rc",
    );
    expect(PHASE62F_RC_GATE_BOUNDARY_MARKERS).toHaveLength(8);
    expect(PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_EVIDENCE_TAG).toContain("PHASE62F");
    expect(PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_LOCK.platformStatus).toBe(
      "EVIDENCE_GAP_AUTO_PLANNER_RC_LOCKED",
    );
  });

  it("blocks EvidenceGapCandidate without sourceTrace", () => {
    const { reasoningContext, strategyCandidate } = buildFullWorkflowBundle();

    expect(() =>
      buildEvidenceGapCandidate({
        candidateId: "gap-no-trace",
        caseId: "case-rc-1",
        tenantId: "tenant-rc-1",
        reasoningContext,
        strategyCandidate,
        sourceTrace: [],
        auditRef: "audit-gap-no-trace",
      }),
    ).toThrow("NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE");
  });

  it("keeps DetectionReport non-client-visible with auto task and filing blocked", () => {
    const { detectionReport } = buildFullWorkflowBundle();

    expect(detectionReport.clientVisible).toBe(false);
    expect(detectionReport.autoTaskCreationAllowed).toBe(false);
    expect(detectionReport.autoFilingAllowed).toBe(false);
  });

  it("keeps SupplementRequestDraft non-visible and non-sendable", () => {
    const { draft } = buildFullWorkflowBundle();

    expect(draft.clientVisible).toBe(false);
    expect(draft.sendAllowed).toBe(false);
  });

  it("allows portal sync only for lawyer-approved draft and keeps send/notification blocked", () => {
    const { review, sync } = buildFullWorkflowBundle();

    expect(review.draft.reviewStatus).toBe("LAWYER_APPROVED");
    expect(sync.reviewStatus).toBe("LAWYER_APPROVED");
    expect(sync.sendAllowed).toBe(false);
    expect(sync.notificationAllowed).toBe(false);
    expect(sync.autoTaskExecutionAllowed).toBe(false);
  });

  it("allows client-visible only after final lawyer approval with gated send and notification", () => {
    const { approved } = buildFullWorkflowBundle();

    expect(approved.payload.clientVisible).toBe(true);
    expect(approved.payload.sendAllowed).toBe(false);
    expect(approved.payload.notificationAllowed).toBe(false);

    const sendGate = enableSupplementRequestSendGate({
      payload: approved.payload,
      finalLawyerApprovalLedgerEntry: approved.finalLawyerApprovalLedgerEntry,
      lawyerId: "lawyer-rc-1",
      auditRef: "audit-send-gate-rc-1",
    });

    expect(sendGate.payload.sendAllowed).toBe(true);
    expect(sendGate.payload.notificationAllowed).toBe(false);

    const withNotification = enableNotificationWithMessagePolicy({
      payload: sendGate.payload,
      messagePolicyGateRef: "phase20-client-messaging-policy:case-rc-1",
      auditRef: "audit-notification-rc-1",
    });

    expect(withNotification.notificationAllowed).toBe(true);
  });

  it("links Litigation Ops as DRAFT_LINKED only with auto execution blocked", () => {
    const { approved } = buildFullWorkflowBundle();

    const link = linkSupplementRequestToLitigationOpsDraft({
      payload: approved.payload,
      auditRef: "audit-litigation-rc-1",
      linkId: "link-rc-1",
    });

    expect(link.linkStatus).toBe("DRAFT_LINKED");
    expect(link.autoTaskExecutionAllowed).toBe(false);
  });

  it("blocks internal strategy wording in client payload for RC", () => {
    const leak = evaluateEvidenceGapPlannerClientPayloadForRc(
      "내부 전략 약점 보완 자료를 요청합니다.",
    );
    expect(leak.allowed).toBe(false);
    expect(leak.blockedBy).toBe("NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT");
  });

  it("allows RC only when all sub-phase locks and master verify pass", () => {
    const result = evaluateEvidenceGapAutoPlannerRcGate(allLockedInput);
    expect(result.allowed).toBe(true);
  });
});
