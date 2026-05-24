/**
 * Phase 13-F — evidence mapping service (case-level).
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  auditLitigationEvidenceMappingCompleted,
  auditLitigationEvidenceMappingFailed,
  auditLitigationEvidenceMappingItemReviewed,
  auditLitigationEvidenceMappingStarted,
} from "./evidence-mapping-audit";
import { buildEvidenceMappingEngineContext } from "./evidence-mapping.context";
import { runEvidenceMappingEngine } from "./evidence-mapping.engine";
import {
  assertCanReadEvidenceMapping,
  assertCanReviewEvidenceMappingItem,
  assertCanRunEvidenceMapping,
  assertEvidenceMappingRunGate,
} from "./evidence-mapping-policy";
import {
  createLitigationEvidenceMapping,
  findLatestEvidenceMapping,
  getLatestEvidenceMappingRevision,
  loadEvidenceMappingCaseContext,
  upsertEvidenceMappingItemReview,
} from "./evidence-mapping.repository";
import {
  buildEvidenceMappingSummaryLine,
  collectAllEvidenceMappingItems,
  evidenceMappingItemReviewBodySchema,
  evidenceMappingResultSchema,
  findEvidenceMappingItemById,
  type EvidenceMappingResult,
  type LitigationEvidenceMappingResponse,
} from "./evidence-mapping.schema";

export const PHASE13F_EVIDENCE_MAPPING_SERVICE_MARKER =
  "PHASE13F_EVIDENCE_MAPPING_SERVICE" as const;

type ReviewRow = {
  itemId: string;
  reviewStatus: string;
};

function applyReviewsToResult(
  result: EvidenceMappingResult,
  reviews: ReviewRow[],
): EvidenceMappingResult {
  const reviewMap = new Map(reviews.map((r) => [r.itemId, r.reviewStatus]));
  const patch = <T extends { itemId: string; reviewStatus: string }>(
    items: T[],
  ) =>
    items.map((item) => ({
      ...item,
      reviewStatus: (reviewMap.get(item.itemId) ??
        item.reviewStatus) as T["reviewStatus"],
    }));

  return {
    ...result,
    claimEvidenceLinks: patch(result.claimEvidenceLinks),
    unsupportedClaims: patch(result.unsupportedClaims),
    contradictedClaims: patch(result.contradictedClaims),
    missingEvidenceRequests: patch(result.missingEvidenceRequests),
    clientConfirmationQuestions: patch(result.clientConfirmationQuestions),
    evidenceStrengthCandidates: patch(result.evidenceStrengthCandidates),
    issueMappingCandidates: patch(result.issueMappingCandidates),
    supplementRequestDrafts: patch(result.supplementRequestDrafts),
  };
}

function mapEvidenceMappingResponse(
  caseId: string,
  row: Awaited<ReturnType<typeof findLatestEvidenceMapping>>,
): LitigationEvidenceMappingResponse {
  if (!row) {
    return { caseId, mappingStatus: "PENDING" };
  }

  if (row.mappingStatus === "FAILED") {
    return {
      caseId,
      mappingStatus: "FAILED",
      revision: row.revision,
      mappedAt: row.mappedAt.toISOString(),
      errorMessage: row.errorMessage,
    };
  }

  const parsed = evidenceMappingResultSchema.safeParse(row.mappingJson);
  if (!parsed.success) {
    return {
      caseId,
      mappingStatus: "FAILED",
      revision: row.revision,
      errorMessage: "저장된 증거 매핑 JSON이 유효하지 않습니다.",
    };
  }

  const merged = applyReviewsToResult(parsed.data, row.reviews);

  return {
    caseId,
    mappingStatus: "AI_MAPPED",
    revision: row.revision,
    mappedAt: row.mappedAt.toISOString(),
    inputSummary: merged.inputSummary,
    claimEvidenceLinks: merged.claimEvidenceLinks,
    unsupportedClaims: merged.unsupportedClaims,
    contradictedClaims: merged.contradictedClaims,
    missingEvidenceRequests: merged.missingEvidenceRequests,
    clientConfirmationQuestions: merged.clientConfirmationQuestions,
    evidenceStrengthCandidates: merged.evidenceStrengthCandidates,
    issueMappingCandidates: merged.issueMappingCandidates,
    supplementRequestDrafts: merged.supplementRequestDrafts,
    summaryLine: buildEvidenceMappingSummaryLine(merged),
  };
}

export async function getLitigationEvidenceMappingService(
  currentUser: SessionUser,
  caseId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReadEvidenceMapping(access);

  const mapping = await findLatestEvidenceMapping(caseId);
  return mapEvidenceMappingResponse(caseId, mapping);
}

export async function runLitigationEvidenceMappingService(
  currentUser: SessionUser,
  caseId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanRunEvidenceMapping(access);

  const raw = await loadEvidenceMappingCaseContext(caseId);
  if (!raw.caseRow) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const engineContext = buildEvidenceMappingEngineContext(raw);
  if (!engineContext) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  assertEvidenceMappingRunGate({
    documentAnalysisCount: engineContext.inputCounts.documentAnalysisCount,
    hasLitigationFiles: raw.litigationFiles.length > 0,
    hasInterviewOrSummary:
      engineContext.interviewTexts.length > 0 ||
      engineContext.caseSummaryText.length > 0,
  });

  const nextRevision = (await getLatestEvidenceMappingRevision(caseId)) + 1;

  await auditLitigationEvidenceMappingStarted({
    actorUserId: currentUser.id,
    caseId,
    revision: nextRevision,
  });

  try {
    const result = runEvidenceMappingEngine(engineContext);

    await createLitigationEvidenceMapping({
      caseId,
      revision: nextRevision,
      mappingStatus: "AI_MAPPED",
      mappingJson: result,
    });

    await auditLitigationEvidenceMappingCompleted({
      actorUserId: currentUser.id,
      caseId,
      revision: nextRevision,
      linkCount: result.claimEvidenceLinks.length,
      contradictionCount: result.contradictedClaims.length,
      missingEvidenceCount: result.missingEvidenceRequests.length,
    });

    const saved = await findLatestEvidenceMapping(caseId);
    return mapEvidenceMappingResponse(caseId, saved);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "증거 매핑에 실패했습니다.";

    await createLitigationEvidenceMapping({
      caseId,
      revision: nextRevision,
      mappingStatus: "FAILED",
      mappingJson: { error: errorMessage },
      errorMessage,
    });

    await auditLitigationEvidenceMappingFailed({
      actorUserId: currentUser.id,
      caseId,
      revision: nextRevision,
      errorMessage,
    });

    throw new ValidationError(errorMessage);
  }
}

export async function reviewLitigationEvidenceMappingItemService(
  currentUser: SessionUser,
  caseId: string,
  itemId: string,
  body: unknown,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReviewEvidenceMappingItem(access);

  const parsedBody = evidenceMappingItemReviewBodySchema.parse(body);
  const mapping = await findLatestEvidenceMapping(caseId);

  if (!mapping || mapping.caseId !== caseId) {
    throw new NotFoundError("증거 매핑 결과를 찾을 수 없습니다.");
  }

  if (mapping.mappingStatus !== "AI_MAPPED") {
    throw new ValidationError("검토 가능한 증거 매핑 결과가 없습니다.");
  }

  const mappingResult = evidenceMappingResultSchema.parse(mapping.mappingJson);
  const item = findEvidenceMappingItemById(mappingResult, itemId);

  if (!item) {
    throw new NotFoundError("증거 매핑 항목을 찾을 수 없습니다.");
  }

  await upsertEvidenceMappingItemReview({
    mappingId: mapping.id,
    itemId,
    itemKind: item.itemKind,
    reviewStatus: parsedBody.reviewStatus,
    reviewedByUserId: currentUser.id,
    reviewNote: parsedBody.reviewNote ?? null,
  });

  await auditLitigationEvidenceMappingItemReviewed({
    actorUserId: currentUser.id,
    caseId,
    mappingId: mapping.id,
    itemId,
    itemKind: item.itemKind,
    reviewStatus: parsedBody.reviewStatus,
  });

  const refreshed = await findLatestEvidenceMapping(caseId);
  const response = mapEvidenceMappingResponse(caseId, refreshed);
  const updatedItem = collectAllEvidenceMappingItems(
    applyReviewsToResult(mappingResult, refreshed?.reviews ?? []),
  ).find((i) => i.itemId === itemId);

  return {
    caseId,
    mappingRevision: mapping.revision,
    item: updatedItem,
    mapping: response,
  };
}
