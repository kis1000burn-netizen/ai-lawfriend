import { prisma } from "@/lib/prisma";
import type { LitigationDocumentIntelligenceReviewPhase } from "@prisma/client";
import { loadPortalReviewSources } from "@/features/client-portal/client-portal-review-candidate.service";

export async function findReviewDecisionsByCaseId(caseId: string) {
  return prisma.litigationDocumentIntelligenceReviewDecision.findMany({
    where: { caseId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function findReviewDecisionByCaseAndItemId(
  caseId: string,
  itemId: string,
) {
  return prisma.litigationDocumentIntelligenceReviewDecision.findUnique({
    where: {
      caseId_itemId: { caseId, itemId },
    },
  });
}

export async function upsertReviewDecision(data: {
  caseId: string;
  itemId: string;
  sourcePhase: LitigationDocumentIntelligenceReviewPhase;
  sourceFileId?: string | null;
  itemCategory: string;
  aiText: string;
  reviewStatus: string;
  editedText?: string | null;
  rejectionReason?: string | null;
  reviewNote?: string | null;
  ledgerEntryJson?: unknown;
  payloadJson?: unknown;
  reviewedByUserId?: string | null;
  reviewedAt?: Date | null;
}) {
  return prisma.litigationDocumentIntelligenceReviewDecision.upsert({
    where: {
      caseId_itemId: {
        caseId: data.caseId,
        itemId: data.itemId,
      },
    },
    create: {
      caseId: data.caseId,
      itemId: data.itemId,
      sourcePhase: data.sourcePhase,
      sourceFileId: data.sourceFileId ?? null,
      itemCategory: data.itemCategory,
      aiText: data.aiText,
      reviewStatus: data.reviewStatus,
      editedText: data.editedText ?? null,
      rejectionReason: data.rejectionReason ?? null,
      reviewNote: data.reviewNote ?? null,
      ledgerEntryJson: data.ledgerEntryJson as object | undefined,
      payloadJson: data.payloadJson as object | undefined,
      reviewedByUserId: data.reviewedByUserId ?? null,
      reviewedAt: data.reviewedAt ?? null,
    },
    update: {
      reviewStatus: data.reviewStatus,
      editedText: data.editedText ?? null,
      rejectionReason: data.rejectionReason ?? null,
      reviewNote: data.reviewNote ?? null,
      ledgerEntryJson: data.ledgerEntryJson as object | undefined,
      reviewedByUserId: data.reviewedByUserId ?? null,
      reviewedAt: data.reviewedAt ?? new Date(),
    },
  });
}

export async function loadReviewQueueSourceData(caseId: string) {
  const [litigationFiles, evidenceMapping, portalSources] = await Promise.all([
    prisma.litigationUploadedFile.findMany({
      where: { caseId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        originalFileName: true,
        analyses: {
          orderBy: { revision: "desc" },
          take: 1,
          select: { analysisStatus: true, analysisJson: true },
        },
        opponentBriefAnalyses: {
          orderBy: { revision: "desc" },
          take: 1,
          select: { analysisStatus: true, analysisJson: true },
        },
      },
    }),
    prisma.litigationEvidenceMapping.findFirst({
      where: { caseId, mappingStatus: "AI_MAPPED" },
      orderBy: { revision: "desc" },
      select: { mappingJson: true },
    }),
    loadPortalReviewSources(caseId),
  ]);

  const decisions = await findReviewDecisionsByCaseId(caseId);

  return { litigationFiles, evidenceMapping, decisions, portalSources };
}
