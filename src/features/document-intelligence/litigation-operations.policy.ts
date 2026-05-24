/**
 * Phase 13-H — confirmed-only downstream policy.
 */
import type { CaseAccessContext } from "@/features/cases/case.permissions";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import { isConfirmedReviewStatus } from "./document-intelligence-review.schema";
import type { DocumentIntelligenceReviewQueueItem } from "./document-intelligence-review.schema";

export const PHASE13H_LITIGATION_OPERATIONS_POLICY_MARKER =
  "PHASE13H_LITIGATION_OPERATIONS_POLICY" as const;

export function assertCanRunLitigationOperationsSync(
  access: CaseAccessContext,
): void {
  const allowed =
    access.isAssignedLawyer ||
    access.isAssignedStaff ||
    access.isAdmin;

  if (!allowed) {
    throw new ForbiddenError("소송 운영 연동 실행 권한이 없습니다.");
  }
}

export function assertCanReadLitigationOperations(access: CaseAccessContext): void {
  if (!access.canRead) {
    throw new ForbiddenError("소송 운영 연동 결과 열람 권한이 없습니다.");
  }
}

export function assertReviewItemConfirmedForDownstream(
  item: Pick<DocumentIntelligenceReviewQueueItem, "itemId" | "reviewStatus">,
): void {
  if (!isConfirmedReviewStatus(item.reviewStatus)) {
    throw new ValidationError(
      `항목 ${item.itemId}은(는) 변호사 확정(LAWYER_CONFIRMED/LAWYER_CORRECTED) 전에는 downstream에 사용할 수 없습니다.`,
    );
  }
}

/** @alias assertReviewItemConfirmedForDownstream */
export const assertConfirmedForDownstreamUse = assertReviewItemConfirmedForDownstream;

export function isEligibleForDownstreamSync(
  item: DocumentIntelligenceReviewQueueItem,
): boolean {
  return isConfirmedReviewStatus(item.reviewStatus);
}
