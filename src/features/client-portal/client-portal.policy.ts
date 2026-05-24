/**
 * Phase 15-A — Client portal access policy.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError } from "@/lib/errors";
import type { CaseAccessContext } from "@/features/cases/case.permissions";

export function assertClientPortalUser(currentUser: SessionUser) {
  if (currentUser.role !== "USER") {
    throw new ForbiddenError("의뢰인 포털은 의뢰인 계정만 이용할 수 있습니다.");
  }
}

export function assertCanAccessClientPortalCase(
  currentUser: SessionUser,
  access: CaseAccessContext,
) {
  if (!access.canRead || !access.isOwner) {
    throw new ForbiddenError("해당 사건 포털에 접근할 수 없습니다.");
  }
}

export function assertCanReviewClientSubmission(access: CaseAccessContext) {
  if (!(access.isAssignedLawyer || access.isAssignedStaff || access.isAdmin)) {
    throw new ForbiddenError("의뢰인 제출 자료 검토 권한이 없습니다.");
  }
}

export function assertCanAccessCaseConversation(access: CaseAccessContext) {
  if (!access.canRead) {
    throw new ForbiddenError("사건 대화에 접근할 수 없습니다.");
  }
}

export function assertCanPostCaseConversation(
  currentUser: SessionUser,
  access: CaseAccessContext,
) {
  if (!access.canRead) {
    throw new ForbiddenError("사건 대화에 참여할 수 없습니다.");
  }
  if (currentUser.role === "USER" && !access.isOwner) {
    throw new ForbiddenError("해당 사건 대화에 참여할 수 없습니다.");
  }
}
