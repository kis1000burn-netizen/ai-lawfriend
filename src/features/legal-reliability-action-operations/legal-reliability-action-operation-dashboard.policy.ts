/**
 * Product Phase 50-E — Command Center Execution Dashboard policy SSOT.
 */
import type {
  LegalReliabilityActionOperationDashboardBucket,
  LegalReliabilityActionOperationDashboardFilter,
  LegalReliabilityActionOperationDownstreamReadiness,
} from "./legal-reliability-action-operation-dashboard.schema";

export const PHASE50E_DASHBOARD_POLICY_MARKER =
  "phase50e-legal-reliability-action-operations-dashboard-policy" as const;

/** Dashboard is visibility-only — no automatic side effects. */
export const NO_DASHBOARD_AUTO_COMPLETION = "NO_DASHBOARD_AUTO_COMPLETION" as const;
export const NO_DASHBOARD_AUTO_MESSAGING = "NO_DASHBOARD_AUTO_MESSAGING" as const;
export const NO_DASHBOARD_AUTO_FILING = "NO_DASHBOARD_AUTO_FILING" as const;
export const NO_UNREVIEWED_EVIDENCE_DOWNSTREAM = "NO_UNREVIEWED_EVIDENCE_DOWNSTREAM" as const;
export const NO_AI_OPERATION_PRIORITY_OVERRIDE = "NO_AI_OPERATION_PRIORITY_OVERRIDE" as const;
export const NO_CLIENT_VISIBLE_OPERATION_STRATEGY =
  "NO_CLIENT_VISIBLE_OPERATION_STRATEGY" as const;
export const LAWYER_REVIEW_REQUIRED_FOR_COMPLETION =
  "LAWYER_REVIEW_REQUIRED_FOR_COMPLETION" as const;

const SLA_WEIGHT: Record<string, number> = {
  OVERDUE: 100,
  DUE_SOON: 80,
  WAITING_LAWYER_REVIEW: 75,
  BLOCKED_BY_CLIENT: 50,
  NO_OWNER: 45,
  NO_DUE_DATE: 30,
  ON_TRACK: 10,
};

const PRIORITY_WEIGHT: Record<string, number> = {
  URGENT: 40,
  HIGH: 30,
  MEDIUM: 20,
  LOW: 10,
};

const STATUS_WEIGHT: Record<string, number> = {
  LAWYER_REVIEWING_RESPONSE: 90,
  EVIDENCE_INTAKE_LINKED: 85,
  CLIENT_RESPONDED: 80,
  NEEDS_MORE_INFO: 70,
  REOPENED: 65,
  WAITING_TO_SEND: 60,
  SENT_TO_CLIENT: 40,
  ASSIGNED: 30,
  READY: 20,
  DEFERRED: 10,
  COMPLETED: 0,
  CANCELED: 0,
};

export function resolveLegalReliabilityActionOperationDashboardBucket(input: {
  status: string;
  assignedToUserId?: string | null;
  slaStatus?: string | null;
  evidenceIntakeStatus?: string | null;
  clientResponseReceivedAt?: Date | string | null;
  reviewHandoffJson?: unknown;
}): LegalReliabilityActionOperationDashboardBucket {
  if (input.status === "COMPLETED") return "COMPLETED";
  if (input.status === "CANCELED") return "CANCELED";
  if (input.status === "DEFERRED") return "DEFERRED";
  if (input.status === "REOPENED") return "REOPENED";
  if (input.status === "NEEDS_MORE_INFO") return "NEEDS_MORE_INFO";

  if (!input.assignedToUserId) return "NEEDS_ASSIGNMENT";

  if (input.status === "WAITING_TO_SEND") return "READY_TO_SEND";
  if (input.status === "SENT_TO_CLIENT") return "WAITING_CLIENT";

  if (input.status === "CLIENT_RESPONDED") return "CLIENT_RESPONSE_ARRIVED";

  if (
    input.status === "EVIDENCE_INTAKE_LINKED" ||
    input.evidenceIntakeStatus === "UNDER_REVIEW"
  ) {
    return "EVIDENCE_UNDER_REVIEW";
  }

  if (input.status === "LAWYER_REVIEWING_RESPONSE") {
    return "LAWYER_REVIEW_REQUIRED";
  }

  return "READY_TO_SEND";
}

