/**
 * Product Phase 50-D — Lawyer Completion Review policy SSOT.
 */
import { ForbiddenError, ValidationError } from "@/lib/errors";
import type {
  CompleteLegalReliabilityActionOperationInput,
  LegalReliabilityActionOperationCompletionDecision,
  LegalReliabilityActionOperationCompletionResult,
} from "./legal-reliability-action-operation-completion.schema";

export const PHASE50D_POLICY_MARKER =
  "phase50d-legal-reliability-action-operations-completion-policy" as const;

const COMPLETION_ALLOWED_STATUSES = new Set([
  "CLIENT_RESPONDED",
  "EVIDENCE_INTAKE_LINKED",
  "LAWYER_REVIEWING_RESPONSE",
]);

const TERMINAL_STATUSES = new Set(["COMPLETED", "CANCELED"]);

const COMPLETION_REVIEW_ALLOWED_ROLES = new Set(["LAWYER", "ADMIN"]);

export function mapSessionRoleToCompletionActorRole(
  role: string,
): CompleteLegalReliabilityActionOperationInput["actorRole"] {
  if (role === "USER") return "CLIENT";
  if (role === "SUPER_ADMIN") return "ADMIN";
  if (role === "LAWYER" || role === "ADMIN" || role === "STAFF") return role;
  return "SYSTEM";
}

export function assertCanReviewLegalReliabilityActionOperation(input: {
  actorRole: string;
  operationStatus: string;
  hasClientResponse: boolean;
  hasReviewHandoff: boolean;
}) {
  if (input.actorRole === "CLIENT") {
    throw new ForbiddenError("CLIENT_ROLE_COMPLETION_REVIEW_FORBIDDEN");
  }

  if (input.actorRole === "SYSTEM") {
    throw new ValidationError("NO_AI_COMPLETION_DECISION");
  }

  if (!COMPLETION_REVIEW_ALLOWED_ROLES.has(input.actorRole)) {
    throw new ForbiddenError("LAWYER_REVIEW_REQUIRED_FOR_COMPLETION");
  }

  if (TERMINAL_STATUSES.has(input.operationStatus)) {
    throw new ValidationError("TERMINAL_OPERATION_COMPLETION_CHANGE_FORBIDDEN");
  }

  if (!COMPLETION_ALLOWED_STATUSES.has(input.operationStatus)) {
    throw new ValidationError("INVALID_OPERATION_STATUS_FOR_COMPLETION_REVIEW");
  }

  if (!input.hasClientResponse) {
    throw new ValidationError("CLIENT_RESPONSE_REQUIRED_FOR_COMPLETION_REVIEW");
  }

  if (!input.hasReviewHandoff) {
    throw new ValidationError("LAWYER_REVIEW_HANDOFF_REQUIRED");
  }
}

export function assertClientResponseDoesNotCompleteOperation(input: {
  requestedByRole: string;
  requestedStatus: string;
}) {
  if (input.requestedByRole === "CLIENT" && input.requestedStatus === "COMPLETED") {
    throw new ValidationError("NO_CLIENT_RESPONSE_AUTO_COMPLETION");
  }
}

export function assertEvidenceConfirmationRequiresLawyerReview(input: {
  actorRole: string;
  evidenceIntakeDecision?: string;
}) {
  if (!input.evidenceIntakeDecision) return;

  if (
    input.evidenceIntakeDecision === "LAWYER_CONFIRMED" &&
    !COMPLETION_REVIEW_ALLOWED_ROLES.has(input.actorRole)
  ) {
    throw new ValidationError("NO_EVIDENCE_CONFIRMATION_WITHOUT_LAWYER_REVIEW");
  }
}

export function assertCompletionLedgerRequired(input: { willCreateLedger: boolean }) {
  if (!input.willCreateLedger) {
    throw new ValidationError("COMPLETION_DECISION_LEDGER_REQUIRED");
  }
}

export function assertCourtReadyUseRequiresConfirmedReview(input: {
  nextStatus: string;
  evidenceIntakeDecision?: string;
  courtReadyAllowed: boolean;
}) {
  if (input.courtReadyAllowed && input.evidenceIntakeDecision !== "LAWYER_CONFIRMED") {
    throw new ValidationError("NO_COURT_READY_USE_WITHOUT_CONFIRMED_REVIEW");
  }

  if (
    input.nextStatus === "COMPLETED" &&
    input.evidenceIntakeDecision &&
    input.evidenceIntakeDecision !== "LAWYER_CONFIRMED" &&
    input.courtReadyAllowed
  ) {
    throw new ValidationError("NO_COURT_READY_USE_WITHOUT_CONFIRMED_REVIEW");
  }
}

export function resolveNextOperationStatus(
  decision: LegalReliabilityActionOperationCompletionDecision,
) {
  switch (decision) {
    case "MARK_COMPLETED":
      return "COMPLETED";
    case "REQUEST_MORE_INFO":
      return "NEEDS_MORE_INFO";
    case "REOPEN":
      return "REOPENED";
    case "DEFER":
      return "DEFERRED";
    case "CANCEL":
      return "CANCELED";
    default:
      throw new ValidationError("UNKNOWN_COMPLETION_DECISION");
  }
}

export function resolveDefaultCompletionResult(
  decision: LegalReliabilityActionOperationCompletionDecision,
): LegalReliabilityActionOperationCompletionResult | undefined {
  switch (decision) {
    case "MARK_COMPLETED":
      return "RESOLVED";
    case "REQUEST_MORE_INFO":
      return "NEEDS_MORE_INFO";
    case "REOPEN":
      return "REOPENED_BY_LAWYER";
    case "DEFER":
      return "DEFERRED_BY_LAWYER";
    case "CANCEL":
      return "CANCELED_BY_LAWYER";
    default:
      return undefined;
  }
}
