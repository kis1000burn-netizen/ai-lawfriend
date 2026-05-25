/**
 * Product Phase 50-C — Client response & evidence intake policy SSOT.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const PHASE50C_POLICY_MARKER =
  "phase50c-legal-reliability-action-operations-client-response-policy" as const;

export const PHASE50C_LOCKED_BOUNDARIES = [
  "CLIENT_RESPONSE_DOES_NOT_COMPLETE_OPERATION",
  "CLIENT_UPLOAD_IS_NOT_CONFIRMED_EVIDENCE",
  "LAWYER_REVIEW_REQUIRED_FOR_COMPLETION",
  "EVIDENCE_INTAKE_LINK_REQUIRED",
  "NO_AUTO_EVIDENCE_PROMOTION",
  "NO_CLIENT_SUBMISSION_DIRECT_TO_COURT_READY_PACK",
  "NO_AUTO_OPERATION_COMPLETION",
] as const;

const SYNC_ALLOWED_ROLES = new Set<SessionUser["role"]>([
  "LAWYER",
  "STAFF",
  "ADMIN",
  "SUPER_ADMIN",
]);

const HANDOFF_ALLOWED_STATUSES = new Set([
  "CLIENT_RESPONDED",
  "EVIDENCE_INTAKE_LINKED",
]);

export function assertCanMarkClientResponded(input: {
  operationStatus: string;
  supplementRequestStatus: string;
  hasClientSubmission: boolean;
}) {
  if (input.operationStatus !== "SENT_TO_CLIENT") {
    throw new ValidationError("CLIENT_RESPONSE_INVALID_OPERATION_STATUS");
  }

  if (!input.hasClientSubmission) {
    throw new ValidationError("CLIENT_SUBMISSION_REQUIRED");
  }

  if (input.supplementRequestStatus !== "CLIENT_RESPONDED") {
    throw new ValidationError("SUPPLEMENT_REQUEST_RESPONSE_REQUIRED");
  }
}

export function assertClientResponseDoesNotCompleteOperation(input: {
  requestedStatus: string;
}) {
  if (input.requestedStatus === "COMPLETED") {
    throw new ValidationError("CLIENT_RESPONSE_DOES_NOT_COMPLETE_OPERATION");
  }
}

export function assertLawyerReviewRequiredForCompletion(input: { requestedStatus: string }) {
  if (input.requestedStatus === "COMPLETED") {
    throw new ValidationError("LAWYER_REVIEW_REQUIRED_FOR_COMPLETION");
  }
}

export function assertNoAutoEvidencePromotion(link: {
  confirmedEvidenceItemId?: string | null;
  autoPromoted?: boolean;
}) {
  if (link.confirmedEvidenceItemId || link.autoPromoted) {
    throw new ValidationError("NO_AUTO_EVIDENCE_PROMOTION");
  }
}

export function assertClientUploadIsNotConfirmedEvidence(input: {
  evidenceIntakeStatus: string;
}) {
  if (input.evidenceIntakeStatus === "LAWYER_CONFIRMED") {
    throw new ValidationError("CLIENT_UPLOAD_IS_NOT_CONFIRMED_EVIDENCE");
  }
}

export function assertEvidenceIntakeLinkRequired(input: {
  uploadedFileIds: string[];
  evidenceIntakeStatus: string;
}) {
  if (input.uploadedFileIds.length > 0 && input.evidenceIntakeStatus === "NONE") {
    throw new ValidationError("EVIDENCE_INTAKE_LINK_REQUIRED");
  }
}

export function assertCanSyncClientResponseViaApi(input: {
  actor: SessionUser;
  canWriteCase: boolean;
}) {
  if (!input.canWriteCase) {
    throw new ForbiddenError("CASE_ACCESS_REQUIRED");
  }

  if (input.actor.role === "USER") {
    throw new ForbiddenError("CLIENT_ROLE_CLIENT_RESPONSE_SYNC_FORBIDDEN");
  }

  if (!SYNC_ALLOWED_ROLES.has(input.actor.role)) {
    throw new ForbiddenError("CLIENT_ROLE_CLIENT_RESPONSE_SYNC_FORBIDDEN");
  }
}

export function assertCanHandoffLegalReliabilityActionOperationReview(input: {
  actor: SessionUser;
  canWriteCase: boolean;
  operationStatus: string;
  linkedClientSubmissionIds: string[];
}) {
  assertCanSyncClientResponseViaApi({ actor: input.actor, canWriteCase: input.canWriteCase });

  if (!HANDOFF_ALLOWED_STATUSES.has(input.operationStatus)) {
    throw new ValidationError("LAWYER_REVIEW_HANDOFF_INVALID_STATUS");
  }

  if (input.linkedClientSubmissionIds.length === 0) {
    throw new ValidationError("CLIENT_SUBMISSION_REQUIRED");
  }
}

export function isLawyerReviewRequiredStatus(status: string) {
  return (
    status === "CLIENT_RESPONDED" ||
    status === "EVIDENCE_INTAKE_LINKED" ||
    status === "LAWYER_REVIEWING_RESPONSE"
  );
}
