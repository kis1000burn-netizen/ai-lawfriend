/**
 * Product Phase 50-B — Legal Reliability Action Operations SLA SSOT.
 */
import type { LegalReliabilityActionSlaStatus } from "./legal-reliability-action-operation.schema";

export const SLA_BADGE_LABELS: Record<LegalReliabilityActionSlaStatus, string> = {
  NO_OWNER: "담당자 없음",
  NO_DUE_DATE: "기한 없음",
  ON_TRACK: "정상",
  DUE_SOON: "마감 임박",
  OVERDUE: "기한 초과",
  BLOCKED_BY_CLIENT: "의뢰인 응답 대기",
  WAITING_LAWYER_REVIEW: "변호사 검토 대기",
};

export function computeLegalReliabilityActionSlaStatus(input: {
  assignedToUserId?: string | null;
  dueAt?: Date | null;
  now: Date;
  status: string;
  clientResponseReceivedAt?: Date | null;
  lawyerReviewedAt?: Date | null;
}): LegalReliabilityActionSlaStatus {
  if (!input.assignedToUserId) return "NO_OWNER";

  if (
    (input.status === "CLIENT_RESPONDED" ||
      input.status === "EVIDENCE_INTAKE_LINKED" ||
      input.status === "LAWYER_REVIEWING_RESPONSE") &&
    !input.lawyerReviewedAt
  ) {
    return "WAITING_LAWYER_REVIEW";
  }

  if (input.status === "SENT_TO_CLIENT" && !input.clientResponseReceivedAt) {
    return "BLOCKED_BY_CLIENT";
  }

  if (!input.dueAt) return "NO_DUE_DATE";

  const msUntilDue = input.dueAt.getTime() - input.now.getTime();
  const hoursUntilDue = msUntilDue / (1000 * 60 * 60);

  if (hoursUntilDue < 0) return "OVERDUE";
  if (hoursUntilDue <= 24) return "DUE_SOON";

  return "ON_TRACK";
}

export function getSlaBadgeLabel(status: LegalReliabilityActionSlaStatus) {
  return SLA_BADGE_LABELS[status];
}
