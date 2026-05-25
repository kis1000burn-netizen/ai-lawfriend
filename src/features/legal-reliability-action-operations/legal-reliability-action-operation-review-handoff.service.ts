/**
 * Product Phase 50-C — Lawyer review queue handoff.
 */
import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { NotFoundError } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit-log";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { assertCanHandoffLegalReliabilityActionOperationReview } from "./legal-reliability-action-operation-client-response.policy";
import { deriveStatusAfterLawyerReviewHandoff } from "./legal-reliability-action-operation-status-sync.service";
import {
  findLegalReliabilityActionOperationRepository,
  updateLegalReliabilityActionOperationReviewHandoffRepository,
} from "./legal-reliability-action-operation.repository";
import { computeLegalReliabilityActionSlaStatus } from "./legal-reliability-action-operation-sla.service";
import type {
  HandoffLegalReliabilityActionOperationReviewInput,
  LegalReliabilityActionResponseReviewItem,
} from "./legal-reliability-action-operation.schema";
import { serializeLegalReliabilityActionOperationRow } from "./legal-reliability-action-operation-serializer";

export const PHASE50C_REVIEW_HANDOFF_SERVICE_MARKER =
  "phase50c-legal-reliability-action-operation-review-handoff-service" as const;

export const PHASE50C_REVIEW_HANDOFF_AUDIT_ACTION =
  "LEGAL_RELIABILITY_ACTION_LAWYER_REVIEW_HANDOFF_CREATED" as const;

function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function buildReviewHandoffItem(input: {
  caseId: string;
  operationId: string;
  supplementRequestId: string;
  reviewType: LegalReliabilityActionResponseReviewItem["reviewType"];
  linkedUploadedFileIds: string[];
  linkedClientSubmissionIds: string[];
}): LegalReliabilityActionResponseReviewItem {
  return {
    id: randomUUID(),
    caseId: input.caseId,
    operationId: input.operationId,
    supplementRequestId: input.supplementRequestId,
    reviewType: input.reviewType,
    status: "PENDING_LAWYER_REVIEW",
    linkedUploadedFileIds: input.linkedUploadedFileIds,
    linkedClientSubmissionIds: input.linkedClientSubmissionIds,
    clientVisible: false,
    downstreamAllowed: false,
  };
}

export async function handoffLegalReliabilityActionOperationToLawyerReviewService(
  currentUser: SessionUser,
  caseId: string,
  operationId: string,
  body: HandoffLegalReliabilityActionOperationReviewInput = {},
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  const operation = await findLegalReliabilityActionOperationRepository(operationId);

  if (!operation || operation.caseId !== caseId) {
    throw new NotFoundError("운영 액션을 찾을 수 없습니다.");
  }

  const linkedClientSubmissionIds = parseStringArray(operation.linkedClientSubmissionIds);
  const linkedUploadedFileIds = parseStringArray(operation.linkedUploadedFileIds);

  assertCanHandoffLegalReliabilityActionOperationReview({
    actor: currentUser,
    canWriteCase: access.canWriteCase,
    operationStatus: operation.status,
    linkedClientSubmissionIds,
  });

  if (!operation.supplementRequestId) {
    throw new NotFoundError("보완요청 연결이 없습니다.");
  }

  const reviewType =
    body.reviewType ??
    (linkedUploadedFileIds.length > 0
      ? "CLIENT_UPLOADED_EVIDENCE_REVIEW"
      : "CLIENT_RESPONSE_REVIEW");

  const reviewItem = buildReviewHandoffItem({
    caseId,
    operationId,
    supplementRequestId: operation.supplementRequestId,
    reviewType,
    linkedUploadedFileIds,
    linkedClientSubmissionIds,
  });

  const now = new Date();
  const nextStatus = deriveStatusAfterLawyerReviewHandoff();
  const slaStatus = computeLegalReliabilityActionSlaStatus({
    assignedToUserId: operation.assignedToUserId,
    dueAt: operation.dueAt,
    now,
    status: nextStatus,
    clientResponseReceivedAt: operation.clientResponseReceivedAt,
    lawyerReviewedAt: operation.lawyerReviewedAt,
  });

  const updated = await updateLegalReliabilityActionOperationReviewHandoffRepository({
    operationId,
    status: nextStatus,
    reviewHandoffJson: reviewItem as unknown as Prisma.InputJsonValue,
    slaStatus,
    slaCheckedAt: now,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: PHASE50C_REVIEW_HANDOFF_AUDIT_ACTION,
    entityType: "LegalReliabilityActionOperation",
    entityId: operationId,
    message: "Legal Reliability action operation handed off to lawyer review queue",
    metadata: {
      reviewItemId: reviewItem.id,
      reviewType: reviewItem.reviewType,
      downstreamAllowed: false,
      serviceMarker: PHASE50C_REVIEW_HANDOFF_SERVICE_MARKER,
    },
  });

  return {
    operation: serializeLegalReliabilityActionOperationRow(updated),
    reviewItem,
  };
}
