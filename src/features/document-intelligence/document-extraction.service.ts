/**
 * Phase 13-B — upload & extract service (no legal AI analysis).
 * Marker: PHASE13B_DOCUMENT_EXTRACTION_SERVICE
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  assertCanExtractDocumentIntelligence,
  assertCanReadDocumentIntelligence,
  assertCanUploadDocumentIntelligence,
} from "./document-extraction-policy";
import {
  MAX_LITIGATION_FILES_PER_CASE,
  validateLitigationUploadFile,
} from "./document-upload.schema";
import {
  readLitigationFileFromDisk,
  saveLitigationFileToDisk,
} from "./document-intelligence.storage";
import {
  countLitigationFilesByCaseId,
  createLitigationExtractedText,
  createLitigationUploadedFile,
  findLatestExtractedText,
  findLitigationFileById,
  findLitigationFilesByCaseId,
  getLatestExtractionRevision,
  updateLitigationFileExtractionStatus,
} from "./document-extraction.repository";
import { runDocumentTextExtraction } from "./document-extraction-runner";
import {
  auditLitigationExtractCompleted,
  auditLitigationExtractFailed,
  auditLitigationExtractRetry,
  auditLitigationExtractStarted,
  auditLitigationFileUpload,
} from "./document-extraction-audit";
import {
  parseExtractedPagesFromJson,
  type LitigationExtractedTextResponse,
} from "./document-extraction.schema";
import { canTriggerExtraction, isExtractionInProgress } from "./document-extraction-status";
import type { LitigationQualityFlag } from "./document-extraction-quality.types";
import { mapClassificationSummaryForList } from "./document-classification.service";
import { mapAnalysisSummaryForList } from "./document-analysis.service";
import { mapOpponentBriefSummaryForList } from "./opponent-brief-analysis.service";

function mapFileSummary(
  file: Awaited<ReturnType<typeof findLitigationFilesByCaseId>>[number],
) {
  const latest = file.extractions[0];
  const latestClassification = file.classifications[0];
  const latestAnalysis = file.analyses[0];
  const latestOpponentBriefAnalysis = file.opponentBriefAnalyses[0];
  return {
    fileId: file.id,
    caseId: file.caseId,
    originalFileName: file.originalFileName,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    extractionStatus: file.extractionStatus,
    extractionQualityScore: file.extractionQualityScore,
    pageCount: file.pageCount,
    createdAt: file.createdAt.toISOString(),
    latestRevision: latest?.revision ?? null,
    extractedAt: latest?.extractedAt?.toISOString() ?? null,
    // 13-C list fields: documentType, sourceParty, sensitivityLevel, analysisReadiness
    ...mapClassificationSummaryForList(latestClassification ?? null),
    // 13-D list fields: analysisStatus, claimCandidateCount, riskSignalCount
    ...mapAnalysisSummaryForList(latestAnalysis ?? null),
    // 13-E list fields: opponent brief badge + counts
    ...mapOpponentBriefSummaryForList(latestOpponentBriefAnalysis ?? null),
  };
}

function buildExtractedTextResponse(
  file: NonNullable<Awaited<ReturnType<typeof findLitigationFileById>>>,
  extraction: Awaited<ReturnType<typeof findLatestExtractedText>> | null,
  includePages: boolean,
): LitigationExtractedTextResponse {
  const base: LitigationExtractedTextResponse = {
    fileId: file.id,
    caseId: file.caseId,
    originalFileName: file.originalFileName,
    mimeType: file.mimeType,
    extractionStatus: file.extractionStatus,
    pageCount: file.pageCount ?? 0,
    extractionQualityScore: file.extractionQualityScore,
    errorMessage: extraction?.errorMessage ?? null,
  };

  if (!extraction) return base;

  const pages = includePages
    ? parseExtractedPagesFromJson(extraction.pagesJson)
    : undefined;

  return {
    ...base,
    revision: extraction.revision,
    extractionMethod: extraction.extractionMethod,
    qualityFlags: (extraction.qualityFlags as LitigationQualityFlag[]) ?? [],
    pages,
  };
}

export async function uploadLitigationDocumentService(
  currentUser: SessionUser,
  caseId: string,
  file: File,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanUploadDocumentIntelligence(access);

  try {
    validateLitigationUploadFile(file);
  } catch (error) {
    throw new ValidationError(
      error instanceof Error ? error.message : "파일 검증에 실패했습니다.",
    );
  }

  const count = await countLitigationFilesByCaseId(caseId);
  if (count >= MAX_LITIGATION_FILES_PER_CASE) {
    throw new ValidationError(
      `사건당 서류·증거 파일은 최대 ${MAX_LITIGATION_FILES_PER_CASE}개까지 등록할 수 있습니다.`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await saveLitigationFileToDisk({
    caseId,
    originalFileName: file.name,
    buffer,
  });

  const created = await createLitigationUploadedFile({
    caseId,
    uploaderUserId: currentUser.id,
    originalFileName: file.name,
    storedName: stored.storedName,
    mimeType: file.type,
    sizeBytes: file.size,
    storagePath: stored.storagePath,
    sha256: stored.sha256,
  });

  await auditLitigationFileUpload({
    actorUserId: currentUser.id,
    fileId: created.id,
    caseId,
    originalFileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  });

  return mapFileSummary({
    ...created,
    extractions: [],
    classifications: [],
    analyses: [],
    opponentBriefAnalyses: [],
  });
}

export async function listLitigationDocumentsService(
  currentUser: SessionUser,
  caseId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReadDocumentIntelligence(access);

  const files = await findLitigationFilesByCaseId(caseId);
  return files.map(mapFileSummary);
}

export async function getLitigationDocumentService(
  currentUser: SessionUser,
  caseId: string,
  fileId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReadDocumentIntelligence(access);

  const file = await findLitigationFileById(fileId);
  if (!file || file.caseId !== caseId) {
    throw new NotFoundError("서류·증거 파일을 찾을 수 없습니다.");
  }

  return mapFileSummary(file);
}

export async function getLitigationExtractedTextService(
  currentUser: SessionUser,
  caseId: string,
  fileId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReadDocumentIntelligence(access);

  const file = await findLitigationFileById(fileId);
  if (!file || file.caseId !== caseId) {
    throw new NotFoundError("서류·증거 파일을 찾을 수 없습니다.");
  }

  const extraction = await findLatestExtractedText(fileId);
  return buildExtractedTextResponse(file, extraction, true);
}

export async function extractLitigationDocumentService(
  currentUser: SessionUser,
  caseId: string,
  fileId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanExtractDocumentIntelligence(access);

  const file = await findLitigationFileById(fileId);
  if (!file || file.caseId !== caseId) {
    throw new NotFoundError("서류·증거 파일을 찾을 수 없습니다.");
  }

  if (isExtractionInProgress(file.extractionStatus)) {
    throw new ValidationError("텍스트 추출이 이미 진행 중입니다.");
  }

  if (!canTriggerExtraction(file.extractionStatus)) {
    throw new ForbiddenError("현재 상태에서는 추출을 실행할 수 없습니다.");
  }

  const latestRevision = await getLatestExtractionRevision(fileId);
  const nextRevision = latestRevision + 1;

  if (latestRevision > 0) {
    await auditLitigationExtractRetry({
      actorUserId: currentUser.id,
      fileId,
      caseId,
      nextRevision,
    });
  }

  await updateLitigationFileExtractionStatus(fileId, {
    extractionStatus: "EXTRACTING",
  });

  await auditLitigationExtractStarted({
    actorUserId: currentUser.id,
    fileId,
    caseId,
    revision: nextRevision,
  });

  try {
    const { buffer } = await readLitigationFileFromDisk(file.storagePath);
    const result = await runDocumentTextExtraction({
      mimeType: file.mimeType,
      buffer,
    });

    await createLitigationExtractedText({
      uploadedFileId: fileId,
      revision: nextRevision,
      extractionMethod: result.extractionMethod,
      pagesJson: result.pages,
      qualityScore: result.qualityScore,
      qualityFlags: result.qualityFlags,
    });

    await updateLitigationFileExtractionStatus(fileId, {
      extractionStatus: "EXTRACTED",
      extractionQualityScore: result.qualityScore,
      pageCount: result.pages.length,
    });

    await auditLitigationExtractCompleted({
      actorUserId: currentUser.id,
      fileId,
      caseId,
      revision: nextRevision,
      pageCount: result.pages.length,
      qualityScore: result.qualityScore,
    });

    const updated = await findLitigationFileById(fileId);
    const extraction = await findLatestExtractedText(fileId);
    if (!updated) throw new NotFoundError("파일을 찾을 수 없습니다.");

    return buildExtractedTextResponse(updated, extraction, true);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "텍스트 추출에 실패했습니다.";

    await createLitigationExtractedText({
      uploadedFileId: fileId,
      revision: nextRevision,
      extractionMethod: "NATIVE",
      pagesJson: [{ pageNumber: 1, text: "", confidence: 0 }],
      qualityScore: 0,
      qualityFlags: ["EMPTY_TEXT"],
      errorMessage,
    });

    await updateLitigationFileExtractionStatus(fileId, {
      extractionStatus: "FAILED",
      extractionQualityScore: 0,
      pageCount: 0,
    });

    await auditLitigationExtractFailed({
      actorUserId: currentUser.id,
      fileId,
      caseId,
      revision: nextRevision,
      errorMessage,
    });

    throw new ValidationError(errorMessage);
  }
}
