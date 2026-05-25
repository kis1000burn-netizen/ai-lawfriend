/**
 * Product Phase 50-C — Client response sync to Legal Reliability Action Operation.
 */
import type { Prisma } from "@prisma/client";
import { NotFoundError } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit-log";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  assertCanSyncClientResponseViaApi,
  assertClientResponseDoesNotCompleteOperation,
} from "./legal-reliability-action-operation-client-response.policy";
import {
  buildEvidenceIntakeLinksForUploadedFiles,
  deriveEvidenceIntakeStatusFromLinks,
  parseEvidenceIntakeLinks,
} from "./legal-reliability-action-operation-evidence-intake-sync.service";
import {
  deriveStatusAfterClientResponse,
  deriveStatusAfterEvidenceIntakeLink,
  validateClientResponseStatusTransition,
} from "./legal-reliability-action-operation-status-sync.service";
import {
  findLegalReliabilityActionOperationBySupplementRequestIdRepository,
  findLegalReliabilityActionOperationRepository,
  findSupplementRequestStatusRepository,
  updateLegalReliabilityActionOperationClientResponseRepository,
} from "./legal-reliability-action-operation.repository";
import { computeLegalReliabilityActionSlaStatus } from "./legal-reliability-action-operation-sla.service";
import type { SyncClientResponseToLegalReliabilityOperationInput } from "./legal-reliability-action-operation.schema";
import { serializeLegalReliabilityActionOperationRow } from "./legal-reliability-action-operation-serializer";

export const PHASE50C_CLIENT_RESPONSE_SYNC_SERVICE_MARKER =
  "phase50c-legal-reliability-action-operation-client-response-sync-service" as const;

export const PHASE50C_AUDIT_ACTIONS = {
  clientResponseSynced: "LEGAL_RELIABILITY_ACTION_CLIENT_RESPONSE_SYNCED",
  clientUploadLinked: "LEGAL_RELIABILITY_ACTION_CLIENT_UPLOAD_LINKED",
  evidenceIntakeLinked: "LEGAL_RELIABILITY_ACTION_EVIDENCE_INTAKE_LINKED",
  clientResponseCompletionBlocked: "LEGAL_RELIABILITY_ACTION_CLIENT_RESPONSE_COMPLETION_BLOCKED",
  autoEvidencePromotionBlocked: "LEGAL_RELIABILITY_ACTION_AUTO_EVIDENCE_PROMOTION_BLOCKED",
} as const;

function mergeUniqueIds(existing: unknown, incoming: string[]) {
  const current = Array.isArray(existing)
    ? existing.filter((value): value is string => typeof value === "string")
    : [];
  return [...new Set([...current, ...incoming])];
}

