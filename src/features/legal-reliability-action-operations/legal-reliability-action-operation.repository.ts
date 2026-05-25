import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ListLegalReliabilityActionOperationsQuery } from "./legal-reliability-action-operation.schema";

export async function createLegalReliabilityActionOperationRepository(input: {
  caseId: string;
  tenantId?: string | null;
  sourcePhase: string;
  sourceActionCandidateId: string;
  supplementRequestId?: string | null;
  operationType: string;
  status: string;
  priority: string;
  slaStatus: string;
  lawyerFacingTitle: string;
  sourceLabel: string;
}) {
  return prisma.legalReliabilityActionOperation.create({
    data: {
      caseId: input.caseId,
      tenantId: input.tenantId ?? null,
      sourcePhase: input.sourcePhase,
      sourceActionCandidateId: input.sourceActionCandidateId,
      supplementRequestId: input.supplementRequestId ?? null,
      operationType: input.operationType,
      status: input.status,
      priority: input.priority,
      slaStatus: input.slaStatus,
      lawyerFacingTitle: input.lawyerFacingTitle,
      sourceLabel: input.sourceLabel,
    },
  });
}

export async function findLegalReliabilityActionOperationByCandidateIdRepository(
  sourceActionCandidateId: string,
) {
  return prisma.legalReliabilityActionOperation.findUnique({
    where: { sourceActionCandidateId },
  });
}

export async function findLegalReliabilityActionOperationRepository(operationId: string) {
  return prisma.legalReliabilityActionOperation.findUnique({
    where: { id: operationId },
  });
}

export async function listLegalReliabilityActionOperationsRepository(
  caseId: string,
  filters?: ListLegalReliabilityActionOperationsQuery,
) {
  const where: Prisma.LegalReliabilityActionOperationWhereInput = { caseId };

  if (filters?.assignedToUserId) where.assignedToUserId = filters.assignedToUserId;
  if (filters?.priority) where.priority = filters.priority;
  if (filters?.slaStatus) where.slaStatus = filters.slaStatus;
  if (filters?.status) where.status = filters.status;
  if (filters?.dueBefore || filters?.dueAfter) {
    where.dueAt = {};
    if (filters.dueBefore) where.dueAt.lte = new Date(filters.dueBefore);
    if (filters.dueAfter) where.dueAt.gte = new Date(filters.dueAfter);
  }
  if (filters?.hasClientResponse === true) {
    where.clientResponseReceivedAt = { not: null };
  }
  if (filters?.hasClientResponse === false) {
    where.clientResponseReceivedAt = null;
  }
  if (filters?.evidenceIntakeStatus) {
    where.evidenceIntakeStatus = filters.evidenceIntakeStatus;
  }

  return prisma.legalReliabilityActionOperation.findMany({
    where,
    orderBy: [{ priority: "desc" }, { dueAt: "asc" }, { createdAt: "desc" }],
  });
}

export async function updateLegalReliabilityActionOperationAssignmentRepository(input: {
  operationId: string;
  assignedToUserId: string;
  assignedByUserId: string;
  assignedAt: Date;
  priority: string;
  status: string;
  slaStatus: string;
  slaCheckedAt: Date;
}) {
  return prisma.legalReliabilityActionOperation.update({
    where: { id: input.operationId },
    data: {
      assignedToUserId: input.assignedToUserId,
      assignedByUserId: input.assignedByUserId,
      assignedAt: input.assignedAt,
      priority: input.priority,
      status: input.status,
      slaStatus: input.slaStatus,
      slaCheckedAt: input.slaCheckedAt,
    },
  });
}

export async function updateLegalReliabilityActionOperationDueDateRepository(input: {
  operationId: string;
  dueAt: Date;
  slaStatus: string;
  slaCheckedAt: Date;
}) {
  return prisma.legalReliabilityActionOperation.update({
    where: { id: input.operationId },
    data: {
      dueAt: input.dueAt,
      slaStatus: input.slaStatus,
      slaCheckedAt: input.slaCheckedAt,
    },
  });
}

export async function countLegalReliabilityActionDecisionLedgersRepository(
  actionCandidateId: string,
) {
  return prisma.legalReliabilityActionDecisionLedger.count({
    where: { actionCandidateId },
  });
}

export async function findSupplementRequestStatusRepository(supplementRequestId: string) {
  return prisma.supplementRequest.findUnique({
    where: { id: supplementRequestId },
    select: { id: true, status: true },
  });
}

export async function findLegalReliabilityActionOperationBySupplementRequestIdRepository(
  supplementRequestId: string,
) {
  return prisma.legalReliabilityActionOperation.findFirst({
    where: { supplementRequestId },
  });
}

export async function updateLegalReliabilityActionOperationClientResponseRepository(input: {
  operationId: string;
  status: string;
  clientResponseReceivedAt: Date;
  clientResponseSummary: string | null;
  linkedClientSubmissionIds: string[];
  linkedUploadedFileIds: string[];
  linkedEvidenceIntakeIds: Prisma.InputJsonValue;
  evidenceIntakeStatus: string;
  slaStatus: string;
  slaCheckedAt: Date;
}) {
  return prisma.legalReliabilityActionOperation.update({
    where: { id: input.operationId },
    data: {
      status: input.status,
      clientResponseReceivedAt: input.clientResponseReceivedAt,
      clientResponseSummary: input.clientResponseSummary,
      linkedClientSubmissionIds: input.linkedClientSubmissionIds,
      linkedUploadedFileIds: input.linkedUploadedFileIds,
      linkedEvidenceIntakeIds: input.linkedEvidenceIntakeIds,
      evidenceIntakeStatus: input.evidenceIntakeStatus,
      slaStatus: input.slaStatus,
      slaCheckedAt: input.slaCheckedAt,
    },
  });
}

export async function updateLegalReliabilityActionOperationReviewHandoffRepository(input: {
  operationId: string;
  status: string;
  reviewHandoffJson: Prisma.InputJsonValue;
  slaStatus: string;
  slaCheckedAt: Date;
}) {
  return prisma.legalReliabilityActionOperation.update({
    where: { id: input.operationId },
    data: {
      status: input.status,
      reviewHandoffJson: input.reviewHandoffJson,
      slaStatus: input.slaStatus,
      slaCheckedAt: input.slaCheckedAt,
    },
  });
}

export async function updateLegalReliabilityActionOperationCompletionRepository(input: {
  operationId: string;
  status: string;
  lawyerReviewedAt: Date;
  completedAt: Date | null;
  completionResult: string | null;
  evidenceIntakeStatus: string;
  linkedEvidenceIntakeIds: Prisma.InputJsonValue;
  reviewHandoffJson: Prisma.InputJsonValue;
  slaStatus: string;
  slaCheckedAt: Date;
}) {
  return prisma.legalReliabilityActionOperation.update({
    where: { id: input.operationId },
    data: {
      status: input.status,
      lawyerReviewedAt: input.lawyerReviewedAt,
      completedAt: input.completedAt,
      completionResult: input.completionResult,
      evidenceIntakeStatus: input.evidenceIntakeStatus,
      linkedEvidenceIntakeIds: input.linkedEvidenceIntakeIds,
      reviewHandoffJson: input.reviewHandoffJson,
      slaStatus: input.slaStatus,
      slaCheckedAt: input.slaCheckedAt,
    },
  });
}

export async function findUsersByIdsRepository(userIds: string[]) {
  if (userIds.length === 0) return [];
  return prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, role: true },
  });
}
