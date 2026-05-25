import type { LegalReliabilityActionOperationDashboardSummary } from "./legal-reliability-action-operation-dashboard.schema";

export function emptyLegalReliabilityActionOperationDashboardSummary(
  caseId: string,
): LegalReliabilityActionOperationDashboardSummary {
  return {
    caseId,
    total: 0,
    byStatus: {
      ready: 0,
      assigned: 0,
      waitingToSend: 0,
      sentToClient: 0,
      clientResponded: 0,
      evidenceIntakeLinked: 0,
      lawyerReviewingResponse: 0,
      needsMoreInfo: 0,
      reopened: 0,
      deferred: 0,
      canceled: 0,
      completed: 0,
    },
    bySla: {
      noOwner: 0,
      noDueDate: 0,
      onTrack: 0,
      dueSoon: 0,
      overdue: 0,
      blockedByClient: 0,
      waitingLawyerReview: 0,
    },
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    },
    response: {
      clientRespondedCount: 0,
      uploadedFileCount: 0,
      evidenceUnderReviewCount: 0,
      lawyerReviewRequiredCount: 0,
    },
    downstream: {
      courtReadyAllowedCount: 0,
      blockedByUnreviewedEvidenceCount: 0,
      blockedByNoLawyerCompletionCount: 0,
    },
    attention: {
      needsImmediateAttentionCount: 0,
      overdueOrUrgentCount: 0,
      dueSoonCount: 0,
      waitingLawyerReviewCount: 0,
    },
    rows: [],
  };
}
