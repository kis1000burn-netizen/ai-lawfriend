/**
 * Product Phase 50-E — Command Center Execution Dashboard summary service.
 * Visibility-only — NO_DASHBOARD_AUTO_COMPLETION · NO_DASHBOARD_AUTO_MESSAGING · NO_DASHBOARD_AUTO_FILING
 * NO_UNREVIEWED_EVIDENCE_DOWNSTREAM · NO_AI_OPERATION_PRIORITY_OVERRIDE
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { assertCanReadLegalReliabilityActionOperations } from "./legal-reliability-action-operation.policy";
import { listLegalReliabilityActionOperationsRepository } from "./legal-reliability-action-operation.repository";
import type {
  LegalReliabilityActionOperationDashboardFilter,
  LegalReliabilityActionOperationDashboardSummary,
} from "./legal-reliability-action-operation-dashboard.schema";
import {
  calculateOperationAttentionScore,
  filterDashboardRows,
  resolveDownstreamReadiness,
  resolveLegalReliabilityActionOperationDashboardBucket,
  sortDashboardRows,
} from "./legal-reliability-action-operation-dashboard.policy";

export const PHASE50E_DASHBOARD_SUMMARY_SERVICE_MARKER =
  "phase50e-legal-reliability-action-operation-dashboard-summary-service" as const;

type OperationLike = {
  id: string;
  caseId: string;
  status: string;
  priority?: string | null;
  slaStatus?: string | null;
  assignedToUserId?: string | null;
  dueAt?: Date | string | null;
  updatedAt?: Date | string | null;
  clientResponseReceivedAt?: Date | string | null;
  linkedUploadedFileIds?: unknown;
  linkedClientSubmissionIds?: unknown;
  evidenceIntakeStatus?: string | null;
  reviewHandoffJson?: unknown;
};

function parseJsonArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseJsonObject(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  return null;
}

function emptyByStatus(): LegalReliabilityActionOperationDashboardSummary["byStatus"] {
  return {
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
  };
}

function emptyBySla(): LegalReliabilityActionOperationDashboardSummary["bySla"] {
  return {
    noOwner: 0,
    noDueDate: 0,
    onTrack: 0,
    dueSoon: 0,
    overdue: 0,
    blockedByClient: 0,
    waitingLawyerReview: 0,
  };
}

function emptyByPriority(): LegalReliabilityActionOperationDashboardSummary["byPriority"] {
  return {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  };
}

function incrementStatusBucket(
  buckets: LegalReliabilityActionOperationDashboardSummary["byStatus"],
  status: string,
) {
  switch (status) {
    case "READY":
      buckets.ready += 1;
      break;
    case "ASSIGNED":
      buckets.assigned += 1;
      break;
    case "WAITING_TO_SEND":
      buckets.waitingToSend += 1;
      break;
    case "SENT_TO_CLIENT":
      buckets.sentToClient += 1;
      break;
    case "CLIENT_RESPONDED":
      buckets.clientResponded += 1;
      break;
    case "EVIDENCE_INTAKE_LINKED":
      buckets.evidenceIntakeLinked += 1;
      break;
    case "LAWYER_REVIEWING_RESPONSE":
      buckets.lawyerReviewingResponse += 1;
      break;
    case "NEEDS_MORE_INFO":
      buckets.needsMoreInfo += 1;
      break;
    case "REOPENED":
      buckets.reopened += 1;
      break;
    case "DEFERRED":
      buckets.deferred += 1;
      break;
    case "CANCELED":
      buckets.canceled += 1;
      break;
    case "COMPLETED":
      buckets.completed += 1;
      break;
    default:
      break;
  }
}

function incrementSlaBucket(
  buckets: LegalReliabilityActionOperationDashboardSummary["bySla"],
  slaStatus?: string | null,
) {
  switch (slaStatus) {
    case "NO_OWNER":
      buckets.noOwner += 1;
      break;
    case "NO_DUE_DATE":
      buckets.noDueDate += 1;
      break;
    case "ON_TRACK":
      buckets.onTrack += 1;
      break;
    case "DUE_SOON":
      buckets.dueSoon += 1;
      break;
    case "OVERDUE":
      buckets.overdue += 1;
      break;
    case "BLOCKED_BY_CLIENT":
      buckets.blockedByClient += 1;
      break;
    case "WAITING_LAWYER_REVIEW":
      buckets.waitingLawyerReview += 1;
      break;
    default:
      buckets.noDueDate += 1;
      break;
  }
}

function incrementPriorityBucket(
  buckets: LegalReliabilityActionOperationDashboardSummary["byPriority"],
  priority?: string | null,
) {
  switch (priority) {
    case "LOW":
      buckets.low += 1;
      break;
    case "HIGH":
      buckets.high += 1;
      break;
    case "URGENT":
      buckets.urgent += 1;
      break;
    default:
      buckets.medium += 1;
      break;
  }
}

export function buildLegalReliabilityActionOperationDashboardSummary(input: {
  caseId: string;
  operations: OperationLike[];
  filter?: LegalReliabilityActionOperationDashboardFilter;
}) {
  const byStatus = emptyByStatus();
  const bySla = emptyBySla();
  const byPriority = emptyByPriority();

  const enrichedRows = input.operations.map((operation) => {
    const reviewHandoffJson = parseJsonObject(operation.reviewHandoffJson);

    const bucket = resolveLegalReliabilityActionOperationDashboardBucket({
      status: operation.status,
      assignedToUserId: operation.assignedToUserId,
      slaStatus: operation.slaStatus,
      evidenceIntakeStatus: operation.evidenceIntakeStatus,
      clientResponseReceivedAt: operation.clientResponseReceivedAt,
      reviewHandoffJson,
    });

    const attentionScore = calculateOperationAttentionScore({
      status: operation.status,
      priority: operation.priority,
      slaStatus: operation.slaStatus,
    });

    const uploadedFileIds = parseJsonArray(operation.linkedUploadedFileIds);
    const clientSubmissionIds = parseJsonArray(operation.linkedClientSubmissionIds);

    const downstreamReadiness = resolveDownstreamReadiness({
      operationId: operation.id,
      status: operation.status,
      evidenceIntakeStatus: operation.evidenceIntakeStatus,
      reviewHandoffJson,
    });

    incrementStatusBucket(byStatus, operation.status);
    incrementSlaBucket(bySla, operation.slaStatus);
    incrementPriorityBucket(byPriority, operation.priority);

    return {
      id: operation.id,
      caseId: operation.caseId,
      status: operation.status,
      priority: operation.priority ?? null,
      slaStatus: operation.slaStatus ?? null,
      assignedToUserId: operation.assignedToUserId ?? null,
      dueAt: operation.dueAt
        ? operation.dueAt instanceof Date
          ? operation.dueAt.toISOString()
          : String(operation.dueAt)
        : null,
      updatedAt: operation.updatedAt
        ? operation.updatedAt instanceof Date
          ? operation.updatedAt.toISOString()
          : String(operation.updatedAt)
        : null,
      bucket,
      attentionScore,
      uploadedFileCount: uploadedFileIds.length,
      clientSubmissionCount: clientSubmissionIds.length,
      evidenceIntakeStatus: operation.evidenceIntakeStatus ?? null,
      clientResponseReceivedAt: operation.clientResponseReceivedAt
        ? operation.clientResponseReceivedAt instanceof Date
          ? operation.clientResponseReceivedAt.toISOString()
          : String(operation.clientResponseReceivedAt)
        : null,
      downstreamReadiness,
    };
  });

  const sortedRows = sortDashboardRows(enrichedRows);
  const filteredRows = filterDashboardRows(sortedRows, input.filter ?? "ALL");

  const rowsForMetrics = sortedRows;

  return {
    caseId: input.caseId,
    total: rowsForMetrics.length,
    byStatus,
    bySla,
    byPriority,
    response: {
      clientRespondedCount: rowsForMetrics.filter((row) =>
        Boolean(row.clientResponseReceivedAt),
      ).length,
      uploadedFileCount: rowsForMetrics.reduce((sum, row) => sum + row.uploadedFileCount, 0),
      evidenceUnderReviewCount: rowsForMetrics.filter(
        (row) => row.evidenceIntakeStatus === "UNDER_REVIEW",
      ).length,
      lawyerReviewRequiredCount: rowsForMetrics.filter(
        (row) => row.bucket === "LAWYER_REVIEW_REQUIRED",
      ).length,
    },
    downstream: {
      courtReadyAllowedCount: rowsForMetrics.filter(
        (row) => row.downstreamReadiness.courtReadyAllowed,
      ).length,
      blockedByUnreviewedEvidenceCount: rowsForMetrics.filter((row) =>
        row.downstreamReadiness.blockedReasons.includes("EVIDENCE_UNDER_REVIEW"),
      ).length,
      blockedByNoLawyerCompletionCount: rowsForMetrics.filter((row) =>
        row.downstreamReadiness.blockedReasons.includes("NOT_COMPLETED"),
      ).length,
    },
    attention: {
      needsImmediateAttentionCount: rowsForMetrics.filter((row) => row.attentionScore >= 150)
        .length,
      overdueOrUrgentCount: rowsForMetrics.filter(
        (row) => row.slaStatus === "OVERDUE" || row.priority === "URGENT",
      ).length,
      dueSoonCount: rowsForMetrics.filter((row) => row.slaStatus === "DUE_SOON").length,
      waitingLawyerReviewCount: rowsForMetrics.filter(
        (row) => row.status === "LAWYER_REVIEWING_RESPONSE",
      ).length,
    },
    rows: filteredRows,
  } satisfies LegalReliabilityActionOperationDashboardSummary;
}

export async function getLegalReliabilityActionOperationsDashboardService(
  currentUser: SessionUser,
  caseId: string,
  filter?: LegalReliabilityActionOperationDashboardFilter,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReadLegalReliabilityActionOperations({
    actor: currentUser,
    canRead: access.canRead,
  });

  const operations = await listLegalReliabilityActionOperationsRepository(caseId);

  return buildLegalReliabilityActionOperationDashboardSummary({
    caseId,
    operations,
    filter,
  });
}

export async function getLegalReliabilityActionOperationsDashboardForCommandCenter(
  caseId: string,
) {
  const operations = await listLegalReliabilityActionOperationsRepository(caseId);

  return buildLegalReliabilityActionOperationDashboardSummary({
    caseId,
    operations,
  });
}
