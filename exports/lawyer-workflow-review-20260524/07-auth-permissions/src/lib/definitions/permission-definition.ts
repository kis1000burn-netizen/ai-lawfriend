import type { UserRole } from "@prisma/client";

/**
 * 권한 정의서 1차본 — subject / action 기준.
 * DB 스키마 변경 없이 코드에서 확장 가능.
 */
export type PermissionSubject =
  | "case"
  | "case.status"
  | "case.timeline"
  | "case.assignment"
  | "admin.platform";

export type PermissionAction =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "soft_delete"
  | "status.transition"
  | "staff_review"
  | "manage";

export type RolePermissionDefinition = {
  role: UserRole;
  /** 이 역할에 허용되는 (subject → actions) */
  grants: Partial<Record<PermissionSubject, PermissionAction[]>>;
};

const DEFINITIONS: Record<UserRole, RolePermissionDefinition> = {
  USER: {
    role: "USER",
    grants: {
      case: ["read", "create", "update", "soft_delete"],
      "case.status": ["read", "status.transition"],
      "case.timeline": ["read"],
      "case.assignment": ["read"],
    },
  },
  LAWYER: {
    role: "LAWYER",
    grants: {
      case: ["read", "create", "update", "soft_delete"],
      "case.status": ["read", "status.transition"],
      "case.timeline": ["read", "update"],
      "case.assignment": ["read", "update"],
    },
  },
  STAFF: {
    role: "STAFF",
    grants: {
      case: ["read", "update", "staff_review"],
      "case.status": ["read", "status.transition"],
      "case.timeline": ["read", "update"],
      "case.assignment": ["read"],
      "admin.platform": ["read"],
    },
  },
  ADMIN: {
    role: "ADMIN",
    grants: {
      case: ["read", "create", "update", "delete", "soft_delete"],
      "case.status": ["read", "status.transition", "manage"],
      "case.timeline": ["read", "update", "manage"],
      "case.assignment": ["read", "update", "manage"],
      "admin.platform": ["read", "manage"],
    },
  },
  SUPER_ADMIN: {
    role: "SUPER_ADMIN",
    grants: {
      case: ["read", "create", "update", "delete", "soft_delete"],
      "case.status": ["read", "status.transition", "manage"],
      "case.timeline": ["read", "update", "manage"],
      "case.assignment": ["read", "update", "manage"],
      "admin.platform": ["read", "manage"],
    },
  },
};

export function getRolePermissionDefinition(
  role: UserRole,
): RolePermissionDefinition {
  return DEFINITIONS[role];
}

export function hasDefinedPermission(
  role: UserRole,
  subject: PermissionSubject,
  action: PermissionAction,
): boolean {
  const actions = DEFINITIONS[role].grants[subject];
  if (!actions?.length) return false;
  return actions.includes(action);
}

export function listRoleActions(
  role: UserRole,
  subject?: PermissionSubject,
): PermissionAction[] {
  if (!subject) {
    const out = new Set<PermissionAction>();
    const g = DEFINITIONS[role].grants;
    for (const key of Object.keys(g) as PermissionSubject[]) {
      for (const a of g[key] ?? []) out.add(a);
    }
    return [...out];
  }
  return [...(DEFINITIONS[role].grants[subject] ?? [])];
}

/** 디버그·관리자 UI용 스냅샷 */
export function exportPermissionDefinitionsSnapshot() {
  return Object.values(DEFINITIONS).map((d) => ({
    role: d.role,
    grants: d.grants,
  }));
}
