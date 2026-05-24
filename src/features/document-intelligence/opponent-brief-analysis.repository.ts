import { prisma } from "@/lib/prisma";
import type { LitigationOpponentBriefAnalysisStatus } from "@prisma/client";

export async function getLatestOpponentBriefAnalysisRevision(
  uploadedFileId: string,
) {
  const latest = await prisma.litigationOpponentBriefAnalysis.findFirst({
    where: { uploadedFileId },
    orderBy: { revision: "desc" },
    select: { revision: true },
  });
  return latest?.revision ?? 0;
}

export async function createLitigationOpponentBriefAnalysis(data: {
  uploadedFileId: string;
  revision: number;
  documentAnalysisRevision?: number | null;
  analysisStatus: LitigationOpponentBriefAnalysisStatus;
  documentType: string;
  analysisJson: unknown;
  errorMessage?: string | null;
}) {
  return prisma.litigationOpponentBriefAnalysis.create({
    data: {
      uploadedFileId: data.uploadedFileId,
      revision: data.revision,
      documentAnalysisRevision: data.documentAnalysisRevision ?? null,
      analysisStatus: data.analysisStatus,
      documentType: data.documentType,
      analysisJson: data.analysisJson as object,
      errorMessage: data.errorMessage ?? null,
    },
  });
}

export async function findLatestOpponentBriefAnalysis(uploadedFileId: string) {
  return prisma.litigationOpponentBriefAnalysis.findFirst({
    where: { uploadedFileId },
    orderBy: { revision: "desc" },
  });
}
