import { prisma } from "@/lib/prisma";
import type {
  LitigationOpsLinkTargetType,
  LitigationTaskKind,
} from "@prisma/client";

export async function getLatestOpsSyncRevision(caseId: string) {
  const latest = await prisma.litigationDocumentIntelligenceOpsSync.findFirst({
    where: { caseId },
    orderBy: { revision: "desc" },
    select: { revision: true },
  });
  return latest?.revision ?? 0;
}

export async function createOpsSyncRecord(data: {
  caseId: string;
  revision: number;
  syncJson: unknown;
  syncedByUserId?: string | null;
}) {
  return prisma.litigationDocumentIntelligenceOpsSync.create({
    data: {
      caseId: data.caseId,
      revision: data.revision,
      syncJson: data.syncJson as object,
      syncedByUserId: data.syncedByUserId ?? null,
    },
  });
}

export async function findLatestOpsSync(caseId: string) {
  return prisma.litigationDocumentIntelligenceOpsSync.findFirst({
    where: { caseId },
    orderBy: { revision: "desc" },
  });
}

export async function findOpsLink(
  caseId: string,
  sourceItemId: string,
  targetType: LitigationOpsLinkTargetType,
) {
  return prisma.litigationDocumentIntelligenceOpsLink.findUnique({
    where: {
      caseId_sourceItemId_targetType: {
        caseId,
        sourceItemId,
        targetType,
      },
    },
  });
}

export async function createOpsLink(data: {
  caseId: string;
  reviewDecisionId: string;
  sourceItemId: string;
  targetType: LitigationOpsLinkTargetType;
  targetId: string;
}) {
  return prisma.litigationDocumentIntelligenceOpsLink.create({ data });
}

export async function createLitigationDeadlineRecord(data: {
  caseId: string;
  title: string;
  description?: string | null;
  candidateDueText?: string | null;
  reviewDecisionId?: string | null;
  sourceItemId: string;
  sourcePhase?: string | null;
  createdByUserId?: string | null;
}) {
  return prisma.litigationDeadline.create({ data });
}

export async function createLitigationTaskRecord(data: {
  caseId: string;
  title: string;
  description?: string | null;
  taskKind: LitigationTaskKind;
  reviewDecisionId?: string | null;
  sourceItemId: string;
  sourcePhase?: string | null;
  assigneeUserId?: string | null;
  createdByUserId?: string | null;
}) {
  return prisma.litigationTask.create({ data });
}

export async function createLitigationDraftContextRecord(data: {
  caseId: string;
  title: string;
  contextJson: unknown;
  reviewDecisionIds: string[];
  createdByUserId?: string | null;
}) {
  return prisma.litigationDraftContext.create({
    data: {
      caseId: data.caseId,
      title: data.title,
      contextJson: data.contextJson as object,
      reviewDecisionIds: data.reviewDecisionIds,
      createdByUserId: data.createdByUserId ?? null,
    },
  });
}

export async function loadOpsStatusCounts(caseId: string) {
  const [
    deadlineCount,
    taskCount,
    supplementDraftCount,
    draftContextCount,
    linkedReviewDecisionCount,
  ] = await Promise.all([
    prisma.litigationDeadline.count({ where: { caseId } }),
    prisma.litigationTask.count({ where: { caseId } }),
    prisma.litigationDocumentIntelligenceOpsLink.count({
      where: { caseId, targetType: "SUPPLEMENT" },
    }),
    prisma.litigationDraftContext.count({ where: { caseId } }),
    prisma.litigationDocumentIntelligenceOpsLink.count({
      where: { caseId },
    }),
  ]);

  return {
    deadlineCount,
    taskCount,
    supplementDraftCount,
    draftContextCount,
    linkedReviewDecisionCount,
  };
}

export async function findCaseForOps(caseId: string) {
  return prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      title: true,
      ownerUserId: true,
      assignedLawyerUserId: true,
      assignedStaffUserId: true,
    },
  });
}
