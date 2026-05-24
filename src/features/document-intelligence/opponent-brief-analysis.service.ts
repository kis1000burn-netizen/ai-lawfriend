/**
 * Phase 13-E — opponent brief analysis service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { documentAnalysisResultSchema } from "./document-analysis.schema";
import { findLatestAnalysis } from "./document-analysis.repository";
import { findLatestClassification } from "./document-classification.repository";
import {
  findLatestExtractedText,
  findLitigationFileById,
} from "./document-extraction.repository";
import { parseExtractedPagesFromJson } from "./document-extraction.schema";
import { analyzeOpponentBriefContent } from "./opponent-brief-analysis.engine";
import {
  assertCanAnalyzeOpponentBrief,
  assertCanReadOpponentBriefAnalysis,
  assertOpponentBriefAnalysisGate,
} from "./opponent-brief-analysis-policy";
import {
  buildOpponentBriefBadgeSummary,
  isOpponentBriefEligibleDocumentType,
  opponentBriefAnalysisResultSchema,
  type LitigationOpponentBriefResponse,
  type OpponentBriefEligibleDocumentType,
} from "./opponent-brief-analysis.schema";
import {
  createLitigationOpponentBriefAnalysis,
  findLatestOpponentBriefAnalysis,
  getLatestOpponentBriefAnalysisRevision,
} from "./opponent-brief-analysis.repository";
import {
  auditLitigationOpponentBriefAnalyzeCompleted,
  auditLitigationOpponentBriefAnalyzeFailed,
  auditLitigationOpponentBriefAnalyzeStarted,
} from "./opponent-brief-analysis-audit";

export const PHASE13E_OPPONENT_BRIEF_ANALYSIS_SERVICE_MARKER =
  "PHASE13E_OPPONENT_BRIEF_ANALYSIS_SERVICE" as const;

function mapOpponentBriefResponse(
  fileId: string,
  caseId: string,
  row: Awaited<ReturnType<typeof findLatestOpponentBriefAnalysis>>,
): LitigationOpponentBriefResponse {
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

  const parsed = opponentBriefAnalysisResultSchema.safeParse(row.analysisJson);
  if (!parsed.success) {
    return {
      fileId,
      caseId,
      analysisStatus: "FAILED",
      errorMessage: "저장된 상대방 서면 분석 JSON이 유효하지 않습니다.",
      revision: row.revision,
    };
  }

  const data = parsed.data;
  const badge = buildOpponentBriefBadgeSummary(data);

  return {
    fileId,
    caseId,
    analysisStatus: "AI_ANALYZED",
    documentType: data.documentType,
    opponentPositionSummary: data.opponentPositionSummary,
    admissions: data.admissions,
    denials: data.denials,
    defenses: data.defenses,
    newArguments: data.newArguments,
    contradictionCandidates: data.contradictionCandidates,
    rebuttalIssueCandidates: data.rebuttalIssueCandidates,
    clientConfirmationQuestions: data.clientConfirmationQuestions,
    evidenceRequests: data.evidenceRequests,
    draftContext: data.draftContext,
    revision: row.revision,
    analyzedAt: row.analyzedAt.toISOString(),
    badgeLabel: badge.badgeLabel,
    badgeSummaryLine: badge.badgeSummaryLine,
  };
}

export function mapOpponentBriefSummaryForList(
  row: Awaited<ReturnType<typeof findLatestOpponentBriefAnalysis>>,
) {
  if (!row || row.analysisStatus !== "AI_ANALYZED") {
    return {
      opponentBriefAnalysisStatus: row?.analysisStatus ?? "PENDING",
    };
  }

  const parsed = opponentBriefAnalysisResultSchema.safeParse(row.analysisJson);
  if (!parsed.success) {
    return { opponentBriefAnalysisStatus: "FAILED" as const };
  }

  const badge = buildOpponentBriefBadgeSummary(parsed.data);
  return {
    opponentBriefAnalysisStatus: "AI_ANALYZED" as const,
    opponentBriefBadgeLabel: badge.badgeLabel,
    opponentBriefBadgeSummaryLine: badge.badgeSummaryLine,
    opponentBriefAdmissionCount: parsed.data.admissions.length,
    opponentBriefDenialCount: parsed.data.denials.length,
    opponentBriefDefenseCount: parsed.data.defenses.length,
    opponentBriefClientConfirmationCount:
      parsed.data.clientConfirmationQuestions.length,
  };
}

export async function getLitigationOpponentBriefAnalysisService(
  currentUser: SessionUser,
  caseId: string,
  fileId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReadOpponentBriefAnalysis(access);

  const file = await findLitigationFileById(fileId);
  if (!file || file.caseId !== caseId) {
    throw new NotFoundError("서류·증거 파일을 찾을 수 없습니다.");
  }

  const analysis = await findLatestOpponentBriefAnalysis(fileId);
  return mapOpponentBriefResponse(fileId, caseId, analysis);
}

export async function analyzeLitigationOpponentBriefService(
  currentUser: SessionUser,
  caseId: string,
  fileId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanAnalyzeOpponentBrief(access);

  const file = await findLitigationFileById(fileId);
  if (!file || file.caseId !== caseId) {
    throw new NotFoundError("서류·증거 파일을 찾을 수 없습니다.");
  }

  const classification = await findLatestClassification(fileId);
  if (!classification || classification.classificationStatus !== "CLASSIFIED") {
    throw new ValidationError("문서 분류(classify)를 먼저 완료해야 합니다.");
  }

  const documentAnalysis = await findLatestAnalysis(fileId);
  const extraction = await findLatestExtractedText(fileId);

  assertOpponentBriefAnalysisGate({
    extractionStatus: file.extractionStatus,
    classificationStatus: classification.classificationStatus,
    documentAnalysisStatus: documentAnalysis?.analysisStatus,
    documentType: classification.documentType,
    hasExtractedText: !!extraction,
  });

  if (
    !documentAnalysis ||
    documentAnalysis.analysisStatus !== "AI_ANALYZED"
  ) {
    throw new ValidationError(
      "13-D 문서 분석(analyze)을 먼저 완료해야 합니다.",
    );
  }

  const priorParsed = documentAnalysisResultSchema.safeParse(
    documentAnalysis.analysisJson,
  );
  if (!priorParsed.success) {
    throw new ValidationError("13-D 분석 결과가 유효하지 않습니다.");
  }

  if (!isOpponentBriefEligibleDocumentType(classification.documentType)) {
    throw new ValidationError(
      "상대방 서면 유형 문서에서만 상대방 서면 분석을 실행할 수 있습니다.",
    );
  }

  const nextRevision =
    (await getLatestOpponentBriefAnalysisRevision(fileId)) + 1;

  await auditLitigationOpponentBriefAnalyzeStarted({
    actorUserId: currentUser.id,
    fileId,
    caseId,
    revision: nextRevision,
  });

  try {
    const pages = parseExtractedPagesFromJson(extraction!.pagesJson);
    const documentType =
      classification.documentType as OpponentBriefEligibleDocumentType;

    const result = analyzeOpponentBriefContent({
      fileId,
      caseId,
      documentType,
      pages,
      originalFileName: file.originalFileName,
      priorAnalysis: priorParsed.data,
    });

    await createLitigationOpponentBriefAnalysis({
      uploadedFileId: fileId,
      revision: nextRevision,
      documentAnalysisRevision: documentAnalysis.revision,
      analysisStatus: "AI_ANALYZED",
      documentType,
      analysisJson: result,
    });

    await auditLitigationOpponentBriefAnalyzeCompleted({
      actorUserId: currentUser.id,
      fileId,
      caseId,
      revision: nextRevision,
      admissionCount: result.admissions.length,
      denialCount: result.denials.length,
      defenseCount: result.defenses.length,
      clientConfirmationQuestionCount:
        result.clientConfirmationQuestions.length,
    });

    const saved = await findLatestOpponentBriefAnalysis(fileId);
    return mapOpponentBriefResponse(fileId, caseId, saved);
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "상대방 서면 분석에 실패했습니다.";

    await createLitigationOpponentBriefAnalysis({
      uploadedFileId: fileId,
      revision: nextRevision,
      documentAnalysisRevision: documentAnalysis.revision,
      analysisStatus: "FAILED",
      documentType: classification.documentType,
      analysisJson: { error: errorMessage },
      errorMessage,
    });

    await auditLitigationOpponentBriefAnalyzeFailed({
      actorUserId: currentUser.id,
      fileId,
      caseId,
      revision: nextRevision,
      errorMessage,
    });

    throw new ValidationError(errorMessage);
  }
}
