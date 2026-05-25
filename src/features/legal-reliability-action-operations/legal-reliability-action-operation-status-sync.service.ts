/**
 * Product Phase 50-C — Operation status sync policy helpers.
 */
import {
  assertCanMarkClientResponded,
  assertClientResponseDoesNotCompleteOperation,
} from "./legal-reliability-action-operation-client-response.policy";
import type { LegalReliabilityActionOperationStatus } from "./legal-reliability-action-operation.schema";

export const PHASE50C_STATUS_SYNC_SERVICE_MARKER =
  "phase50c-legal-reliability-action-operation-status-sync-service" as const;

export function validateClientResponseStatusTransition(input: {
  operationStatus: string;
  supplementRequestStatus: string;
  hasClientSubmission: boolean;
  requestedStatus?: string;
}) {
  assertCanMarkClientResponded(input);
  if (input.requestedStatus) {
    assertClientResponseDoesNotCompleteOperation({ requestedStatus: input.requestedStatus });
  }
}

export function deriveStatusAfterClientResponse(): LegalReliabilityActionOperationStatus {
  return "CLIENT_RESPONDED";
}

export function deriveStatusAfterEvidenceIntakeLink(): LegalReliabilityActionOperationStatus {
  return "EVIDENCE_INTAKE_LINKED";
}

export function deriveStatusAfterLawyerReviewHandoff(): LegalReliabilityActionOperationStatus {
  return "LAWYER_REVIEWING_RESPONSE";
}
