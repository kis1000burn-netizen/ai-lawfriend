/**
 * Phase 14-D — batch repository for Command Center list summaries.
 */
import { prisma } from "@/lib/prisma";
import { isOpponentBriefEligibleDocumentType } from "./opponent-brief-analysis.schema";

export async function loadCommandCenterListBatchFacts(caseIds: string[]) {
  if (caseIds.length === 0) {
    return {
      interviewCompletedCaseIds: new Set<string>(),
      taskCounts: new Map<string, number>(),
      nextDeadlines: new Map<string, { title: string; dueAt: Date }>(),
      reviewPendingCounts: new Map<string, number>(),
      supplementDraftCounts: new Map<string, number>(),
      supplementSentCounts: new Map<string, number>(),
      supplementRespondedCounts: new Map<string, number>(),
      opponentBriefAnalyzedCounts: new Map<string, number>(),
      opponentBriefFileCounts: new Map<string, number>(),
      opsSyncCaseIds: new Set<string>(),
      evidenceMappingCaseIds: new Set<string>(),
      litigationFileCaseIds: new Set<string>(),
    };
  }

  const [
    completedInterviews,
    taskGroups,
    openDeadlines,
    reviewPendingGroups,
    supplements,
    litigationFiles,
    opponentAnalyses,
    opsLinks,
    evidenceMappings,
  ] = await Promise.all([
    prisma.interview.findMany({
      where: { caseId: { in: caseIds }, status: "COMPLETED" },
      select: { caseId: true },
      distinct: ["caseId"],
    }),
    prisma.litigationTask.groupBy({
      by: ["caseId"],
      where: {
        caseId: { in: caseIds },
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
      _count: { _all: true },
    }),
    prisma.litigationDeadline.findMany({
      where: {
        caseId: { in: caseIds },
        status: "OPEN",
        dueAt: { not: null },
      },
      orderBy: [{ dueAt: "asc" }, { createdAt: "asc" }],
      select: { caseId: true, title: true, dueAt: true },
    }),
    prisma.litigationDocumentIntelligenceReviewDecision.groupBy({
      by: ["caseId"],
      where: {
        caseId: { in: caseIds },
        reviewStatus: "NEEDS_LAWYER_REVIEW",
      },
      _count: { _all: true },
    }),
    prisma.supplementRequest.findMany({
      where: { caseId: { in: caseIds }, isDeleted: false },
      select: { caseId: true, status: true },
    }),
    prisma.litigationUploadedFile.findMany({
      where: { caseId: { in: caseIds } },
      select: {
        caseId: true,
        id: true,
        classifications: {
          orderBy: { classifiedAt: "desc" },
          take: 1,
          select: { documentType: true },
        },
      },
    }),
    prisma.litigationOpponentBriefAnalysis.findMany({
      where: {
        uploadedFile: { caseId: { in: caseIds } },
        analysisStatus: "AI_ANALYZED",
      },
      select: {
        uploadedFileId: true,
        uploadedFile: {
          select: {
            caseId: true,
            classifications: {
              orderBy: { classifiedAt: "desc" },
              take: 1,
              select: { documentType: true },
            },
          },
        },
      },
      orderBy: { analyzedAt: "desc" },
    }),
    prisma.litigationDocumentIntelligenceOpsLink.findMany({
      where: { caseId: { in: caseIds } },
      select: { caseId: true },
      distinct: ["caseId"],
    }),
    prisma.litigationEvidenceMapping.findMany({
      where: {
        caseId: { in: caseIds },
        mappingStatus: { not: "PENDING" },
      },
      select: { caseId: true },
      distinct: ["caseId"],
    }),
  ]);

  const interviewCompletedCaseIds = new Set(completedInterviews.map((r) => r.caseId));

  const taskCounts = new Map<string, number>();
  for (const row of taskGroups) {
    taskCounts.set(row.caseId, row._count._all);
  }

  const nextDeadlines = new Map<string, { title: string; dueAt: Date }>();
  for (const row of openDeadlines) {
    if (!row.dueAt || nextDeadlines.has(row.caseId)) continue;
    nextDeadlines.set(row.caseId, { title: row.title, dueAt: row.dueAt });
  }

  const reviewPendingCounts = new Map<string, number>();
  for (const row of reviewPendingGroups) {
    reviewPendingCounts.set(row.caseId, row._count._all);
  }

  const supplementDraftCounts = new Map<string, number>();
  const supplementSentCounts = new Map<string, number>();
  const supplementRespondedCounts = new Map<string, number>();
  for (const row of supplements) {
    if (row.status === "DRAFT") {
      supplementDraftCounts.set(row.caseId, (supplementDraftCounts.get(row.caseId) ?? 0) + 1);
    }
    if (["SENT", "CLIENT_VIEWED"].includes(row.status)) {
      supplementSentCounts.set(row.caseId, (supplementSentCounts.get(row.caseId) ?? 0) + 1);
    }
    if (row.status === "CLIENT_RESPONDED") {
      supplementRespondedCounts.set(
        row.caseId,
        (supplementRespondedCounts.get(row.caseId) ?? 0) + 1,
      );
    }
  }

  const litigationFileCaseIds = new Set(litigationFiles.map((f) => f.caseId));

  const eligibleBriefFiles = litigationFiles.filter((f) => {
    const documentType = f.classifications[0]?.documentType;
    return documentType && isOpponentBriefEligibleDocumentType(documentType);
  });
  const opponentBriefFileCounts = new Map<string, number>();
  for (const file of eligibleBriefFiles) {
    opponentBriefFileCounts.set(
      file.caseId,
      (opponentBriefFileCounts.get(file.caseId) ?? 0) + 1,
    );
  }

  const analyzedFileIds = new Set<string>();
  const opponentBriefAnalyzedCounts = new Map<string, number>();
  for (const row of opponentAnalyses) {
    if (analyzedFileIds.has(row.uploadedFileId)) continue;
    analyzedFileIds.add(row.uploadedFileId);
    const caseId = row.uploadedFile.caseId;
    opponentBriefAnalyzedCounts.set(
      caseId,
      (opponentBriefAnalyzedCounts.get(caseId) ?? 0) + 1,
    );
  }

  return {
    interviewCompletedCaseIds,
    taskCounts,
    nextDeadlines,
    reviewPendingCounts,
    supplementDraftCounts,
    supplementSentCounts,
    supplementRespondedCounts,
    opponentBriefAnalyzedCounts,
    opponentBriefFileCounts,
    opsSyncCaseIds: new Set(opsLinks.map((r) => r.caseId)),
    evidenceMappingCaseIds: new Set(evidenceMappings.map((r) => r.caseId)),
    litigationFileCaseIds,
  };
}
