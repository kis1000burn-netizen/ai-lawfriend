/**
 * Phase 13-G — review gate policy & confirmed-only downstream guard.
 */
import type { CaseAccessContext } from "@/features/cases/case.permissions";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import {
  isConfirmedReviewStatus,
  type DocumentIntelligenceReviewQueueItem,
} from "./document-intelligence-review.schema";

export const PHASE13G_DOCUMENT_INTELLIGENCE_REVIEW_POLICY_MARKER =
  "PHASE13G_DOCUMENT_INTELLIGENCE_REVIEW_POLICY" as const;

export function assertCanReadDocumentIntelligenceReviewQueue(
  access: CaseAccessContext,
): void {
  if (!access.canRead) {
    throw new ForbiddenError("서류·증거 분석 검토 큐 열람 권한이 없습니다.");
  }
}

export function assertCanDecideDocumentIntelligenceReviewItem(
  access: CaseAccessContext,
): void {
  const allowed =
    access.isAssignedLawyer ||
    access.isAssignedStaff ||
    access.isAdmin;

  if (!allowed) {
    throw new ForbiddenError("서류·증거 분석 항목 검토 권한이 없습니다.");
  }
}

export function assertConfirmedForDownstreamUse(item: {
  reviewStatus: string;
  itemId?: string;
}): void {
  if (!isConfirmedReviewStatus(item.reviewStatus)) {
    throw new ValidationError(
      "LAWYER_CONFIRMED 또는 LAWYER_CORRECTED 전에는 서면작성·기일확정·의뢰인 공개에 확정값으로 사용할 수 없습니다.",
    );
  }
}

export function filterDownstreamUsableItems(
  items: DocumentIntelligenceReviewQueueItem[],
): DocumentIntelligenceReviewQueueItem[] {
  return items.filter((item) => item.downstreamUsable);
}

export function assertNoClientDisclosureBeforeRelease(item: {
  reviewStatus: string;
  clientVisible?: boolean;
}): void {
  if (item.clientVisible && !isConfirmedReviewStatus(item.reviewStatus)) {
    throw new ValidationError(
      "변호사 확정 전에는 의뢰인 공개(release gate)에 사용할 수 없습니다.",
    );
  }
}
