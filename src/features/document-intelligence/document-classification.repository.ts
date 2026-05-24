import { prisma } from "@/lib/prisma";
import type {
  LitigationAnalysisReadiness,
  LitigationClassificationStatus,
  LitigationSensitivityLevel,
  LitigationSourceParty,
  LitigationStage,
} from "@prisma/client";

export async function getLatestClassificationRevision(uploadedFileId: string) {
  const latest = await prisma.litigationDocumentClassification.findFirst({
    where: { uploadedFileId },
    orderBy: { revision: "desc" },
    select: { revision: true },
  });
  return latest?.revision ?? 0;
}

export async function createLitigationDocumentClassification(data: {
  uploadedFileId: string;
  revision: number;
  classificationStatus: LitigationClassificationStatus;
  documentType: string;
  sourceParty: LitigationSourceParty;
  litigationStage: LitigationStage;
  sensitivityLevel: LitigationSensitivityLevel;
  analysisReadiness: LitigationAnalysisReadiness;
  confidence: number;
  recommendedNextTasks: unknown;
  citationsJson: unknown;
  errorMessage?: string | null;
}) {
  return prisma.litigationDocumentClassification.create({
    data: {
      uploadedFileId: data.uploadedFileId,
      revision: data.revision,
      classificationStatus: data.classificationStatus,
      documentType: data.documentType,
      sourceParty: data.sourceParty,
      litigationStage: data.litigationStage,
      sensitivityLevel: data.sensitivityLevel,
      analysisReadiness: data.analysisReadiness,
      confidence: data.confidence,
      recommendedNextTasks: data.recommendedNextTasks as object,
      citationsJson: data.citationsJson as object,
      errorMessage: data.errorMessage ?? null,
    },
  });
}

export async function findLatestClassification(uploadedFileId: string) {
  return prisma.litigationDocumentClassification.findFirst({
    where: { uploadedFileId },
    orderBy: { revision: "desc" },
  });
}
