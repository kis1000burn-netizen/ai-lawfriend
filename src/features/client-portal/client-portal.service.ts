/**
 * Phase 15-A — Client portal services.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { CASE_STATUS_LABELS } from "@/lib/definitions/case-status";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  countClientPendingSupplements,
  isSupplementVisibleToClient,
} from "@/features/supplement-request/supplement-request.portal";
import { listSupplementRequestsService } from "@/features/supplement-request/supplement-request.service";
import {
  CLIENT_PORTAL_VERSION,
  clientPortalCaseListItemSchema,
  clientPortalCaseSummarySchema,
  caseSharedDocumentSchema,
  pipelineLabelForClientSubmissionFile,
  clientSubmissionSchema,
  type ClientPortalCaseSummary,
} from "./client-portal.schema";
import { mapClientSubmissionStatusForDisplay } from "./client-submission-status.portal";
import {
  assertCanAccessClientPortalCase,
  assertClientPortalUser,
} from "./client-portal.policy";
import {
  countUnreadMessagesForClient,
  findClientPortalCase,
  listClientPortalCasesForUser,
  listSharedDocumentsForClient,
  upsertClientPortalAccess,
} from "./client-portal.repository";
import { auditClientPortalAccess } from "./client-portal-audit";
import { getNextClientVisibleDeadlineForPortalSummary } from "@/features/litigation-deadline-reminder/litigation-deadline-reminder.service";

function buildPhaseLabel(status: string, pendingSupplements: number) {
  if (pendingSupplements > 0) return "변호사 보완요청 응답 필요";
  if (status === "INTAKE_PENDING") return "사실관계 수집";
  if (status === "REVIEW_PENDING") return "변호사 검토 진행";
  if (status === "IN_PROGRESS") return "사건 진행 중";
  return "사건 진행";
}

function buildNextAction(pendingSupplements: number, unreadMessages: number) {
  if (pendingSupplements > 0) return "보완요청함에서 자료·답변을 제출해 주세요.";
  if (unreadMessages > 0) return "변호사 메시지를 확인해 주세요.";
  return "제출 이력과 공유 자료함을 확인하세요.";
}

export async function listClientPortalCasesService(currentUser: SessionUser) {
  assertClientPortalUser(currentUser);
  const rows = await listClientPortalCasesForUser(currentUser.id);
  const unreadCounts = await Promise.all(
    rows.map((row) => countUnreadMessagesForClient(row.id, currentUser.id)),
  );

  return rows.map((row, index) =>
    clientPortalCaseListItemSchema.parse({
      caseId: row.id,
      title: row.title,
      status: row.status,
      statusLabel: CASE_STATUS_LABELS[row.status] ?? row.status,
      pendingSupplementCount: row.supplementRequests.length,
      unreadMessageCount: unreadCounts[index] ?? 0,
    }),
  );
}

export async function getClientPortalCaseService(
  currentUser: SessionUser,
  caseId: string,
): Promise<ClientPortalCaseSummary> {
  assertClientPortalUser(currentUser);
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanAccessClientPortalCase(currentUser, access);

  const row = await findClientPortalCase(caseId, currentUser.id);
  if (!row) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  await upsertClientPortalAccess({
    caseId,
    clientUserId: currentUser.id,
  });
  await auditClientPortalAccess({ actorUserId: currentUser.id, caseId });

  const visibleSupplements = row.supplementRequests.filter((s) =>
    isSupplementVisibleToClient(s.status),
  );
  const pendingSupplementCount = countClientPendingSupplements(
    visibleSupplements.map((s) => s.status),
  );
  const unreadMessageCount = await countUnreadMessagesForClient(caseId, currentUser.id);
  const pendingSubmissionCount = row.clientSubmissions.filter((s) =>
    ["SUBMITTED", "RECEIVED", "UNDER_REVIEW"].includes(s.status),
  ).length;

  const nextDeadline = await getNextClientVisibleDeadlineForPortalSummary(caseId);

  return clientPortalCaseSummarySchema.parse({
    caseId: row.id,
    title: row.title,
    status: row.status,
    statusLabel: CASE_STATUS_LABELS[row.status] ?? row.status,
    opponentName: row.opponentName,
    courtName: row.courtName,
    version: CLIENT_PORTAL_VERSION,
    phaseLabel: buildPhaseLabel(row.status, pendingSupplementCount),
    nextActionLabel: buildNextAction(pendingSupplementCount, unreadMessageCount),
    pendingSupplementCount,
    pendingSubmissionCount,
    unreadMessageCount,
    sharedDocumentCount: row.sharedDocuments.length,
    nextCourtDeadlineDisplay: nextDeadline?.displayLine ?? null,
  });
}

export async function listClientPortalSupplementRequestsService(
  currentUser: SessionUser,
  caseId: string,
) {
  assertClientPortalUser(currentUser);
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanAccessClientPortalCase(currentUser, access);
  return listSupplementRequestsService(currentUser, caseId, { page: 1, pageSize: 50 });
}

export async function listClientPortalSubmissionsService(
  currentUser: SessionUser,
  caseId: string,
) {
  assertClientPortalUser(currentUser);
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanAccessClientPortalCase(currentUser, access);

  const row = await findClientPortalCase(caseId, currentUser.id);
  if (!row) throw new NotFoundError("사건을 찾을 수 없습니다.");

  return row.clientSubmissions.map((submission) => {
    const display = mapClientSubmissionStatusForDisplay(submission.status);
    return clientSubmissionSchema.parse({
      id: submission.id,
      caseId: submission.caseId,
      supplementRequestId: submission.supplementRequestId,
      kind: submission.kind,
      status: submission.status,
      statusLabel: display.label,
      statusDisplayKey: display.key,
      message: submission.message,
      submittedAt: submission.submittedAt?.toISOString() ?? null,
      files: submission.files.map((file) => ({
        id: file.id,
        uploadedFileId: file.uploadedFileId,
        originalFileName: file.originalFileName,
        fileType: file.fileType,
        description: file.description,
        sharedWithLawyer: file.sharedWithLawyer,
        pipelineLabel: pipelineLabelForClientSubmissionFile({
          extractionStatus: file.uploadedFile.extractionStatus,
          submissionStatus: submission.status,
        }),
      })),
    });
  });
}

export async function listClientPortalSharedDocumentsService(
  currentUser: SessionUser,
  caseId: string,
) {
  assertClientPortalUser(currentUser);
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanAccessClientPortalCase(currentUser, access);

  const rows = await listSharedDocumentsForClient(caseId, currentUser.id);
  return rows.map((row) =>
    caseSharedDocumentSchema.parse({
      id: row.id,
      documentId: row.documentId,
      title: row.document.title,
      shareStatus: row.shareStatus,
      sharedAt: row.sharedAt.toISOString(),
      expiresAt: row.expiresAt?.toISOString() ?? null,
      firstViewedAt: row.firstViewedAt?.toISOString() ?? null,
    }),
  );
}

export async function validateClientOwnedLitigationFiles(
  currentUser: SessionUser,
  caseId: string,
  fileIds: string[],
) {
  if (fileIds.length === 0) return [];
  const { prisma } = await import("@/lib/prisma");
  const rows = await prisma.litigationUploadedFile.findMany({
    where: {
      id: { in: fileIds },
      caseId,
      uploaderUserId: currentUser.id,
    },
  });
  if (rows.length !== fileIds.length) {
    throw new ValidationError("업로드 파일 중 일부를 확인할 수 없습니다.");
  }
  return rows;
}
