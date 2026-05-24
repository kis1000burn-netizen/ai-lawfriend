import type {
  CasePackageShare,
  CasePackageShareStatus,
  UserRole,
} from "@prisma/client";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";

export function assertUserOwnsCase(
  currentUser: { id: string; role: UserRole },
  targetCase: { ownerUserId: string },
) {
  const isAdmin =
    currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";

  if (!isAdmin && targetCase.ownerUserId !== currentUser.id) {
    throw new ForbiddenError("본인 사건만 공유할 수 있습니다.");
  }
}

export function assertCanReadCasePackageShare(
  currentUser: { id: string; role: UserRole },
  share: Pick<CasePackageShare, "ownerUserId" | "lawyerUserId">,
) {
  const isAdmin =
    currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";

  if (isAdmin) return;

  if (share.ownerUserId === currentUser.id) return;

  if (currentUser.role === "LAWYER" && share.lawyerUserId === currentUser.id) {
    return;
  }

  throw new ForbiddenError("사건 패키지 공유에 접근할 권한이 없습니다.");
}

export function assertActiveShare(
  share: Pick<CasePackageShare, "status" | "expiresAt" | "revokedAt">,
) {
  if (share.status === "REVOKED" || share.revokedAt) {
    throw new ForbiddenError("취소된 사건 패키지 공유입니다.");
  }

  if (share.status === "EXPIRED") {
    throw new ForbiddenError("만료된 사건 패키지 공유입니다.");
  }

  if (share.expiresAt && share.expiresAt.getTime() < Date.now()) {
    throw new ForbiddenError("공유 기간이 만료되었습니다.");
  }

  if (share.status !== "ACTIVE") {
    throw new ForbiddenError("활성 상태의 사건 패키지 공유가 아닙니다.");
  }
}

export function assertLawyerCanLookupShare(
  currentUser: { id: string; role: UserRole },
  share: Pick<
    CasePackageShare,
    "lawyerUserId" | "status" | "expiresAt" | "revokedAt"
  >,
) {
  if (
    currentUser.role !== "LAWYER" &&
    currentUser.role !== "ADMIN" &&
    currentUser.role !== "SUPER_ADMIN"
  ) {
    throw new ForbiddenError("변호사 또는 관리자만 사건 패키지를 조회할 수 있습니다.");
  }

  assertActiveShare(share);

  if (share.lawyerUserId && share.lawyerUserId !== currentUser.id) {
    const isAdmin =
      currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";

    if (!isAdmin) {
      throw new ForbiddenError("지정된 변호사만 열람할 수 있습니다.");
    }
  }
}

export function ensureShareCanBeCreated(input: {
  consentText: string;
  expiresAt?: Date | null;
}) {
  if (input.consentText.trim().length < 20) {
    throw new ValidationError("공유 동의 문구가 충분하지 않습니다.");
  }

  if (input.expiresAt && input.expiresAt.getTime() <= Date.now()) {
    throw new ValidationError("공유 만료일은 현재 시각 이후여야 합니다.");
  }
}

export function normalizeShareStatusByTime(
  status: CasePackageShareStatus,
  expiresAt?: Date | null,
): CasePackageShareStatus {
  if (status === "ACTIVE" && expiresAt && expiresAt.getTime() < Date.now()) {
    return "EXPIRED";
  }

  return status;
}

export function assertFound<T>(value: T | null | undefined, message: string): T {
  if (!value) {
    throw new NotFoundError(message);
  }

  return value;
}