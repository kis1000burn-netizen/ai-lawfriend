/**
 * Product Phase 22-A — Tenant / Organization policy SSOT.
 */
import type { UserRole } from "@prisma/client";
import type { TenantMembershipRole } from "./tenant-organization.schema";

export const TENANT_ORGANIZATION_POLICY_MARKER_PHASE22A =
  "phase22a-tenant-organization-policy" as const;

export const TENANT_ORGANIZATION_DEFAULT_SLUG = "aibeopchin-demo" as const;

export const TENANT_ORGANIZATION_PLATFORM_ROLES_WITH_MEMBERSHIP: UserRole[] = [
  "LAWYER",
  "STAFF",
  "ADMIN",
];

export function normalizeTenantSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function suggestTenantMembershipRoleForPlatformRole(
  platformRole: UserRole,
): TenantMembershipRole | null {
  switch (platformRole) {
    case "LAWYER":
      return "LAWYER";
    case "STAFF":
      return "STAFF";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "ADMIN";
    default:
      return null;
  }
}

export function assertTenantIsActive(status: string): void {
  if (status !== "ACTIVE") {
    throw new Error("TENANT_NOT_ACTIVE");
  }
}

export function canManageTenantMembership(role: TenantMembershipRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function resolveTenantScopedCaseTenantId(input: {
  explicitTenantId?: string | null;
  ownerPrimaryTenantId?: string | null;
}): string | null {
  return input.explicitTenantId ?? input.ownerPrimaryTenantId ?? null;
}
