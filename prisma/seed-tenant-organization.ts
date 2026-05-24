/**
 * Product Phase 22-A — Seed default demo tenant + memberships.
 */
import type { PrismaClient } from "@prisma/client";
import {
  suggestTenantMembershipRoleForPlatformRole,
  TENANT_ORGANIZATION_DEFAULT_SLUG,
} from "@/features/platform/tenant-organization/tenant-organization.policy";
import {
  createTenantWithOwner,
  findTenantBySlug,
  upsertTenantMembership,
} from "@/features/platform/tenant-organization/tenant-organization.repository";

export async function seedTenantOrganizationDemo(prisma: PrismaClient) {
  const lawyer = await prisma.user.findUnique({ where: { email: "lawyer@aibupchin.com" } });
  if (!lawyer) {
    return null;
  }

  let tenant = await findTenantBySlug(TENANT_ORGANIZATION_DEFAULT_SLUG);
  if (!tenant) {
    tenant = await createTenantWithOwner({
      slug: TENANT_ORGANIZATION_DEFAULT_SLUG,
      legalName: "AI법친 데모 법무법인",
      displayName: "AI법친 데모",
      ownerUserId: lawyer.id,
    });
  }

  const staff = await prisma.user.findUnique({ where: { email: "staff@example.com" } });
  if (staff) {
    const staffRole = suggestTenantMembershipRoleForPlatformRole(staff.role);
    if (staffRole) {
      await upsertTenantMembership({
        tenantId: tenant.id,
        userId: staff.id,
        role: staffRole,
      });
    }
  }

  const admin = await prisma.user.findUnique({ where: { email: "admin@aibupchin.com" } });
  if (admin) {
    const adminRole = suggestTenantMembershipRoleForPlatformRole(admin.role);
    if (adminRole) {
      await upsertTenantMembership({
        tenantId: tenant.id,
        userId: admin.id,
        role: adminRole,
      });
    }
  }

  return tenant;
}
