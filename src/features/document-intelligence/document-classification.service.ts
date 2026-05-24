/**
 * Phase 13-C — document classification service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  assertCanClassifyDocument,
  assertCanReadDocumentClassification,
} from "./document-classification-policy";
import { classifyLitigationDocument } from "./document-classification.classifier";
import {
  createLitigationDocumentClassification,
  findLatestClassification,
  getLatestClassificationRevision,
} from "./document-classification.repository";
import {
  auditLitigationClassifyCompleted,
  auditLitigationClassifyFailed,
  auditLitigationClassifyStarted,
} from "./document-classification-audit";
import {
  findLatestExtractedText,
  findLitigationFileById,
} from "./document-extraction.repository";
import { parseExtractedPagesFromJson } from "./document-extraction.schema";
import type { LitigationQualityFlag } from "./document-extraction-quality.types";
import {
  classificationCitationSchema,
  type LitigationClassificationResponse,
} from "./document-classification.schema";

export const PHASE13C_DOCUMENT_CLASSIFICATION_SERVICE_MARKER =
  "PHASE13C_DOCUMENT_CLASSIFICATION_SERVICE" as const;

function mapClassificationResponse(
  fileId: string,
  caseId: string,
  classification: Awaited<ReturnType<typeof findLatestClassification>>,
): LitigationClassificationResponse {
  if (!classification) {
    return {
      fileId,
      caseId,
      classificationStatus: "PENDING",
    };
  }

  if (classification.classificationStatus === "FAILED") {
    return {
      fileId,
      caseId,
      classificationStatus: "FAILED",
      errorMessage: classification.errorMessage,
      revision: classification.revision,
      classifiedAt: classification.classifiedAt.toISOString(),
    };
  }

  const citations = zSafeParseCitations(classification.citationsJson);
  const tasks = Array.isArray(classification.recommendedNextTasks)
    ? (classification.recommendedNextTasks as string[])
    : [];

  return {
    fileId,
    caseId,
    classificationStatus: classification.classificationStatus,
    documentType: classification.documentType as LitigationClassificationResponse["documentType"],
    sourceParty: classification.sourceParty,
    litigationStage: classification.litigationStage,
    sensitivityLevel: classification.sensitivityLevel,
    analysisReadiness: classification.analysisReadiness,
    confidence: classification.confidence,
    recommendedNextTasks: tasks as LitigationClassificationResponse["recommendedNextTasks"],
    citations,
    revision: classification.revision,
    classifiedAt: classification.classifiedAt.toISOString(),
    errorMessage: classification.errorMessage,
  };
}

function zSafeParseCitations(input: unknown) {
  if (!Array.isArray(input)) return [];
  const out = [];
  for (const item of input) {
    const parsed = classificationCitationSchema.safeParse(item);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

export function mapClassificationSummaryForList(
  classification: Awaited<ReturnType<typeof findLatestClassification>>,
) {
  if (!classification || classification.classificationStatus !== "CLASSIFIED") {
    return {
      classificationStatus: classification?.classificationStatus ?? "PENDING",
    };
  }

  return {
    classificationStatus: classification.classificationStatus,
    documentType: classification.documentType,
    sourceParty: classification.sourceParty,
    sensitivityLevel: classification.sensitivityLevel,
    analysisReadiness: classification.analysisReadiness,
  };
}

export async function getLitigationClassificationService(
  currentUser: SessionUser,
  caseId: string,
  fileId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReadDocumentClassification(access);

  const file = await findLitigationFileById(fileId);
  if (!file || file.caseId !== caseId) {
    throw new NotFoundError("서류·증거 파일을 찾을 수 없습니다.");
  }

  const classification = await findLatestClassification(fileId);
  return mapClassificationResponse(fileId, caseId, classification);
}

export async function classifyLitigationDocumentService(
  currentUser: SessionUser,
  caseId: string,
  fileId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanClassifyDocument(access);

  const file = await findLitigationFileById(fileId);
  if (!file || file.caseId !== caseId) {
    throw new NotFoundError("서류·증거 파일을 찾을 수 없습니다.");
  }

  if (file.extractionStatus !== "EXTRACTED") {
    throw new ValidationError(
      "텍스트 추출이 완료된 후에만 문서 분류를 실행할 수 있습니다.",
    );
  }

  const extraction = await findLatestExtractedText(fileId);
  if (!extraction) {
    throw new ValidationError("추출된 본문이 없습니다. 먼저 extract를 실행하세요.");
  }

  const latestRevision = await getLatestClassificationRevision(fileId);
  const nextRevision = latestRevision + 1;

  await auditLitigationClassifyStarted({
    actorUserId: currentUser.id,
    fileId,
    caseId,
    revision: nextRevision,
  });

  try {
    const pages = parseExtractedPagesFromJson(extraction.pagesJson);
    const qualityFlags = (extraction.qualityFlags as LitigationQualityFlag[]) ?? [];

    const result = classifyLitigationDocument({
      originalFileName: file.originalFileName,
      mimeType: file.mimeType,
      pages,
      extractionStatus: file.extractionStatus,
      extractionQualityScore: file.extractionQualityScore,
      qualityFlags,
    });

    await createLitigationDocumentClassification({
      uploadedFileId: fileId,
      revision: nextRevision,
      classificationStatus: "CLASSIFIED",
      documentType: result.documentType,
      sourceParty: result.sourceParty,
      litigationStage: result.litigationStage,
      sensitivityLevel: result.sensitivityLevel,
      analysisReadiness: result.analysisReadiness,
      confidence: result.confidence,
      recommendedNextTasks: result.recommendedNextTasks,
      citationsJson: result.citations,
    });

    await auditLitigationClassifyCompleted({
      actorUserId: currentUser.id,
      fileId,
      caseId,
      revision: nextRevision,
      documentType: result.documentType,
      confidence: result.confidence,
    });

    const saved = await findLatestClassification(fileId);
    return mapClassificationResponse(fileId, caseId, saved);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "문서 분류에 실패했습니다.";

    await createLitigationDocumentClassification({
      uploadedFileId: fileId,
      revision: nextRevision,
      classificationStatus: "FAILED",
      documentType: "OTHER",
      sourceParty: "UNKNOWN",
      litigationStage: "UNKNOWN",
      sensitivityLevel: "GENERAL",
      analysisReadiness: "UNSUPPORTED",
      confidence: 0,
      recommendedNextTasks: ["LEGAL_DOCUMENT_SUMMARIZE"],
      citationsJson: [],
      errorMessage,
    });

    await auditLitigationClassifyFailed({
      actorUserId: currentUser.id,
      fileId,
      caseId,
      revision: nextRevision,
      errorMessage,
    });

    throw new ValidationError(errorMessage);
  }
}
