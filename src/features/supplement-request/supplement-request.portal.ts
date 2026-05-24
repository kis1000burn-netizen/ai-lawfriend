/**
 * Phase 15-A — Client portal supplement tracking SSOT.
 */
import type { SupplementRequestStatus } from "@prisma/client";

export const PHASE15A_CLIENT_SUPPLEMENT_TRACKING_MARKER =
  "PHASE15A_CLIENT_SUPPLEMENT_TRACKING" as const;

/** 의뢰인 포털 목록에 노출하지 않는 상태 */
export const SUPPLEMENT_CLIENT_HIDDEN_STATUSES = new Set<SupplementRequestStatus>([
  "DRAFT",
  "CANCELLED",
]);

/** 의뢰인이 응답(제출) 가능한 상태 */
export const SUPPLEMENT_CLIENT_RESPONDABLE_STATUSES = new Set<SupplementRequestStatus>([
  "SENT",
  "CLIENT_VIEWED",
  "NEEDS_MORE_INFO",
]);

/** 변호사 Command Center — 의뢰인 확인 대기 */
export const SUPPLEMENT_AWAITING_CLIENT_STATUSES = new Set<SupplementRequestStatus>([
  "SENT",
  "CLIENT_VIEWED",
]);

export function isSupplementVisibleToClient(status: SupplementRequestStatus): boolean {
  return !SUPPLEMENT_CLIENT_HIDDEN_STATUSES.has(status);
}

export function canClientRespondToSupplement(status: SupplementRequestStatus): boolean {
  return SUPPLEMENT_CLIENT_RESPONDABLE_STATUSES.has(status);
}

export function mapSupplementStatusForCommandCenter(status: SupplementRequestStatus) {
  return {
    isDraft: status === "DRAFT",
    awaitingClient: SUPPLEMENT_AWAITING_CLIENT_STATUSES.has(status),
    awaitingReview: status === "CLIENT_RESPONDED",
    needsMoreInfo: status === "NEEDS_MORE_INFO",
  };
}

export function countClientPendingSupplements(
  statuses: SupplementRequestStatus[],
): number {
  return statuses.filter((s) => SUPPLEMENT_AWAITING_CLIENT_STATUSES.has(s)).length;
}
