import type { LitigationExtractionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function countLitigationFilesByCaseId(caseId: string) {
  return prisma.litigationUploadedFile.count({ where: { caseId } });
}

export async function createLitigationUploadedFile(data: {
  caseId: string;
  uploaderUserId: string;
  originalFileName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  sha256: string;
}) {
  return prisma.litigationUploadedFile.create({ data });
}

export async function findLitigationFilesByCaseId(caseId: string) {
  return prisma.litigationUploadedFile.findMany({
    where: { caseId },
    orderBy: { createdAt: "desc" },
    include: {
      extractions: {
        orderBy: { revision: "desc" },
        take: 1,
      },
      classifications: {
        orderBy: { revision: "desc" },
        take: 1,
      },
      analyses: {
        orderBy: { revision: "desc" },
        take: 1,
      },
      opponentBriefAnalyses: {
        orderBy: { revision: "desc" },
        take: 1,
      },
    },
  });
}

export async function findLitigationFileById(fileId: string) {
  return prisma.litigationUploadedFile.findUnique({
    where: { id: fileId },
    include: {
      extractions: {
        orderBy: { revision: "desc" },
        take: 1,
      },
      classifications: {
        orderBy: { revision: "desc" },
        take: 1,
      },
      analyses: {
        orderBy: { revision: "desc" },
        take: 1,
      },
      opponentBriefAnalyses: {
        orderBy: { revision: "desc" },
        take: 1,
      },
    },
  });
}

export async function updateLitigationFileExtractionStatus(
  fileId: string,
  data: {
    extractionStatus: LitigationExtractionStatus;
    extractionQualityScore?: number | null;
    pageCount?: number | null;
  },
) {
  return prisma.litigationUploadedFile.update({
    where: { id: fileId },
    data,
  });
}

export async function getLatestExtractionRevision(uploadedFileId: string) {
  const latest = await prisma.litigationExtractedText.findFirst({
    where: { uploadedFileId },
    orderBy: { revision: "desc" },
    select: { revision: true },
  });
  return latest?.revision ?? 0;
}

export async function createLitigationExtractedText(data: {
  uploadedFileId: string;
  revision: number;
  extractionMethod: "NATIVE" | "OCR" | "HYBRID" | "PLAIN_TEXT";
  pagesJson: unknown;
  qualityScore: number;
  qualityFlags: unknown;
  errorMessage?: string | null;
}) {
  return prisma.litigationExtractedText.create({
    data: {
      uploadedFileId: data.uploadedFileId,
      revision: data.revision,
      extractionMethod: data.extractionMethod,
      pagesJson: data.pagesJson as object,
      qualityScore: data.qualityScore,
      qualityFlags: data.qualityFlags as object,
      errorMessage: data.errorMessage ?? null,
    },
  });
}

export async function findLatestExtractedText(uploadedFileId: string) {
  return prisma.litigationExtractedText.findFirst({
    where: { uploadedFileId },
    orderBy: { revision: "desc" },
  });
}

export async function findExtractedTextByRevision(
  uploadedFileId: string,
  revision: number,
) {
  return prisma.litigationExtractedText.findUnique({
    where: {
      uploadedFileId_revision: { uploadedFileId, revision },
    },
  });
}
