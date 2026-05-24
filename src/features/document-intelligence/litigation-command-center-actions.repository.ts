import { prisma } from "@/lib/prisma";
import type { LitigationDeadlineStatus, LitigationTaskStatus } from "@prisma/client";

export async function findLitigationTaskForCase(caseId: string, taskId: string) {
  return prisma.litigationTask.findFirst({
    where: { id: taskId, caseId },
  });
}

export async function updateLitigationTaskStatus(
  taskId: string,
  status: LitigationTaskStatus,
) {
  return prisma.litigationTask.update({
    where: { id: taskId },
    data: { status },
  });
}

export async function findLitigationDeadlineForCase(
  caseId: string,
  deadlineId: string,
) {
  return prisma.litigationDeadline.findFirst({
    where: { id: deadlineId, caseId },
  });
}

export async function updateLitigationDeadlineRecord(
  deadlineId: string,
  data: {
    status?: LitigationDeadlineStatus;
    dueAt?: Date | null;
    description?: string | null;
  },
) {
  return prisma.litigationDeadline.update({
    where: { id: deadlineId },
    data,
  });
}

export async function findLitigationDraftContextForCase(
  caseId: string,
  draftContextId: string,
) {
  return prisma.litigationDraftContext.findFirst({
    where: { id: draftContextId, caseId },
  });
}

export async function updateLitigationDraftContextStatus(
  draftContextId: string,
  status: "DRAFT" | "READY" | "ARCHIVED",
) {
  return prisma.litigationDraftContext.update({
    where: { id: draftContextId },
    data: { status },
  });
}

export async function findSupplementRequestForCase(
  caseId: string,
  requestId: string,
) {
  return prisma.supplementRequest.findFirst({
    where: { id: requestId, caseId, isDeleted: false },
    select: { id: true, caseId: true, status: true, title: true },
  });
}
