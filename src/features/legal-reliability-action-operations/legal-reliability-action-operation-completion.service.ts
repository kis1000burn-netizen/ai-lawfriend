/**
 * Product Phase 50-D — Lawyer Completion Review service.
 */
import type { Prisma } from "@prisma/client";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit-log";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  assertCanReviewLegalReliabilityActionOperation,
  assertClientResponseDoesNotCompleteOperation,
  assertCompletionLedgerRequired,
  assertCourtReadyUseRequiresConfirmedReview,
  assertEvidenceConfirmationRequiresLawyerReview,
  mapSessionRoleToCompletionActorRole,
  resolveDefaultCompletionResult,
  resolveNextOperationStatus,
} from "./legal-reliability-action-operation-completion.policy";
import { createLegalReliabilityActionOperationCompletionLedger } from "./legal-reliability-action-operation-completion-ledger.service";
import type { CompleteLegalReliabilityActionOperationInput } from "./legal-reliability-action-operation-completion.schema";
import { parseEvidenceIntakeLinks } from "./legal-reliability-action-operation-evidence-intake-sync.service";
import {
  findLegalReliabilityActionOperationRepository,
  updateLegalReliabilityActionOperationCompletionRepository,
} from "./legal-reliability-action-operation.repository";
import { computeLegalReliabilityActionSlaStatus } from "./legal-reliability-action-operation-sla.service";
import { serializeLegalReliabilityActionOperationRow } from "./legal-reliability-action-operation-serializer";

export const PHASE50D_COMPLETION_SERVICE_MARKER =
  "phase50d-legal-reliability-action-operation-completion-service" as const;

export const PHASE50D_AUDIT_ACTION =
  "LEGAL_RELIABILITY_ACTION_OPERATION_COMPLETION_REVIEWED" as const;

function parseStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

