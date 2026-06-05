/**
 * Product Phase 62-E — Client-visible Send Gate & Litigation Ops Draft Link policy SSOT.
 */
import { randomUUID } from "node:crypto";
import { ValidationError } from "@/lib/errors";
import { INTERNAL_STRATEGY_LEAK_PATTERNS } from "./phase62c-supplement-request-draft.policy";
import type {
  ApprovePortalDraftForClientVisibilityInput,
  ClientVisibleSupplementRequestPayload,
  EnableNotificationWithMessagePolicyInput,
  EnableSupplementRequestSendGateInput,
  FinalLawyerApprovalLedgerEntry,
  LinkSupplementRequestToLitigationOpsDraftInput,
  LitigationOpsDraftLink,
  SupplementRequestSendGateLedgerEntry,
} from "./phase62e-client-send-gate.schema";
import {
  PHASE62E_CLIENT_SEND_GATE_SCHEMA_MARKER,
  PHASE62E_CLIENT_SEND_GATE_VERSION,
  clientVisibleSendGateBoundariesSchema,
  clientVisibleSupplementRequestPayloadSchema,
  finalLawyerApprovalLedgerEntrySchema,
  litigationOpsDraftLinkSchema,
  supplementRequestSendGateLedgerEntrySchema,
} from "./phase62e-client-send-gate.schema";
import type { ClientPortalSupplementDraftSync } from "./phase62d-lawyer-approval-portal-sync.schema";

export const PHASE62E_CLIENT_SEND_GATE_POLICY_MARKER =
  "phase62e-client-send-gate-policy" as const;

export const PHASE62E_ONE_LINE_STANDARD =
  "Phase 62-E는 62-D에서 포털 draft로 동기화된 보완요청을 변호사가 최종 발송 승인할 때만 clientVisible·sendAllowed·notificationAllowed를 열고, Litigation Ops task는 DRAFT_LINKED 상태로만 연결하여 실제 실행은 별도 action gate를 거치게 하는 단계다." as const;

export const PHASE62E_BOUNDARY_MARKERS = [
  "NO_CLIENT_VISIBLE_WITHOUT_FINAL_LAWYER_APPROVAL",
  "NO_SEND_WITHOUT_SEND_GATE",
  "NO_NOTIFICATION_WITHOUT_MESSAGE_POLICY",
  "NO_AUTO_LITIGATION_TASK_EXECUTION",
  "NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT",
  "NO_UNAPPROVED_DRAFT_TO_CLIENT_PORTAL",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "CLIENT_VISIBLE_PAYLOAD_AUDIT_REQUIRED",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
] as const;

export type ClientVisibleSendGateBoundaryMarker = (typeof PHASE62E_BOUNDARY_MARKERS)[number];

export const PHASE62E_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT =
  "verify:aibeopchin-control-tower-brain-rc" as const;

export const PHASE62E_CLIENT_SEND_GATE_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase62e" as const;

export const PHASE62E_PHASE62D_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase62d" as const;

export const PHASE20_MESSAGING_POLICY_MARKER = "phase20-client-messaging-policy" as const;

const DEFAULT_BOUNDARIES = clientVisibleSendGateBoundariesSchema.parse({
  noClientVisibleWithoutFinalLawyerApproval: true,
  noSendWithoutSendGate: true,
  noNotificationWithoutMessagePolicy: true,
  noAutoLitigationTaskExecution: true,
  noInternalStrategyLeakToClient: true,
  noUnapprovedDraftToClientPortal: true,
  lawyerDecisionLedgerRequired: true,
  clientVisiblePayloadAuditRequired: true,
  controlTowerBrainVerifyRequired: true,
});

const PORTAL_APPROVED_STATUSES = new Set(["LAWYER_APPROVED", "LAWYER_MODIFIED"]);

export function evaluateClientVisiblePayloadMessage(text: string): {
  allowed: boolean;
  blockedBy?: ClientVisibleSendGateBoundaryMarker;
} {
  for (const pattern of INTERNAL_STRATEGY_LEAK_PATTERNS) {
    if (pattern.test(text)) {
      return { allowed: false, blockedBy: "NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT" };
    }
  }
  return { allowed: true };
}

