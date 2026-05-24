import type { UserRole as PrismaUserRole } from "@prisma/client";
import type { UserRole as DefinitionUserRole } from "@/lib/definitions";

/**
 * Prisma `UserRole`(DB·세션)을 단일 진실원으로 두고, 질문셋·UI 4분할 패널 등에 쓰는
 * 카탈로그 역할(`CLIENT` = 의뢰인, Prisma에서는 `USER`)로 투영한다.
 * [ALIGNMENT §6-3 RB-01](docs/project-governance/ALIGNMENT_AUDIT_V1.md#6-3-권한-정합성)
 */
export type UiFourPanelRole = DefinitionUserRole;

/**
 * Prisma `UserRole`(USER·SUPER_ADMIN 등) → Zod/정의서 `UserRole`(CLIENT·ADMIN 등)
 */
export function prismaRoleToDefinitionRole(role: PrismaUserRole): UiFourPanelRole {
  switch (role) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "ADMIN";
    case "LAWYER":
      return "LAWYER";
    case "STAFF":
      return "STAFF";
    case "USER":
    default:
      return "CLIENT";
  }
}

/** UI 컴포넌트(액션 패널 등)용 4분할 역할 */
export function prismaRoleToUiRole(role: PrismaUserRole): UiFourPanelRole {
  return prismaRoleToDefinitionRole(role);
}
