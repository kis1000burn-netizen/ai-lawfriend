/**
 * Product Phase 62-E — Client-visible Send Gate & Litigation Ops Draft Link service SSOT.
 */
export {
  approvePortalDraftForClientVisibility,
  assertClientVisibleSendGateAllowed,
  buildClientVisibleSupplementRequestPayload,
  canSendViaMessagingChannel,
  enableNotificationWithMessagePolicy,
  enableSupplementRequestSendGate,
  linkSupplementRequestToLitigationOpsDraft,
} from "./phase62e-client-send-gate.policy";

import type {
  ClientVisibleSupplementRequestPayload,
  LitigationOpsDraftLink,
} from "./phase62e-client-send-gate.schema";
import type { ApprovePortalDraftForClientVisibilityInput } from "./phase62e-client-send-gate.schema";
import {
  approvePortalDraftForClientVisibility,
  enableNotificationWithMessagePolicy,
  enableSupplementRequestSendGate,
  linkSupplementRequestToLitigationOpsDraft,
} from "./phase62e-client-send-gate.policy";

export function runClientVisibleSendGateWorkflow(input: {
  approveInput: ApprovePortalDraftForClientVisibilityInput;
  sendGateLawyerId: string;
  sendGateAuditRef: string;
  messagePolicyGateRef: string;
  notificationAuditRef: string;
  litigationOpsAuditRef: string;
}): {
  payload: ClientVisibleSupplementRequestPayload;
  litigationOpsLink: LitigationOpsDraftLink;
} {
  const approved = approvePortalDraftForClientVisibility(input.approveInput);

  const sendGate = enableSupplementRequestSendGate({
    payload: approved.payload,
    finalLawyerApprovalLedgerEntry: approved.finalLawyerApprovalLedgerEntry,
    lawyerId: input.sendGateLawyerId,
    auditRef: input.sendGateAuditRef,
  });

  const withNotification = enableNotificationWithMessagePolicy({
    payload: sendGate.payload,
    messagePolicyGateRef: input.messagePolicyGateRef,
    auditRef: input.notificationAuditRef,
  });

  const litigationOpsLink = linkSupplementRequestToLitigationOpsDraft({
    payload: withNotification,
    auditRef: input.litigationOpsAuditRef,
  });

  return { payload: withNotification, litigationOpsLink };
}

export function summarizeClientVisiblePayload(payload: ClientVisibleSupplementRequestPayload) {
  return {
    payloadId: payload.payloadId,
    clientVisible: payload.clientVisible,
    sendAllowed: payload.sendAllowed,
    notificationAllowed: payload.notificationAllowed,
    autoTaskExecutionAllowed: payload.autoTaskExecutionAllowed,
  };
}