export function assertClientVisiblePayloadMessageAllowed(text: string) {
  const result = evaluateClientVisiblePayloadMessage(text);
  if (!result.allowed) {
    throw new ValidationError(result.blockedBy ?? "NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT");
  }
}

function assertAuditRef(auditRef: string, blockedBy: ClientVisibleSendGateBoundaryMarker) {
  if (!auditRef.trim()) {
    throw new ValidationError(blockedBy);
  }
}

export function evaluatePortalSyncForClientVisibility(input: {
  portalSync: ClientPortalSupplementDraftSync;
  portalReviewLedgerEntryId?: string;
}): { allowed: boolean; blockedBy?: ClientVisibleSendGateBoundaryMarker } {
  if (!PORTAL_APPROVED_STATUSES.has(input.portalSync.reviewStatus)) {
    return { allowed: false, blockedBy: "NO_UNAPPROVED_DRAFT_TO_CLIENT_PORTAL" };
  }

  if (input.portalSync.clientVisible) {
    return { allowed: false, blockedBy: "NO_UNAPPROVED_DRAFT_TO_CLIENT_PORTAL" };
  }

  if (!input.portalReviewLedgerEntryId) {
    return { allowed: false, blockedBy: "LAWYER_DECISION_LEDGER_REQUIRED" };
  }

  if (input.portalReviewLedgerEntryId !== input.portalSync.lawyerDecisionLedgerEntryId) {
    return { allowed: false, blockedBy: "LAWYER_DECISION_LEDGER_REQUIRED" };
  }

  return { allowed: true };
}

export function assertClientVisibleSendGateAllowed(input: {
  payload: ClientVisibleSupplementRequestPayload;
  finalLawyerApprovalLedgerEntry?: FinalLawyerApprovalLedgerEntry;
  sendGateEnabled?: boolean;
}) {
  if (!input.payload.auditRef.trim()) {
    throw new ValidationError("CLIENT_VISIBLE_PAYLOAD_AUDIT_REQUIRED");
  }

  if (!input.payload.clientVisible) {
    throw new ValidationError("NO_CLIENT_VISIBLE_WITHOUT_FINAL_LAWYER_APPROVAL");
  }

  if (input.sendGateEnabled && !input.payload.sendAllowed) {
    throw new ValidationError("NO_SEND_WITHOUT_SEND_GATE");
  }

  if (!input.finalLawyerApprovalLedgerEntry) {
    throw new ValidationError("LAWYER_DECISION_LEDGER_REQUIRED");
  }

  if (
    input.finalLawyerApprovalLedgerEntry.ledgerEntryId !==
    input.payload.finalLawyerApprovalLedgerEntryId
  ) {
    throw new ValidationError("LAWYER_DECISION_LEDGER_REQUIRED");
  }
}

