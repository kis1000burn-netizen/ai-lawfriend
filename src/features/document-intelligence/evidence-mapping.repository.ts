import { prisma } from "@/lib/prisma";
import type { LitigationEvidenceMappingStatus } from "@prisma/client";

export async function getLatestEvidenceMappingRevision(caseId: string) {
  const latest = await prisma.litigationEvidenceMapping.findFirst({
    where: { caseId },
    orderBy: { revision: "desc" },
    select: { revision: true },
  });
  return latest?.revision ?? 0;
}

export async function createLitigationEvidenceMapping(data: {
  caseId: string;
  revision: number;
  mappingStatus: LitigationEvidenceMappingStatus;
  mappingJson: unknown;
  errorMessage?: string | null;
}) {
  return prisma.litigationEvidenceMapping.create({
    data: {
      caseId: data.caseId,
      revision: data.revision,
      mappingStatus: data.mappingStatus,
      mappingJson: data.mappingJson as object,
      errorMessage: data.errorMessage ?? null,
    },
  });
}

export async function findLatestEvidenceMapping(caseId: string) {
  return prisma.litigationEvidenceMapping.findFirst({
    where: { caseId },
    orderBy: { revision: "desc" },
    include: {
      reviews: true,
    },
  });
}

export async function findEvidenceMappingById(mappingId: string) {
  return prisma.litigationEvidenceMapping.findUnique({
    where: { id: mappingId },
    include: { reviews: true },
  });
}

export async function upsertEvidenceMappingItemReview(data: {
  mappingId: string;
  itemId: string;
  itemKind: string;
  reviewStatus: string;
  reviewedByUserId: string;
  reviewNote?: string | null;
}) {
  return prisma.litigationEvidenceMappingItemReview.upsert({
    where: {
      mappingId_itemId: {
        mappingId: data.mappingId,
        itemId: data.itemId,
      },
    },
    create: {
      mappingId: data.mappingId,
      itemId: data.itemId,
      itemKind: data.itemKind,
      reviewStatus: data.reviewStatus,
      reviewedByUserId: data.reviewedByUserId,
      reviewNote: data.reviewNote ?? null,
    },
    update: {
      itemKind: data.itemKind,
      reviewStatus: data.reviewStatus,
      reviewedByUserId: data.reviewedByUserId,
      reviewNote: data.reviewNote ?? null,
      reviewedAt: new Date(),
    },
  });
}

export async function loadEvidenceMappingCaseContext(caseId: string) {
  const [
    caseRow,
    litigationFiles,
    interviews,
    attachments,
    supplementRequests,
    intelligenceSnapshot,
  ] = await Promise.all([
    prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        opponentName: true,
      },
    }),
    prisma.litigationUploadedFile.findMany({
      where: { caseId },
      orderBy: { createdAt: "desc" },
      include: {
        extractions: { orderBy: { revision: "desc" }, take: 1 },
        classifications: { orderBy: { revision: "desc" }, take: 1 },
        analyses: { orderBy: { revision: "desc" }, take: 1 },
        opponentBriefAnalyses: { orderBy: { revision: "desc" }, take: 1 },
      },
    }),
    prisma.interview.findMany({
      where: { caseId },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: { id: true, answersJson: true, status: true },
    }),
    prisma.caseAttachment.findMany({
      where: { caseId, status: "ACTIVE", deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        originalName: true,
        category: true,
        mimeType: true,
      },
    }),
    prisma.supplementRequest.findMany({
      where: {
        caseId,
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      include: {
        items: {
          select: {
            id: true,
            itemLabel: true,
            itemPrompt: true,
            itemType: true,
          },
        },
      },
    }),
    prisma.caseIntelligenceSnapshot.findFirst({
      where: { caseId },
      orderBy: { generatedAt: "desc" },
      select: { id: true, contentJson: true, caseSummaryAiMode: true },
    }),
  ]);

  return {
    caseRow,
    litigationFiles,
    interviews,
    attachments,
    supplementRequests,
    intelligenceSnapshot,
  };
}