function parseJsonObject(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function resolveNextEvidenceIntakeStatus(input: {
  current?: string | null;
  decision?: string;
}) {
  if (input.decision === "LAWYER_CONFIRMED") return "LAWYER_CONFIRMED";
  if (input.decision === "LAWYER_REJECTED") return "REJECTED";
  if (input.decision === "NEEDS_MORE_REVIEW") return "UNDER_REVIEW";
  return input.current ?? "NONE";
}

function applyEvidenceIntakeDecisionToLinks(input: {
  links: ReturnType<typeof parseEvidenceIntakeLinks>;
  evidenceIntakeDecision?: string;
  confirmedEvidenceItemIds: string[];
  rejectedUploadedFileIds: string[];
  reviewedByUserId: string;
  reviewedAt: Date;
}) {
  if (!input.evidenceIntakeDecision) {
    return input.links;
  }

  return input.links.map((link) => {
    if (input.evidenceIntakeDecision === "LAWYER_CONFIRMED") {
      const confirmedId = input.confirmedEvidenceItemIds[0];
      return {
        ...link,
        intakeStatus: "LAWYER_CONFIRMED" as const,
        confirmedEvidenceItemId: confirmedId,
        reviewedByUserId: input.reviewedByUserId,
        reviewedAt: input.reviewedAt.toISOString(),
      };
    }

    if (
      input.evidenceIntakeDecision === "LAWYER_REJECTED" &&
      input.rejectedUploadedFileIds.includes(link.uploadedFileId)
    ) {
      return {
        ...link,
        intakeStatus: "REJECTED" as const,
        reviewedByUserId: input.reviewedByUserId,
        reviewedAt: input.reviewedAt.toISOString(),
      };
    }

    if (input.evidenceIntakeDecision === "NEEDS_MORE_REVIEW") {
      return {
        ...link,
        intakeStatus: "UNDER_REVIEW" as const,
      };
    }

    return link;
  });
}

export async function reviewLegalReliabilityActionOperationCompletion(
  decisionInput: CompleteLegalReliabilityActionOperationInput,
) {
  const now = decisionInput.now ?? new Date();

  const operation = await findLegalReliabilityActionOperationRepository(decisionInput.operationId);

  if (!operation || operation.caseId !== decisionInput.caseId) {
    throw new NotFoundError("LEGAL_RELIABILITY_ACTION_OPERATION_NOT_FOUND");
  }

  const linkedClientSubmissionIds = parseStringArray(operation.linkedClientSubmissionIds);
  const reviewHandoffJson = parseJsonObject(operation.reviewHandoffJson);

  assertCanReviewLegalReliabilityActionOperation({
    actorRole: decisionInput.actorRole,
    operationStatus: operation.status,
    hasClientResponse:
      Boolean(operation.clientResponseReceivedAt) || linkedClientSubmissionIds.length > 0,
    hasReviewHandoff: Boolean(reviewHandoffJson),
  });

  assertClientResponseDoesNotCompleteOperation({
    requestedByRole: decisionInput.actorRole,
    requestedStatus: "COMPLETED",
  });

  assertEvidenceConfirmationRequiresLawyerReview({
    actorRole: decisionInput.actorRole,
    evidenceIntakeDecision: decisionInput.evidenceIntakeDecision,
  });

  assertCompletionLedgerRequired({
    willCreateLedger: true,
  });

  const nextStatus = resolveNextOperationStatus(decisionInput.decision);
  const completionResult =
    decisionInput.completionResult ?? resolveDefaultCompletionResult(decisionInput.decision);

  const courtReadyAllowed =
    nextStatus === "COMPLETED" &&
    decisionInput.evidenceIntakeDecision === "LAWYER_CONFIRMED";

  assertCourtReadyUseRequiresConfirmedReview({
    nextStatus,
    evidenceIntakeDecision: decisionInput.evidenceIntakeDecision,
    courtReadyAllowed,
  });

  const ledger = await createLegalReliabilityActionOperationCompletionLedger({
    caseId: operation.caseId,
    tenantId: operation.tenantId,
    operationId: operation.id,
    sourceActionCandidateId: operation.sourceActionCandidateId,
    decisionInput,
    nextStatus,
    completionResult,
  });

  const evidenceIntakeStatus = resolveNextEvidenceIntakeStatus({
    current: operation.evidenceIntakeStatus,
    decision: decisionInput.evidenceIntakeDecision,
  });

  const intakeLinks = applyEvidenceIntakeDecisionToLinks({
    links: parseEvidenceIntakeLinks(operation.linkedEvidenceIntakeIds),
    evidenceIntakeDecision: decisionInput.evidenceIntakeDecision,
    confirmedEvidenceItemIds: decisionInput.confirmedEvidenceItemIds ?? [],
    rejectedUploadedFileIds: decisionInput.rejectedUploadedFileIds ?? [],
    reviewedByUserId: decisionInput.actorUserId,
    reviewedAt: now,
  });

  const nextReviewHandoff = {
    ...(reviewHandoffJson ?? {}),
    phase50d: {
      decision: decisionInput.decision,
      nextStatus,
      completionResult,
      decidedByUserId: decisionInput.actorUserId,
      decidedAt: now.toISOString(),
      ledgerId: ledger.id,
      downstreamAllowed: nextStatus === "COMPLETED",
      courtReadyAllowed,
    },
  };

  const slaStatus = computeLegalReliabilityActionSlaStatus({
    assignedToUserId: operation.assignedToUserId,
    dueAt: operation.dueAt,
    now,
    status: nextStatus,
    clientResponseReceivedAt: operation.clientResponseReceivedAt,
    lawyerReviewedAt: now,
  });

  const updated = await updateLegalReliabilityActionOperationCompletionRepository({
    operationId: operation.id,
    status: nextStatus,
    lawyerReviewedAt: now,
    completedAt: nextStatus === "COMPLETED" ? now : null,
    completionResult: completionResult ?? null,
    evidenceIntakeStatus,
    linkedEvidenceIntakeIds: intakeLinks as unknown as Prisma.InputJsonValue,
    reviewHandoffJson: nextReviewHandoff as unknown as Prisma.InputJsonValue,
    slaStatus,
    slaCheckedAt: now,
  });

  await writeAuditLog({
    actorUserId: decisionInput.actorUserId,
    action: PHASE50D_AUDIT_ACTION,
    entityType: "LegalReliabilityActionOperation",
    entityId: operation.id,
    message: "Legal Reliability action operation completion reviewed",
    metadata: {
      phase: "50-D",
      decision: decisionInput.decision,
      nextStatus,
      completionResult,
      ledgerId: ledger.id,
      courtReadyAllowed,
      serviceMarker: PHASE50D_COMPLETION_SERVICE_MARKER,
    },
  });

  return {
    operation: serializeLegalReliabilityActionOperationRow(updated),
    ledger,
    nextStatus,
    completionResult,
  };
}

export async function reviewLegalReliabilityActionOperationCompletionService(
  currentUser: SessionUser,
  caseId: string,
  operationId: string,
  input: Omit<
    CompleteLegalReliabilityActionOperationInput,
    "caseId" | "operationId" | "actorUserId" | "actorRole"
  >,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  if (!access.canWriteCase) {
    throw new ForbiddenError("CASE_ACCESS_REQUIRED");
  }

  const actorRole = mapSessionRoleToCompletionActorRole(currentUser.role);

  return reviewLegalReliabilityActionOperationCompletion({
    ...input,
    caseId,
    operationId,
    actorUserId: currentUser.id,
    actorRole,
  });
}
