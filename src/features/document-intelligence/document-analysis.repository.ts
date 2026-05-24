import { prisma } from "@/lib/prisma";
import type { LitigationDocumentAnalysisStatus } from "@prisma/client";

export async function getLatestAnalysisRevision(uploadedFileId: string) {
  const latest = await prisma.litigationDocumentAnalysis.findFirst({
    where: { uploadedFileId },
    orderBy: { revision: "desc" },
    select: { revision: true },
  });
  return latest?.revision ?? 0;
}

export async function createLitigationDocumentAnalysis(data: {
  uploadedFileId: string;
  revision: number;
  classificationRevision?: number | null;
  analysisStatus: LitigationDocumentAnalysisStatus;
  documentType: string;
  analysisJson: unknown;
  errorMessage?: string | null;
}) {
  return prisma.litigationDocumentAnalysis.create({
    data: {
      uploadedFileId: data.uploadedFileId,
      revision: data.revision,
      classificationRevision: data.classificationRevision ?? null,
      analysisStatus: data.analysisStatus,
      documentType: data.documentType,
      analysisJson: data.analysisJson as object,
      errorMessage: data.errorMessage ?? null,
    },
  });
}

export async function findLatestAnalysis(uploadedFileId: string) {
  return prisma.litigationDocumentAnalysis.findFirst({
    where: { uploadedFileId },
    orderBy: { revision: "desc" },
  });
}
