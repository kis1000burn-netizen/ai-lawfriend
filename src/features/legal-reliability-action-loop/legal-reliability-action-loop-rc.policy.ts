/**
 * Product Phase 49-C — Legal Reliability Action Loop RC policy SSOT.
 */
import { isAllowedActionLoopSourceMarker } from "./legal-reliability-action-loop.registry";

export function assertLegalReliabilityActionLoopRcBoundary(input: {
  actionType: string;
  requiresLawyerApproval: boolean;
  hasLawyerDecisionLedger: boolean;
  clientVisibleByDefault: boolean;
  directMessagingRequested: boolean;
  autoLegalFilingRequested: boolean;
  supplementDraftCreationRequested: boolean;
  lawyerApproved: boolean;
}) {
  if (!input.requiresLawyerApproval) {
    throw new Error("NO_AI_AUTO_ACTION");
  }

  if (input.supplementDraftCreationRequested && !input.lawyerApproved) {
    throw new Error("NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL");
  }

  if (!input.hasLawyerDecisionLedger) {
    throw new Error("LAWYER_DECISION_LEDGER_REQUIRED");
  }

  if (input.clientVisibleByDefault) {
    throw new Error("NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT");
  }

  if (input.directMessagingRequested) {
    throw new Error("NO_AI_AUTO_ACTION");
  }

  if (input.autoLegalFilingRequested) {
    throw new Error("NO_AUTO_LEGAL_FILING");
  }

  if (!input.actionType) {
    throw new Error("NO_AI_AUTO_ACTION");
  }
}

export function assertSupplementDraftCreationAllowed(input: {
  candidateStatus: string;
  hasLawyerDecisionLedger: boolean;
  sanitizerBlocked: boolean;
  sourceMarker: string;
  directMessaging: boolean;
  autoLegalFiling: boolean;
  lawyerApproved: boolean;
}) {
  if (!input.lawyerApproved) {
    throw new Error("NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL");
  }

  if (!["LAWYER_APPROVED", "LAWYER_EDITED"].includes(input.candidateStatus)) {
    throw new Error("NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL");
  }

  if (!input.hasLawyerDecisionLedger) {
    throw new Error("LAWYER_DECISION_LEDGER_REQUIRED");
  }

  if (input.sanitizerBlocked) {
    throw new Error("NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT");
  }

  if (!isAllowedActionLoopSourceMarker(input.sourceMarker)) {
    throw new Error("NO_UNREVIEWED_DRAFT_CONTEXT");
  }

  if (input.directMessaging) {
    throw new Error("NO_AI_AUTO_ACTION");
  }

  if (input.autoLegalFiling) {
    throw new Error("NO_AUTO_LEGAL_FILING");
  }
}
