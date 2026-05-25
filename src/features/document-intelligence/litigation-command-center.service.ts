/**
 * Phase 14-A — Litigation Command Center aggregation service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError } from "@/lib/errors";
import { CASE_STATUS_LABELS } from "@/lib/definitions/case-status";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { getDocumentIntelligenceReviewQueueService } from "./document-intelligence-review.service";
import { getLitigationEvidenceMappingService } from "./evidence-mapping.service";
import { getLitigationOperationsStatusService } from "./litigation-operations.service";
import {
  assertCanReadLitigationCommandCenter,
  canRunLitigationCommandCenterActions,
} from "./litigation-command-center.policy";
import { mapSupplementStatusForCommandCenter } from "@/features/supplement-request/supplement-request.portal";
import {
  countPendingClientSubmissions,
  countUnreadMessagesForCase,
  listConversationMessagesForCommandCenter,
  listPendingClientSubmissionsForCommandCenter,
} from "@/features/client-portal/client-portal.repository";
import { mapClientSubmissionStatusForDisplay } from "@/features/client-portal/client-submission-status.portal";
import { pipelineLabelForClientSubmissionFile } from "@/features/client-portal/client-portal.schema";
import {
  clientEvidenceItemIdFromMessageAttachment,
  clientStatementItemIdFromMessage,
} from "@/features/client-portal/client-portal-review-candidate.service";
import {
  findCaseForCommandCenter,
  listLitigationDeadlinesForCase,
  listLitigationDraftContextsForCase,
  listLitigationTasksForCase,
  listSupplementRequestsForCommandCenter,
  loadOpponentBriefSummariesForCase,
  listCommandCenterActionFeedForCase,
} from "./litigation-command-center.repository";
import {
  buildLitigationCommandCenterNarrative,
  computeDaysUntilDue,
} from "./litigation-command-center.summary";
import { mapAuditLogToCommandCenterFeedItem } from "./litigation-command-center-action-feed";
import { getDeadlineNotificationSummaryForCommandCenter } from "@/features/litigation-deadline-reminder/litigation-deadline-reminder.service";
import {
  listCommandCenterSharedDocuments,
  listCommandCenterShareableDocuments,
} from "@/features/secure-document-delivery/secure-document-delivery.service";
import {
  LITIGATION_COMMAND_CENTER_VERSION,
  litigationCommandCenterResponseSchema,
  type LitigationCommandCenterResponse,
} from "./litigation-command-center.schema";
import { loadReviewQueueSourceData } from "./document-intelligence-review.repository";
import {
  collectAllEvidenceMappingItems,
  evidenceMappingResultSchema,
} from "./evidence-mapping.schema";
import { listLegalReliabilityActionOperationsForCommandCenter } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation.service";
import { getLegalReliabilityActionOperationsDashboardForCommandCenter } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation-dashboard-summary.service";

export const PHASE14A_LITIGATION_COMMAND_CENTER_SERVICE_MARKER =
  "PHASE14A_LITIGATION_COMMAND_CENTER_SERVICE" as const;

const ACTIVE_TASK_STATUSES = new Set(["OPEN", "IN_PROGRESS"]);

export async function getLitigationCommandCenterService(
  currentUser: SessionUser,
  caseId: string,
): Promise<LitigationCommandCenterResponse> {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReadLitigationCommandCenter(access);

  const caseRow = await findCaseForCommandCenter(caseId);
  if (!caseRow) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const [
    deadlinesRaw,
    tasksRaw,
    draftContextsRaw,
    supplementsRaw,
    opponentBriefs,
    operations,
    reviewQueue,
    evidenceMapping,
    sourceData,
    actionFeedRaw,
    clientSubmissionPendingCount,
    clientSubmissionsRaw,
    caseUnreadMessageCount,
    conversationMessagesRaw,
    sharedDocumentsRaw,
    shareableDocumentsRaw,
    actionOperationsRaw,
    actionOperationsDashboardRaw,
  ] = await Promise.all([
    listLitigationDeadlinesForCase(caseId),
    listLitigationTasksForCase(caseId),
    listLitigationDraftContextsForCase(caseId),
    listSupplementRequestsForCommandCenter(caseId),
    loadOpponentBriefSummariesForCase(caseId),
    getLitigationOperationsStatusService(currentUser, caseId),
    getDocumentIntelligenceReviewQueueService(currentUser, caseId).catch(() => null),
    getLitigationEvidenceMappingService(currentUser, caseId).catch(() => null),
    loadReviewQueueSourceData(caseId),
    listCommandCenterActionFeedForCase(caseId, 12),
    countPendingClientSubmissions(caseId),
    listPendingClientSubmissionsForCommandCenter(caseId),
    countUnreadMessagesForCase(caseId, currentUser.id),
    listConversationMessagesForCommandCenter(caseId),
    listCommandCenterSharedDocuments(caseId),
    listCommandCenterShareableDocuments(caseId),
    listLegalReliabilityActionOperationsForCommandCenter(caseId),
    getLegalReliabilityActionOperationsDashboardForCommandCenter(caseId),
  ]);

  const deadlines = await Promise.all(
    deadlinesRaw.map(async (d) => {
      const notificationSummary = await getDeadlineNotificationSummaryForCommandCenter(d.id);
      return {
        id: d.id,
        title: d.title,
        description: d.description,
        candidateDueText: d.candidateDueText,
        dueAt: d.dueAt?.toISOString() ?? null,
        courtName: d.courtName,
        hearingKind: d.hearingKind,
        clientVisible: d.clientVisible,
        status: d.status,
        sourceItemId: d.sourceItemId,
        reviewDecisionId: d.reviewDecisionId,
        daysUntilDue: computeDaysUntilDue(d.dueAt),
        ...notificationSummary,
        isConfirmed: true as const,
      };
    }),
  );

  const todayTasks = tasksRaw
    .filter((t) => ACTIVE_TASK_STATUSES.has(t.status))
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      taskKind: t.taskKind,
      status: t.status,
      sourceItemId: t.sourceItemId,
      reviewDecisionId: t.reviewDecisionId,
      isConfirmed: true as const,
    }));

  const draftContexts = draftContextsRaw.map((dc) => ({
    id: dc.id,
    title: dc.title,
    status: dc.status,
    reviewDecisionIds: Array.isArray(dc.reviewDecisionIds)
      ? (dc.reviewDecisionIds as string[])
      : [],
    isConfirmed: true as const,
  }));

  const supplements = supplementsRaw.map((s) => {
    const flags = mapSupplementStatusForCommandCenter(s.status);
    return {
      id: s.id,
      title: s.title,
      status: s.status,
      dueAt: s.dueAt?.toISOString() ?? null,
      ...flags,
    };
  });

  const reviewPendingItems =
    reviewQueue?.items.filter((i) => i.decisionLabel === "PENDING") ?? [];

  const confirmedRebuttalCount =
    reviewQueue?.items.filter(
      (i) =>
        i.itemCategory === "rebuttal" &&
        (i.reviewStatus === "LAWYER_CONFIRMED" ||
          i.reviewStatus === "LAWYER_CORRECTED"),
    ).length ?? 0;

  const confirmedEvidenceGapCount = tasksRaw.filter(
    (t) => t.taskKind === "EVIDENCE_GAP" && t.status !== "CANCELLED",
  ).length;

  const clientConfirmationCount =
    (reviewQueue?.items.filter(
      (i) => i.reviewStatus === "NEEDS_CLIENT_CONFIRMATION",
    ).length ?? 0) +
    supplements.filter((s) => s.awaitingClient || s.isDraft).length +
    supplements.filter((s) => s.awaitingReview).length;

  const riskSignalCount =
    reviewQueue?.items.filter((i) => i.itemCategory === "risk").length ?? 0;

  const evidenceMappingSummary =
    evidenceMapping && evidenceMapping.mappingStatus !== "PENDING"
      ? {
          mappingStatus: evidenceMapping.mappingStatus,
          claimEvidenceLinksCount: evidenceMapping.claimEvidenceLinks?.length ?? 0,
          unsupportedClaimsCount: evidenceMapping.unsupportedClaims?.length ?? 0,
          contradictedClaimsCount: evidenceMapping.contradictedClaims?.length ?? 0,
          missingEvidenceCount: evidenceMapping.missingEvidenceRequests?.length ?? 0,
          summaryLine: evidenceMapping.summaryLine,
        }
      : null;

  let evidenceMappingPendingItems: Array<{
    itemId: string;
    itemKind: string;
    displayText: string;
    reviewStatus: string;
  }> = [];

  if (evidenceMapping?.mappingStatus === "AI_MAPPED") {
    const parsed = evidenceMappingResultSchema.safeParse({
      version: "13-F.1",
      caseId,
      mappingStatus: "AI_MAPPED",
      claimEvidenceLinks: evidenceMapping.claimEvidenceLinks ?? [],
      unsupportedClaims: evidenceMapping.unsupportedClaims ?? [],
      contradictedClaims: evidenceMapping.contradictedClaims ?? [],
      missingEvidenceRequests: evidenceMapping.missingEvidenceRequests ?? [],
      clientConfirmationQuestions: evidenceMapping.clientConfirmationQuestions ?? [],
      evidenceStrengthCandidates: evidenceMapping.evidenceStrengthCandidates ?? [],
      issueMappingCandidates: evidenceMapping.issueMappingCandidates ?? [],
      supplementRequestDrafts: evidenceMapping.supplementRequestDrafts ?? [],
      inputSummary: evidenceMapping.inputSummary ?? {
        documentAnalysisCount: 0,
        opponentBriefAnalysisCount: 0,
        interviewAnswerCount: 0,
        litigationEvidenceFileCount: 0,
        caseAttachmentCount: 0,
        existingSupplementItemCount: 0,
      },
    });
    if (parsed.success) {
      evidenceMappingPendingItems = collectAllEvidenceMappingItems(parsed.data)
        .filter((item) => item.reviewStatus === "NEEDS_LAWYER_REVIEW")
        .slice(0, 12)
        .map((item) => ({
          itemId: item.itemId,
          itemKind: item.itemKind,
          displayText:
            "claimText" in item && typeof item.claimText === "string"
              ? item.claimText
              : "issueText" in item && typeof item.issueText === "string"
                ? item.issueText
                : "questionText" in item && typeof item.questionText === "string"
                  ? item.questionText
                  : "draftTitle" in item && typeof item.draftTitle === "string"
                    ? item.draftTitle
                    : item.itemId,
          reviewStatus: item.reviewStatus,
        }));
    }
  }

  const recentActionFeed = actionFeedRaw
    .map((row) => mapAuditLogToCommandCenterFeedItem(row))
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const narrative = buildLitigationCommandCenterNarrative({
    caseStatus: caseRow.status,
    opponentBriefs,
    hasEvidenceMapping: evidenceMappingSummary !== null,
    hasOpsSync: operations.linkedReviewDecisionCount > 0,
    hasLitigationFiles: sourceData.litigationFiles.length > 0,
    confirmedRebuttalCount,
    confirmedEvidenceGapCount,
    clientConfirmationCount,
    reviewPendingCount: reviewPendingItems.length,
    deadlines,
  });

  const clientSubmissions = clientSubmissionsRaw.map((row) => {
    const display = mapClientSubmissionStatusForDisplay(row.status);
    return {
      id: row.id,
      kind: row.kind,
      status: row.status,
      statusLabel: display.label,
      message: row.message,
      submitterName: row.submitter.name,
      supplementTitle: row.supplementRequest?.title ?? null,
      fileCount: row.files.length,
      submittedAt: row.submittedAt?.toISOString() ?? null,
      pipelineLabels: row.files.map((file) =>
        pipelineLabelForClientSubmissionFile({
          extractionStatus: file.uploadedFile.extractionStatus,
          submissionStatus: row.status,
        }),
      ),
    };
  });

  const adoptedReviewItemIds = new Set(sourceData.decisions.map((row) => row.itemId));

  const conversationMessages = conversationMessagesRaw.map((message) => {
    const bodyReviewItemId = clientStatementItemIdFromMessage(message.id);
    const readBy =
      typeof message.readByJson === "object" &&
      message.readByJson !== null &&
      !Array.isArray(message.readByJson)
        ? (message.readByJson as Record<string, string>)
        : {};

    return {
      id: message.id,
      body: message.body,
      senderName: message.sender.name,
      senderRole: message.sender.role,
      createdAt: message.createdAt.toISOString(),
      isRead: Boolean(readBy[currentUser.id]),
      bodyReviewItemId,
      bodyAdopted:
        adoptedReviewItemIds.has(bodyReviewItemId) || message.isPinnedForRecord,
      attachments: message.attachments.map((attachment) => {
        const reviewItemId = clientEvidenceItemIdFromMessageAttachment(
          message.id,
          attachment.uploadedFileId,
        );
        return {
          uploadedFileId: attachment.uploadedFileId,
          originalFileName: attachment.originalFileName,
          reviewItemId,
          adopted: adoptedReviewItemIds.has(reviewItemId),
        };
      }),
    };
  });

  const response: LitigationCommandCenterResponse = {
    caseId,
    caseTitle: caseRow.title,
    caseStatus: caseRow.status,
    caseStatusLabel: CASE_STATUS_LABELS[caseRow.status],
    opponentName: caseRow.opponentName,
    courtName: caseRow.courtName,
    version: LITIGATION_COMMAND_CENTER_VERSION,
    narrative,
    riskSignalCount,
    todayTasks,
    deadlines,
    opponentBriefs,
    evidenceMapping: evidenceMappingSummary,
    reviewPendingItems,
    reviewPendingCount: reviewPendingItems.length,
    confirmedRebuttalCount,
    confirmedEvidenceGapCount,
    clientConfirmationCount,
    operations,
    supplements,
    actionOperations: actionOperationsRaw,
    actionOperationsDashboard: actionOperationsDashboardRaw,
    draftContexts,
    evidenceMappingPendingItems,
    recentActionFeed,
    clientSubmissionPendingCount,
    caseUnreadMessageCount,
    clientSubmissions,
    conversationMessages,
    sharedDocuments: sharedDocumentsRaw,
    shareableDocuments: shareableDocumentsRaw,
    readOnly: !canRunLitigationCommandCenterActions(access),
    actionsEnabled: canRunLitigationCommandCenterActions(access),
  };

  return litigationCommandCenterResponseSchema.parse(response);
}