export function calculateOperationAttentionScore(input: {
  status: string;
  slaStatus?: string | null;
  priority?: string | null;
}) {
  return (
    (SLA_WEIGHT[input.slaStatus ?? "NO_DUE_DATE"] ?? 0) +
    (PRIORITY_WEIGHT[input.priority ?? "MEDIUM"] ?? 0) +
    (STATUS_WEIGHT[input.status] ?? 0)
  );
}

export function resolveDownstreamReadiness(input: {
  operationId: string;
  status: string;
  evidenceIntakeStatus?: string | null;
  reviewHandoffJson?: Record<string, unknown> | null;
}): LegalReliabilityActionOperationDownstreamReadiness {
  const blockedReasons: LegalReliabilityActionOperationDownstreamReadiness["blockedReasons"] =
    [];

  const phase50d = input.reviewHandoffJson?.phase50d as
    | { decidedByUserId?: string; courtReadyAllowed?: boolean }
    | undefined;

  if (input.status !== "COMPLETED") {
    blockedReasons.push("NOT_COMPLETED");
  }

  if (!phase50d?.decidedByUserId) {
    blockedReasons.push("NO_LAWYER_REVIEW");
  }

  if (input.evidenceIntakeStatus === "UNDER_REVIEW") {
    blockedReasons.push("EVIDENCE_UNDER_REVIEW");
  }

  if (input.evidenceIntakeStatus && input.evidenceIntakeStatus !== "LAWYER_CONFIRMED") {
    blockedReasons.push("EVIDENCE_NOT_CONFIRMED");
  }

  if (input.status === "CANCELED" || input.status === "DEFERRED") {
    blockedReasons.push("CANCELED_OR_DEFERRED");
  }

  const allowed = blockedReasons.length === 0;

  return {
    operationId: input.operationId,
    courtReadyAllowed: allowed && phase50d?.courtReadyAllowed === true,
    draftContextAllowed: allowed,
    graphUpdateAllowed: allowed,
    evidenceUseAllowed: allowed,
    blockedReasons,
  };
}

export function filterDashboardRows<
  T extends { bucket: string; slaStatus?: string | null; status: string; attentionScore: number },
>(rows: T[], filter: LegalReliabilityActionOperationDashboardFilter): T[] {
  switch (filter) {
    case "NEEDS_ATTENTION":
      return rows.filter((row) => row.attentionScore >= 150);
    case "OVERDUE":
      return rows.filter((row) => row.slaStatus === "OVERDUE");
    case "DUE_SOON":
      return rows.filter((row) => row.slaStatus === "DUE_SOON");
    case "CLIENT_RESPONDED":
      return rows.filter((row) => row.bucket === "CLIENT_RESPONSE_ARRIVED");
    case "EVIDENCE_UNDER_REVIEW":
      return rows.filter((row) => row.bucket === "EVIDENCE_UNDER_REVIEW");
    case "LAWYER_REVIEW_REQUIRED":
      return rows.filter((row) => row.bucket === "LAWYER_REVIEW_REQUIRED");
    case "COMPLETED":
      return rows.filter((row) => row.bucket === "COMPLETED");
    default:
      return rows;
  }
}

export function sortDashboardRows<
  T extends {
    attentionScore: number;
    dueAt?: Date | string | null;
    priority?: string | null;
    updatedAt?: Date | string | null;
  },
>(rows: T[]): T[] {
  const priorityRank: Record<string, number> = {
    URGENT: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  return [...rows].sort((a, b) => {
    if (b.attentionScore !== a.attentionScore) {
      return b.attentionScore - a.attentionScore;
    }

    const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
    const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
    if (aDue !== bDue) return aDue - bDue;

    const aPriority = priorityRank[a.priority ?? "MEDIUM"] ?? 0;
    const bPriority = priorityRank[b.priority ?? "MEDIUM"] ?? 0;
    if (bPriority !== aPriority) return bPriority - aPriority;

    const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bUpdated - aUpdated;
  });
}
