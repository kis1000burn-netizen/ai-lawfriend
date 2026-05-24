/**
 * Phase 13-D — document content analysis service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  assertAnalysisReadinessGate,
  assertCanAnalyzeDocument,
  assertCanReadDocumentAnalysis,
} from "./document-analysis-policy";
import { analyzeLitigationDocumentContent } from "./document-analysis.engine";
import {
  createLitigationDocumentAnalysis,
  findLatestAnalysis,
  getLatestAnalysisRevision,
} from "./document-analysis.repository";
import {
  auditLitigationAnalyzeCompleted,
  auditLitigationAnalyzeFailed,
  auditLitigationAnalyzeStarted,
} from "./document-analysis-audit";
import { findLatestClassification } from "./document-classification.repository";
import {
  findLatestExtractedText,
  findLitigationFileById,
} from "./document-extraction.repository";
import { parseExtractedPagesFromJson } from "./document-extraction.schema";
import {
  documentAnalysisResultSchema,
  type LitigationAnalysisResponse,
} from "./document-analysis.schema";
import type { LitigationDocumentType } from "./document-intelligence-engine.schema";

export const PHASE13D_DOCUMENT_ANALYSIS_SERVICE_MARKER =
  "PHASE13D_DOCUMENT_ANALYSIS_SERVICE" as const;

function mapAnalysisResponse(
  fileId: string,
  caseId: string,
  row: Awaited<ReturnType<typeof findLatestAnalysis>>,
): LitigationAnalysisResponse {
  if (!row) {
    return { fileId, caseId, analysisStatus: "PENDING" };
  }

  if (row.analysisStatus === "FAILED") {
    return {
      fileId,
      caseId,
      analysisStatus: "FAILED",
      errorMessage: row.errorMessage,
      revision: row.revision,
      analyzedAt: row.analyzedAt.toISOString(),
    };
  }

  const parsed = documentAnalysisResultSchema.safeParse(row.analysisJson);
  if (!parsed.success) {
    return {
      fileId,
      caseId,
      analysisStatus: "FAILED",
      errorMessage: "저장된 분석 JSON이 유효하지 않습니다.",
      revision: row.revision,
    };
  }

  const data = parsed.data;
  return {
    fileId,
    caseId,
    analysisStatus: "AI_ANALYZED",
    documentType: data.documentType,
    summary: data.summary,
    claims: data.claims,
    facts: data.facts,
    requests: data.requests,
    evidenceRefs: data.evidenceRefs,
    deadlineCandidates: data.deadlineCandidates,
    legalIssueCandidates: data.legalIssueCandidates,
    riskSignals: data.riskSignals,
    revision: row.revision,
    analyzedAt: row.analyzedAt.toISOString(),
  };
}

export function mapAnalysisSummaryForList(
  row: Awaited<ReturnType<typeof findLatestAnalysis>>,
) {
  if (!row || row.analysisStatus !== "AI_ANALYZED") {
    return {
      analysisStatus: row?.analysisStatus ?? "PENDING",
    };
  }
  const parsed = documentAnalysisResultSchema.safeParse(row.analysisJson);
  if (!parsed.success) {
    return { analysisStatus: "FAILED" as const };
  }
  return {
    analysisStatus: "AI_ANALYZED" as const,
    documentAnalysisSummary: parsed.data.summary.oneLine.slice(0, 120),
    claimCandidateCount: parsed.data.claims.length,
    riskSignalCount: parsed.data.riskSignals.length,
  };
}

export async function getLitigationAnalysisService(
  currentUser: SessionUser,
  caseId: string,
  fileId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReadDocumentAnalysis(access);

  const file = await findLitigationFileById(fileId);
  if (!file || file.caseId !== caseId) {
    throw new NotFoundError("서류·증거 파일을 찾을 수 없습니다.");
  }

  const analysis = await findLatestAnalysis(fileId);
  return mapAnalysisResponse(fileId, caseId, analysis);
}

export async function analyzeLitigationDocumentService(
  currentUser: SessionUser,
  caseId: string,
  fileId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanAnalyzeDocument(access);

  const file = await findLitigationFileById(fileId);
  if (!file || file.caseId !== caseId) {
    throw new NotFoundError("서류·증거 파일을 찾을 수 없습니다.");
  }

  const classification = await findLatestClassification(fileId);
  if (!classification || classification.classificationStatus !== "CLASSIFIED") {
    throw new ValidationError("문서 분류(classify)를 먼저 완료해야 합니다.");
  }

  const extraction = await findLatestExtractedText(fileId);

  assertAnalysisReadinessGate({
    extractionStatus: file.extractionStatus,
    analysisReadiness: classification.analysisReadiness,
    hasExtractedText: !!extraction,
  });

  const nextRevision = (await getLatestAnalysisRevision(fileId)) + 1;

  await auditLitigationAnalyzeStarted({
    actorUserId: currentUser.id,
    fileId,
    caseId,
    revision: nextRevision,
  });

  try {
    const pages = parseExtractedPagesFromJson(extraction!.pagesJson);
    const documentType = classification.documentType as LitigationDocumentType;

    const result = analyzeLitigationDocumentContent({
      fileId,
      caseId,
      documentType,
      pages,
      originalFileName: file.originalFileName,
    });

    await createLitigationDocumentAnalysis({
      uploadedFileId: fileId,
      revision: nextRevision,
      classificationRevision: classification.revision,
      analysisStatus: "AI_ANALYZED",
      documentType,
      analysisJson: result,
    });

    await auditLitigationAnalyzeCompleted({
      actorUserId: currentUser.id,
      fileId,
      caseId,
      revision: nextRevision,
      claimCount: result.claims.length,
      riskSignalCount: result.riskSignals.length,
    });

    const saved = await findLatestAnalysis(fileId);
    return mapAnalysisResponse(fileId, caseId, saved);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "문서 분석에 실패했습니다.";

    await createLitigationDocumentAnalysis({
      uploadedFileId: fileId,
      revision: nextRevision,
      classificationRevision: classification.revision,
      analysisStatus: "FAILED",
      documentType: classification.documentType,
      analysisJson: { error: errorMessage },
      errorMessage,
    });

    await auditLitigationAnalyzeFailed({
      actorUserId: currentUser.id,
      fileId,
      caseId,
      revision: nextRevision,
      errorMessage,
    });

    throw new ValidationError(errorMessage);
  }
}
