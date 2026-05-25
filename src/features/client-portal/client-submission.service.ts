/**
 * Phase 15-B/C — Client submission + intake + chat attachment services.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { canClientRespondToSupplement } from "@/features/supplement-request/supplement-request.portal";
import {
  changeSupplementRequestStatusService,
  createSupplementResponseService,
  getSupplementRequestDetailService,
} from "@/features/supplement-request/supplement-request.service";
import { uploadLitigationDocumentService } from "@/features/document-intelligence/document-extraction.service";
import {
  assertCanAccessClientPortalCase,
  assertCanReviewClientSubmission,
  assertClientPortalUser,
} from "./client-portal.policy";
import {
  attachFilesToClientSubmission,
  createClientSubmissionRecord,
  finalizeClientSubmission,
  findClientDraftSubmission,
  findClientSubmissionById,
  listClientSubmissionsForCase,
  updateClientSubmissionDraft,
  updateClientSubmissionStatus,
} from "./client-portal.repository";
import {
  auditClientPortalFileUpload,
  auditClientSubmissionReviewed,
  auditClientSubmissionSubmitted,
} from "./client-portal-audit";
import { queueClientSubmissionIntakePipeline } from "./client-submission-intake.service";
import { enqueueClientSubmissionReviewCandidates } from "./client-portal-review-candidate.service";
import {
  saveClientSubmissionDraftBodySchema,
  submitClientSupplementBodySchema,
  submitFreeUploadBodySchema,
} from "./client-portal.schema";
import { validateClientOwnedLitigationFiles } from "./client-portal.service";
import { canLawyerReviewSubmission } from "./client-submission-status.portal";
import { syncClientResponseToLegalReliabilityOperationFromPortal } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation-client-response-sync.service";

function descriptionMap(
  items: Array<{ uploadedFileId: string; description?: string }>,
) {
  return new Map(items.map((item) => [item.uploadedFileId, item.description ?? null]));
}

async function attachOwnedFiles(
  submissionId: string,
  ownedFiles: Awaited<ReturnType<typeof validateClientOwnedLitigationFiles>>,
  descriptions: Array<{ uploadedFileId: string; description?: string }>,
) {
  const desc = descriptionMap(descriptions);
  if (ownedFiles.length === 0) return;
  await attachFilesToClientSubmission({
    submissionId,
    files: ownedFiles.map((file) => ({
      uploadedFileId: file.id,
      originalFileName: file.originalFileName,
      fileType: file.mimeType,
      description: desc.get(file.id) ?? null,
    })),
  });
}

async function runIntakeForSubmission(
  actor: SessionUser,
  caseId: string,
  submissionId: string,
  trigger: "RECEIVED" | "UNDER_REVIEW" | "ACCEPTED",
) {
  const submission = await findClientSubmissionById(submissionId);
  if (!submission) return;
  const fileIds = submission.files.map((f) => f.uploadedFileId);
  if (fileIds.length === 0) return;
  await queueClientSubmissionIntakePipeline({
    actor,
    caseId,
    submissionId,
    uploadedFileIds: fileIds,
    trigger,
  });
}

export async function uploadClientPortalFileService(
  currentUser: SessionUser,
  caseId: string,
  file: File,
) {
  assertClientPortalUser(currentUser);
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanAccessClientPortalCase(currentUser, access);

  const uploaded = await uploadLitigationDocumentService(currentUser, caseId, file);
  await auditClientPortalFileUpload({
    actorUserId: currentUser.id,
    caseId,
    uploadedFileId: uploaded.fileId,
  });
  return uploaded;
}

export async function saveClientSubmissionDraftService(
  currentUser: SessionUser,
  caseId: string,
  body: unknown,
) {
  assertClientPortalUser(currentUser);
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanAccessClientPortalCase(currentUser, access);

  const input = saveClientSubmissionDraftBodySchema.parse(body);
  const ownedFiles = await validateClientOwnedLitigationFiles(
    currentUser,
    caseId,
    input.files.map((f) => f.uploadedFileId),
  );

  const draft = await findClientDraftSubmission({
    caseId,
    submittedByUserId: currentUser.id,
    supplementRequestId: input.supplementRequestId ?? null,
    kind: input.kind,
  });

  let submissionId: string;

  if (!draft) {
    const created = await createClientSubmissionRecord({
      caseId,
      supplementRequestId: input.supplementRequestId ?? null,
      submittedByUserId: currentUser.id,
      kind: input.kind,
      status: "DRAFT",
      message: input.message ?? null,
    });
    submissionId = created.id;
  } else {
    if (input.message !== undefined) {
      await updateClientSubmissionDraft({
        submissionId: draft.id,
        message: input.message,
      });
    }
    submissionId = draft.id;
  }

  await attachOwnedFiles(submissionId, ownedFiles, input.files);
  return { submissionId, status: "DRAFT" as const };
}

export async function submitFreeUploadService(
  currentUser: SessionUser,
  caseId: string,
  body: unknown,
) {
  assertClientPortalUser(currentUser);
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanAccessClientPortalCase(currentUser, access);

  const input = submitFreeUploadBodySchema.parse(body);
  const ownedFiles = await validateClientOwnedLitigationFiles(
    currentUser,
    caseId,
    input.litigationFileIds,
  );

  const submission = await createClientSubmissionRecord({
    caseId,
    submittedByUserId: currentUser.id,
    kind: "FREE_UPLOAD",
    status: "SUBMITTED",
    message: input.message,
    submittedAt: new Date(),
  });

  await attachOwnedFiles(submission.id, ownedFiles, input.fileDescriptions);

  await auditClientSubmissionSubmitted({
    actorUserId: currentUser.id,
    caseId,
    submissionId: submission.id,
    fileCount: ownedFiles.length,
  });

  return { submissionId: submission.id, status: "SUBMITTED" as const, fileCount: ownedFiles.length };
}

export async function submitClientSupplementService(
  currentUser: SessionUser,
  caseId: string,
  requestId: string,
  body: unknown,
) {
  assertClientPortalUser(currentUser);
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanAccessClientPortalCase(currentUser, access);

  const input = submitClientSupplementBodySchema.parse(body);
  const request = await getSupplementRequestDetailService(currentUser, requestId);
  if (request.caseId !== caseId) {
    throw new NotFoundError("보완요청을 찾을 수 없습니다.");
  }
  if (!canClientRespondToSupplement(request.status)) {
    throw new ValidationError("현재 상태에서는 보완 응답을 제출할 수 없습니다.");
  }

  const ownedFiles = await validateClientOwnedLitigationFiles(
    currentUser,
    caseId,
    input.litigationFileIds,
  );

  const draft = await findClientDraftSubmission({
    caseId,
    submittedByUserId: currentUser.id,
    supplementRequestId: requestId,
    kind: "SUPPLEMENT",
  });

  const submission = draft
    ? await finalizeClientSubmission({
        submissionId: draft.id,
        message: input.message,
      })
    : await createClientSubmissionRecord({
        caseId,
        supplementRequestId: requestId,
        submittedByUserId: currentUser.id,
        kind: "SUPPLEMENT",
        status: "SUBMITTED",
        message: input.message,
        submittedAt: new Date(),
      });

  const submissionId = submission.id;

  if (ownedFiles.length > 0) {
    await attachOwnedFiles(submissionId, ownedFiles, input.fileDescriptions);
  }

  await createSupplementResponseService(currentUser, requestId, {
    responseText: input.message,
    revisionRound: request.revisionRound,
  });

  await auditClientSubmissionSubmitted({
    actorUserId: currentUser.id,
    caseId,
    submissionId,
    supplementRequestId: requestId,
    fileCount: ownedFiles.length,
  });

  await syncClientResponseToLegalReliabilityOperationFromPortal({
    caseId,
    supplementRequestId: requestId,
    clientSubmissionIds: [submissionId],
    uploadedFileIds: input.litigationFileIds,
    responseSummary: input.message,
    respondedAt: new Date(),
    actorUserId: currentUser.id,
  });

  return {
    submissionId,
    supplementRequestId: requestId,
    status: "SUBMITTED" as const,
    fileCount: ownedFiles.length,
  };
}

export async function listLawyerClientSubmissionsService(
  currentUser: SessionUser,
  caseId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReviewClientSubmission(access);
  return listClientSubmissionsForCase(caseId);
}

async function reviewSubmission(
  currentUser: SessionUser,
  caseId: string,
  submissionId: string,
  toStatus: "ACCEPTED" | "NEEDS_MORE_INFO" | "REJECTED" | "UNDER_REVIEW" | "RECEIVED",
  reviewMemo?: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReviewClientSubmission(access);

  const submission = await findClientSubmissionById(submissionId);
  if (!submission || submission.caseId !== caseId) {
    throw new NotFoundError("제출 자료를 찾을 수 없습니다.");
  }
  if (!canLawyerReviewSubmission(submission.status) && toStatus !== "ACCEPTED") {
    if (!(toStatus === "REJECTED" || toStatus === "NEEDS_MORE_INFO")) {
      throw new ValidationError("현재 상태에서는 해당 검토 작업을 할 수 없습니다.");
    }
  }

  const updated = await updateClientSubmissionStatus({
    submissionId,
    status: toStatus,
    reviewedByUserId: currentUser.id,
    reviewMemo,
  });

  if (toStatus === "RECEIVED" || toStatus === "UNDER_REVIEW" || toStatus === "ACCEPTED") {
    await runIntakeForSubmission(
      currentUser,
      caseId,
      submissionId,
      toStatus === "ACCEPTED" ? "ACCEPTED" : toStatus,
    );
  }

  if (toStatus === "ACCEPTED") {
    const fullSubmission = await findClientSubmissionById(submissionId);
    if (fullSubmission) {
      await enqueueClientSubmissionReviewCandidates({
        caseId,
        submissionId: fullSubmission.id,
        kind: fullSubmission.kind,
        message: fullSubmission.message,
        files: fullSubmission.files.map((file) => ({
          description: file.description,
          uploadedFile: {
            id: file.uploadedFile.id,
            originalFileName: file.uploadedFile.originalFileName,
          },
        })),
      });
    }
  }

  if (updated.supplementRequestId) {
    if (toStatus === "UNDER_REVIEW" || toStatus === "RECEIVED") {
      await changeSupplementRequestStatusService(currentUser, updated.supplementRequestId, {
        toStatus: "UNDER_REVIEW",
        reasonCode: "CLIENT_SUBMISSION_RECEIVED",
        reasonMemo: "의뢰인 제출 자료 수신",
      }).catch(() => undefined);
    }
    if (toStatus === "NEEDS_MORE_INFO") {
      await changeSupplementRequestStatusService(currentUser, updated.supplementRequestId, {
        toStatus: "NEEDS_MORE_INFO",
        reasonCode: "CLIENT_SUBMISSION_MORE_INFO",
        reasonMemo: reviewMemo ?? "추가 보완 필요",
      }).catch(() => undefined);
    }
    if (toStatus === "ACCEPTED") {
      await changeSupplementRequestStatusService(currentUser, updated.supplementRequestId, {
        toStatus: "ACCEPTED",
        reasonCode: "CLIENT_SUBMISSION_ACCEPTED",
        reasonMemo: reviewMemo ?? "제출 자료 채택",
      }).catch(() => undefined);
    }
  }

  await auditClientSubmissionReviewed({
    actorUserId: currentUser.id,
    caseId,
    submissionId,
    toStatus,
  });

  return updated;
}

export async function acceptClientSubmissionService(
  currentUser: SessionUser,
  caseId: string,
  submissionId: string,
  body: unknown,
) {
  const input =
    typeof body === "object" && body !== null && "reviewMemo" in body
      ? { reviewMemo: String((body as { reviewMemo?: string }).reviewMemo ?? "") }
      : {};
  return reviewSubmission(currentUser, caseId, submissionId, "ACCEPTED", input.reviewMemo);
}

export async function requestMoreInfoClientSubmissionService(
  currentUser: SessionUser,
  caseId: string,
  submissionId: string,
  body: unknown,
) {
  const input =
    typeof body === "object" && body !== null && "reviewMemo" in body
      ? { reviewMemo: String((body as { reviewMemo?: string }).reviewMemo ?? "") }
      : {};
  if (!input.reviewMemo?.trim()) {
    throw new ValidationError("추가 설명 요청 메모가 필요합니다.");
  }
  return reviewSubmission(
    currentUser,
    caseId,
    submissionId,
    "NEEDS_MORE_INFO",
    input.reviewMemo,
  );
}

export async function rejectClientSubmissionService(
  currentUser: SessionUser,
  caseId: string,
  submissionId: string,
  body: unknown,
) {
  const input =
    typeof body === "object" && body !== null && "reviewMemo" in body
      ? { reviewMemo: String((body as { reviewMemo?: string }).reviewMemo ?? "") }
      : {};
  return reviewSubmission(currentUser, caseId, submissionId, "REJECTED", input.reviewMemo);
}

export async function receiveClientSubmissionService(
  currentUser: SessionUser,
  caseId: string,
  submissionId: string,
) {
  return reviewSubmission(currentUser, caseId, submissionId, "RECEIVED");
}

export async function startReviewClientSubmissionService(
  currentUser: SessionUser,
  caseId: string,
  submissionId: string,
) {
  return reviewSubmission(currentUser, caseId, submissionId, "UNDER_REVIEW");
}