export async function syncClientResponseToLegalReliabilityOperation(input: {
  caseId: string;
  supplementRequestId: string;
  clientSubmissionIds: string[];
  uploadedFileIds: string[];
  responseSummary?: string;
  respondedAt: Date;
  actorUserId: string;
}) {
  assertClientResponseDoesNotCompleteOperation({ requestedStatus: "COMPLETED" });

  const operation = await findLegalReliabilityActionOperationBySupplementRequestIdRepository(
    input.supplementRequestId,
  );
  if (!operation || operation.caseId !== input.caseId) {
    return null;
  }

  const supplement = await findSupplementRequestStatusRepository(input.supplementRequestId);
  if (!supplement) {
    throw new NotFoundError("보완요청을 찾을 수 없습니다.");
  }

  validateClientResponseStatusTransition({
    operationStatus: operation.status,
    supplementRequestStatus: supplement.status,
    hasClientSubmission: input.clientSubmissionIds.length > 0,
    requestedStatus: "CLIENT_RESPONDED",
  });

  const linkedClientSubmissionIds = mergeUniqueIds(
    operation.linkedClientSubmissionIds,
    input.clientSubmissionIds,
  );
  const linkedUploadedFileIds = mergeUniqueIds(
    operation.linkedUploadedFileIds,
    input.uploadedFileIds,
  );

  const existingIntakeLinks = parseEvidenceIntakeLinks(operation.linkedEvidenceIntakeIds);
  const intakeLinks = buildEvidenceIntakeLinksForUploadedFiles({
    operationId: operation.id,
    caseId: operation.caseId,
    sourceSupplementRequestId: input.supplementRequestId,
    uploadedFileIds: linkedUploadedFileIds,
    existingLinks: existingIntakeLinks,
  });

  const evidenceIntakeStatus = deriveEvidenceIntakeStatusFromLinks(
    intakeLinks,
    linkedUploadedFileIds.length,
  );

  let nextStatus = deriveStatusAfterClientResponse();
  if (input.uploadedFileIds.length > 0) {
    nextStatus = deriveStatusAfterEvidenceIntakeLink();
  }

  const now = input.respondedAt;
  const slaStatus = computeLegalReliabilityActionSlaStatus({
    assignedToUserId: operation.assignedToUserId,
    dueAt: operation.dueAt,
    now,
    status: nextStatus,
    clientResponseReceivedAt: now,
    lawyerReviewedAt: operation.lawyerReviewedAt,
  });

  const updated = await updateLegalReliabilityActionOperationClientResponseRepository({
    operationId: operation.id,
    status: nextStatus,
    clientResponseReceivedAt: now,
    clientResponseSummary: input.responseSummary ?? null,
    linkedClientSubmissionIds,
    linkedUploadedFileIds,
    linkedEvidenceIntakeIds: intakeLinks as unknown as Prisma.InputJsonValue,
    evidenceIntakeStatus,
    slaStatus,
    slaCheckedAt: now,
  });

  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: PHASE50C_AUDIT_ACTIONS.clientResponseSynced,
    entityType: "LegalReliabilityActionOperation",
    entityId: operation.id,
    message: "Client response synced to Legal Reliability action operation",
    metadata: {
      supplementRequestId: input.supplementRequestId,
      clientSubmissionIds: input.clientSubmissionIds,
      serviceMarker: PHASE50C_CLIENT_RESPONSE_SYNC_SERVICE_MARKER,
    },
  });

  if (input.uploadedFileIds.length > 0) {
    await writeAuditLog({
      actorUserId: input.actorUserId,
      action: PHASE50C_AUDIT_ACTIONS.clientUploadLinked,
      entityType: "LegalReliabilityActionOperation",
      entityId: operation.id,
      metadata: {
        uploadedFileIds: input.uploadedFileIds,
      },
    });

    await writeAuditLog({
      actorUserId: input.actorUserId,
      action: PHASE50C_AUDIT_ACTIONS.evidenceIntakeLinked,
      entityType: "LegalReliabilityActionOperation",
      entityId: operation.id,
      metadata: {
        evidenceIntakeStatus,
        intakeLinkCount: intakeLinks.length,
      },
    });
  }

  return serializeLegalReliabilityActionOperationRow(updated);
}

export async function syncClientResponseToLegalReliabilityOperationService(
  currentUser: SessionUser,
  caseId: string,
  operationId: string,
  body: SyncClientResponseToLegalReliabilityOperationInput,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanSyncClientResponseViaApi({ actor: currentUser, canWriteCase: access.canWriteCase });

  const operation = await findLegalReliabilityActionOperationRepository(operationId);
  if (!operation || operation.caseId !== caseId) {
    throw new NotFoundError("운영 액션을 찾을 수 없습니다.");
  }

  if (operation.supplementRequestId !== body.supplementRequestId) {
    throw new NotFoundError("연결된 보완요청이 일치하지 않습니다.");
  }

  const result = await syncClientResponseToLegalReliabilityOperation({
    caseId,
    supplementRequestId: body.supplementRequestId,
    clientSubmissionIds: body.clientSubmissionIds,
    uploadedFileIds: body.uploadedFileIds,
    responseSummary: body.responseSummary,
    respondedAt: new Date(),
    actorUserId: currentUser.id,
  });

  if (!result) {
    throw new NotFoundError("연결된 Legal Reliability Action Operation을 찾을 수 없습니다.");
  }

  return result;
}

export async function syncClientResponseToLegalReliabilityOperationFromPortal(input: {
  caseId: string;
  supplementRequestId: string;
  clientSubmissionIds: string[];
  uploadedFileIds: string[];
  responseSummary?: string;
  respondedAt: Date;
  actorUserId: string;
}) {
  return syncClientResponseToLegalReliabilityOperation(input);
}
