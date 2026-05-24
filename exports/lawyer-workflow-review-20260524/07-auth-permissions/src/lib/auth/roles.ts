import type { UserRole } from "@prisma/client";

/**
 * [FILE-005] 역할·상대 순위 단일 기준(세션 `role` 문자열의 비교·관리자 판정).
 * 사건 `CaseStatus` / `allowedLifecycleActions` / 전이(`applyCaseStatusTransition`)와 직교하며
 * `src/lib/cases/allowed-actions.ts`·Prisma `UserRole` enum과 병기한다. (§5·Batch A·B)
 *
 * 운영 플랫폼 3단계(문서·정책 기준 순위).
 * USER/LAWYER 비교는 `LEGACY_ORDER`를 사용합니다.
 */
export const OPERATIONS_PLATFORM_ROLES = [
  "STAFF",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

export type AppRole = (typeof OPERATIONS_PLATFORM_ROLES)[number];

export const OPERATIONS_ROLE_RANK: Record<AppRole, number> = {
  STAFF: 10,
  ADMIN: 20,
  SUPER_ADMIN: 30,
};

/** @deprecated `OPERATIONS_ROLE_RANK` 사용 */
export const ROLE_RANK = OPERATIONS_ROLE_RANK;

export type OperationsRoleKey = keyof typeof OPERATIONS_ROLE_RANK;

const LEGACY_ORDER: Record<UserRole, number> = {
  USER: 10,
  LAWYER: 40,
  STAFF: 60,
  ADMIN: 80,
  SUPER_ADMIN: 100,
};

export function hasRoleAtLeast(
  currentRole: string | null | undefined,
  minimumRole: UserRole,
): boolean {
  if (!currentRole) return false;
  const cur = currentRole as UserRole;

  if (minimumRole === "USER" || minimumRole === "LAWYER") {
    return (LEGACY_ORDER[cur] ?? 0) >= LEGACY_ORDER[minimumRole];
  }

  if (!(cur in OPERATIONS_ROLE_RANK)) return false;
  return (
    OPERATIONS_ROLE_RANK[cur as AppRole] >=
    OPERATIONS_ROLE_RANK[minimumRole as AppRole]
  );
}

export function hasMinRole(
  currentRole: string | null | undefined,
  minimumRole: OperationsRoleKey,
) {
  return hasRoleAtLeast(currentRole, minimumRole);
}

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isStaffRole(role: string | null | undefined): boolean {
  return role === "STAFF";
}