export function buildClientVisibleSupplementRequestPayload(input: {
  portalSync: ClientPortalSupplementDraftSync;
  finalLawyerApprovalLedgerEntry: FinalLawyerApprovalLedgerEntry;
  auditRef: string;
  payloadId?: string;
  clientVisible?: boolean;
  sendAllowed?: boolean;
  notificationAllowed?: boolean;
  sendGateLedgerEntryId?: string;
  messagePolicyGateRef?: string;
}): ClientVisibleSupplementRequestPayload {
  assertAuditRef(input.auditRef, "CLIENT_VISIBLE_PAYLOAD_AUDIT_REQUIRED");

  const items = input.portalSync.portalDraftItems.map((item) => {
    assertClientVisiblePayloadMessageAllowed(item.clientMessageDraft);
    return {
      portalItemId: item.portalItemId,
      clientMessage: item.clientMessageDraft,
      requestedEvidenceType: item.requestedEvidenceType,
    };
  });

  const payload: ClientVisibleSupplementRequestPayload = {
    marker: PHASE62E_CLIENT_SEND_GATE_SCHEMA_MARKER,
    version: PHASE62E_CLIENT_SEND_GATE_VERSION,
    payloadId: input.payloadId ?? randomUUID(),
    syncId: input.portalSync.syncId,
    draftId: input.portalSync.draftId,
    caseId: input.portalSync.caseId,
    tenantId: input.portalSync.tenantId,
    items,
    clientVisible: input.clientVisible ?? false,
    sendAllowed: input.sendAllowed ?? false,
    notificationAllowed: input.notificationAllowed ?? false,
    autoTaskExecutionAllowed: false,
    finalLawyerApprovalLedgerEntryId: input.finalLawyerApprovalLedgerEntry.ledgerEntryId,
    sendGateLedgerEntryId: input.sendGateLedgerEntryId,
    messagePolicyGateRef: input.messagePolicyGateRef,
    boundaries: DEFAULT_BOUNDARIES,
    auditRef: input.auditRef,
    phase62DVerifyScript: PHASE62E_PHASE62D_VERIFY_SCRIPT,
    phase62EVerifyScript: PHASE62E_CLIENT_SEND_GATE_VERIFY_SCRIPT,
    controlTowerBrainVerifyScript: PHASE62E_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
    createdAt: new Date().toISOString(),
  };

  return clientVisibleSupplementRequestPayloadSchema.parse(payload);
}

export function approvePortalDraftForClientVisibility(
  input: ApprovePortalDraftForClientVisibilityInput,
): {
  finalLawyerApprovalLedgerEntry: FinalLawyerApprovalLedgerEntry;
  payload: ClientVisibleSupplementRequestPayload;
} {
  assertAuditRef(input.auditRef, "CLIENT_VISIBLE_PAYLOAD_AUDIT_REQUIRED");

  const portalGate = evaluatePortalSyncForClientVisibility({
    portalSync: input.portalSync,
    portalReviewLedgerEntryId: input.portalReviewLedgerEntry.ledgerEntryId,
  });
  if (!portalGate.allowed) {
    throw new ValidationError(portalGate.blockedBy ?? "NO_UNAPPROVED_DRAFT_TO_CLIENT_PORTAL");
  }

  if (input.portalReviewLedgerEntry.draftId !== input.portalSync.draftId) {
    throw new ValidationError("LAWYER_DECISION_LEDGER_REQUIRED");
  }

  const finalLawyerApprovalLedgerEntry = finalLawyerApprovalLedgerEntrySchema.parse({
    ledgerEntryId: input.finalLedgerEntryId ?? randomUUID(),
    syncId: input.portalSync.syncId,
    draftId: input.portalSync.draftId,
    caseId: input.portalSync.caseId,
    tenantId: input.portalSync.tenantId,
    lawyerId: input.lawyerId,
    action: "FINAL_APPROVE_FOR_CLIENT",
    portalReviewLedgerEntryId: input.portalReviewLedgerEntry.ledgerEntryId,
    auditRef: input.auditRef,
    approvedAt: new Date().toISOString(),
  });

  const payload = buildClientVisibleSupplementRequestPayload({
    portalSync: input.portalSync,
    finalLawyerApprovalLedgerEntry,
    auditRef: input.auditRef,
    payloadId: input.payloadId,
    clientVisible: true,
    sendAllowed: false,
    notificationAllowed: false,
  });

  return { finalLawyerApprovalLedgerEntry, payload };
}

