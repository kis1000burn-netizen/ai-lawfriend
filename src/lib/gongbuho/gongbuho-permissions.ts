import type { UserRole } from "@prisma/client";
import type { SessionUser } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/errors";

export type GongbuhoRole = "STAFF" | "ADMIN" | "SUPER_ADMIN";

export type GongbuhoOperation =
  | "LIST"
  | "DETAIL"
  | "PREVIEW"
  | "APPROVE"
  | "ARCHIVE"
  | "PROJECT_QUESTION_SET"
  | "CREATE_PACKET"
  | "OPERATE_SEEDED_PACKET"
  | "RECOVER"
  | "FINAL_ADMIN";

const STAFF_ALLOWED: GongbuhoOperation[] = ["LIST", "DETAIL", "PREVIEW"];

const ADMIN_ALLOWED: GongbuhoOperation[] = [
  ...STAFF_ALLOWED,
  "CREATE_PACKET",
  "APPROVE",
  "ARCHIVE",
  "PROJECT_QUESTION_SET",
  "OPERATE_SEEDED_PACKET",
];

const SUPER_ADMIN_ALLOWED: GongbuhoOperation[] = [
  ...ADMIN_ALLOWED,
  "RECOVER",
  "FINAL_ADMIN",
];

export function canOperateGongbuho(
  role: GongbuhoRole,
  operation: GongbuhoOperation,
): boolean {
  if (role === "SUPER_ADMIN") {
    return SUPER_ADMIN_ALLOWED.includes(operation);
  }

  if (role === "ADMIN") {
    return ADMIN_ALLOWED.includes(operation);
  }

  return STAFF_ALLOWED.includes(operation);
}

export function assertCanOperateGongbuho(
  role: GongbuhoRole,
  operation: GongbuhoOperation,
): void {
  if (!canOperateGongbuho(role, operation)) {
    throw new Error(
      `GONGBUHO_PERMISSION_DENIED: role=${role}, operation=${operation}`,
    );
  }
}

/**
 * Gongbuho 관리 API에서 허용하는 플랫폼 사용자(STAFF 이상 세션 게이트 이후).
 * USER/LAWYER 등은 `requireStaffOrPlatformAdminApi()` 선행으로 여기까지 오지 않는다.
 */
export function sessionUserToGongbuhoRole(user: SessionUser): GongbuhoRole | null {
  const r = user.role as UserRole;
  if (r === "STAFF" || r === "ADMIN" || r === "SUPER_ADMIN") {
    return r;
  }
  return null;
}

export function assertGongbuhoOperation(
  user: SessionUser,
  operation: GongbuhoOperation,
): void {
  const role = sessionUserToGongbuhoRole(user);
  if (!role) {
    throw new ForbiddenError("공부호 관리 권한이 필요합니다.");
  }
  if (!canOperateGongbuho(role, operation)) {
    throw new ForbiddenError("이 공부호 작업을 수행할 권한이 없습니다.");
  }
}

export const GONGBUHO_PERMISSION_MATRIX: Record<
  GongbuhoRole,
  GongbuhoOperation[]
> = {
  STAFF: STAFF_ALLOWED,
  ADMIN: ADMIN_ALLOWED,
  SUPER_ADMIN: SUPER_ADMIN_ALLOWED,
};
