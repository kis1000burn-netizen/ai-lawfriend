import { prisma } from "@/lib/prisma";
import {
  findLatestOpponentBriefAnalysis,
} from "./opponent-brief-analysis.repository";
import {
  COMMAND_CENTER_COLLABORATION_FEED_ACTIONS,
  COMMAND_CENTER_DEADLINE_FEED_ACTIONS,
  COMMAND_CENTER_SECURE_DOCUMENT_FEED_ACTIONS,
  LITIGATION_CMD_CENTER_AUDIT_ACTIONS,
  LITIGATION_CMD_CENTER_AUDIT_ENTITY_TYPE,
} from "./litigation-command-center-action-feed";
import { CLIENT_PORTAL_AUDIT_ENTITY_TYPE } from "@/features/client-portal/client-portal-audit";
import { LITIGATION_DEADLINE_REMINDER_AUDIT_ENTITY_TYPE } from "@/features/litigation-deadline-reminder/litigation-deadline-reminder-audit";
import { SECURE_DOCUMENT_DELIVERY_AUDIT_ENTITY_TYPE } from "@/features/secure-document-delivery/secure-document-delivery-audit";
import {
  buildOpponentBriefBadgeSummary,
  isOpponentBriefEligibleDocumentType,
  opponentBriefAnalysisResultSchema,
} from "./opponent-brief-analysis.schema";

export async function findCaseForCommandCenter(caseId: string) {
  return prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      title: true,
      status: true,
      opponentName: true,
      courtName: true,
    },
  });
}

export async function listLitigationDeadlinesForCase(caseId: string) {
  return prisma.litigationDeadline.findMany({
    where: { caseId },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
  });
}

export async function listLitigationTasksForCase(caseId: string) {
  return prisma.litigationTask.findMany({
    where: { caseId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function listLitigationDraftContextsForCase(caseId: string) {
  return prisma.litigationDraftContext.findMany({
    where: { caseId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listSupplementRequestsForCommandCenter(caseId: string) {
  return prisma.supplementRequest.findMany({
    where: { caseId, isDeleted: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      dueAt: true,
    },
  });
}

export async function loadOpponentBriefSummariesForCase(caseId: string) {
  const files = await prisma.litigationUploadedFile.findMany({
    where: { caseId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      originalFileName: true,
      classifications: {
        orderBy: { classifiedAt: "desc" },
        take: 1,
        select: { documentType: true },
      },
    },
  });

  const summaries = [];
  for (const file of files) {
    const documentType = file.classifications[0]?.documentType;
    if (!documentType || !isOpponentBriefEligibleDocumentType(documentType)) {
      continue;
    }

    const row = await findLatestOpponentBriefAnalysis(file.id);
    if (!row || row.analysisStatus !== "AI_ANALYZED") {
      summaries.push({
        fileId: file.id,
        fileName: file.originalFileName,
        documentType,
        analysisStatus: row?.analysisStatus ?? "PENDING",
        badgeSummaryLine: undefined,
        admissionsCount: 0,
        denialsCount: 0,
        defensesCount: 0,
        rebuttalIssuesCount: 0,
        confirmedRebuttalCount: 0,
        isAiCandidate: true,
      });
      continue;
    }

    const parsed = opponentBriefAnalysisResultSchema.safeParse(row.analysisJson);
    if (!parsed.success) {
      continue;
    }

    const data = parsed.data;
    const badge = buildOpponentBriefBadgeSummary(data);
    const confirmedRebuttalCount = data.rebuttalIssueCandidates.filter(
      (item) =>
        item.reviewStatus === "LAWYER_CONFIRMED" ||
        item.reviewStatus === "LAWYER_CORRECTED",
    ).length;

    summaries.push({
      fileId: file.id,
      fileName: file.originalFileName,
      documentType: data.documentType,
      analysisStatus: "AI_ANALYZED",
      badgeSummaryLine: badge.badgeSummaryLine,
      admissionsCount: data.admissions.length,
      denialsCount: data.denials.length,
      defensesCount: data.defenses.length,
      rebuttalIssuesCount: data.rebuttalIssueCandidates.length,
      confirmedRebuttalCount,
      isAiCandidate: true,
    });
  }

  return summaries;
}

export async function listCommandCenterActionFeedForCase(caseId: string, limit = 12) {
  return prisma.auditLog.findMany({
    where: {
      OR: [
        {
          entityType: LITIGATION_CMD_CENTER_AUDIT_ENTITY_TYPE,
          action: { in: [...LITIGATION_CMD_CENTER_AUDIT_ACTIONS] },
          metadata: {
            path: ["caseId"],
            equals: caseId,
          },
        },
        {
          entityType: CLIENT_PORTAL_AUDIT_ENTITY_TYPE,
          action: { in: [...COMMAND_CENTER_COLLABORATION_FEED_ACTIONS] },
          metadata: {
            path: ["caseId"],
            equals: caseId,
          },
        },
        {
          entityType: LITIGATION_DEADLINE_REMINDER_AUDIT_ENTITY_TYPE,
          action: { in: [...COMMAND_CENTER_DEADLINE_FEED_ACTIONS] },
          metadata: {
            path: ["caseId"],
            equals: caseId,
          },
        },
        {
          entityType: SECURE_DOCUMENT_DELIVERY_AUDIT_ENTITY_TYPE,
          action: { in: [...COMMAND_CENTER_SECURE_DOCUMENT_FEED_ACTIONS] },
          metadata: {
            path: ["caseId"],
            equals: caseId,
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      message: true,
      entityId: true,
      createdAt: true,
    },
  });
}