export function enableSupplementRequestSendGate(input: EnableSupplementRequestSendGateInput): {
  sendGateLedgerEntry: SupplementRequestSendGateLedgerEntry;
  payload: ClientVisibleSupplementRequestPayload;
} {
  assertAuditRef(input.auditRef, "CLIENT_VISIBLE_PAYLOAD_AUDIT_REQUIRED");

  if (!input.payload.clientVisible) {
    throw new ValidationError("NO_CLIENT_VISIBLE_WITHOUT_FINAL_LAWYER_APPROVAL");
  }

  if (input.payload.sendAllowed) {
    throw new ValidationError("NO_SEND_WITHOUT_SEND_GATE");
  }

  if (
    input.finalLawyerApprovalLedgerEntry.ledgerEntryId !==
    input.payload.finalLawyerApprovalLedgerEntryId
  ) {
    throw new ValidationError("LAWYER_DECISION_LEDGER_REQUIRED");
  }

  const sendGateLedgerEntry = supplementRequestSendGateLedgerEntrySchema.parse({
    ledgerEntryId: input.sendGateLedgerEntryId ?? randomUUID(),
    payloadId: input.payload.payloadId,
    syncId: input.payload.syncId,
    draftId: input.payload.draftId,
    lawyerId: input.lawyerId,
    action: "ENABLE_SEND_GATE",
    finalLawyerApprovalLedgerEntryId: input.finalLawyerApprovalLedgerEntry.ledgerEntryId,
    auditRef: input.auditRef,
    enabledAt: new Date().toISOString(),
  });

  const payload = clientVisibleSupplementRequestPayloadSchema.parse({
    ...input.payload,
    sendAllowed: true,
    sendGateLedgerEntryId: sendGateLedgerEntry.ledgerEntryId,
    auditRef: input.auditRef,
  });

  return { sendGateLedgerEntry, payload };
}

export function enableNotificationWithMessagePolicy(
  input: EnableNotificationWithMessagePolicyInput,
): ClientVisibleSupplementRequestPayload {
  assertAuditRef(input.auditRef, "CLIENT_VISIBLE_PAYLOAD_AUDIT_REQUIRED");

  if (!input.messagePolicyGateRef.trim()) {
    throw new ValidationError("NO_NOTIFICATION_WITHOUT_MESSAGE_POLICY");
  }

  if (!input.payload.sendAllowed) {
    throw new ValidationError("NO_SEND_WITHOUT_SEND_GATE");
  }

  return clientVisibleSupplementRequestPayloadSchema.parse({
    ...input.payload,
    notificationAllowed: true,
    messagePolicyGateRef: input.messagePolicyGateRef,
    auditRef: input.auditRef,
  });
}

export function linkSupplementRequestToLitigationOpsDraft(
  input: LinkSupplementRequestToLitigationOpsDraftInput,
): LitigationOpsDraftLink {
  assertAuditRef(input.auditRef, "CLIENT_VISIBLE_PAYLOAD_AUDIT_REQUIRED");

  if (!input.payload.clientVisible) {
    throw new ValidationError("NO_CLIENT_VISIBLE_WITHOUT_FINAL_LAWYER_APPROVAL");
  }

  return litigationOpsDraftLinkSchema.parse({
    linkId: input.linkId ?? randomUUID(),
    syncId: input.payload.syncId,
    draftId: input.payload.draftId,
    caseId: input.payload.caseId,
    tenantId: input.payload.tenantId,
    litigationOpsTarget: input.litigationOpsTarget ?? "LITIGATION_OPS_TASK_DRAFT",
    linkStatus: "DRAFT_LINKED",
    payloadId: input.payload.payloadId,
    autoTaskExecutionAllowed: false,
    auditRef: input.auditRef,
    linkedAt: new Date().toISOString(),
  });
}

export function canSendViaMessagingChannel(input: {
  payload: ClientVisibleSupplementRequestPayload;
  channel: "KAKAO" | "EMAIL";
}): { allowed: boolean; blockedBy?: ClientVisibleSendGateBoundaryMarker } {
  if (!input.payload.sendAllowed) {
    return { allowed: false, blockedBy: "NO_SEND_WITHOUT_SEND_GATE" };
  }

  if (!input.payload.notificationAllowed) {
    return { allowed: false, blockedBy: "NO_NOTIFICATION_WITHOUT_MESSAGE_POLICY" };
  }

  if (!input.payload.messagePolicyGateRef?.trim()) {
    return { allowed: false, blockedBy: "NO_NOTIFICATION_WITHOUT_MESSAGE_POLICY" };
  }

  void input.channel;
  return { allowed: true };
}
