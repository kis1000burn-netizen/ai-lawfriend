/**
 * Product Phase 22-A — Tenant / Organization repository.
 */
import type { Prisma, TenantMembershipRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateTenantInput } from "./tenant-organization.schema";

export const TENANT_ORGANIZATION_REPOSITORY_MARKER_PHASE22A =
  "phase22a-tenant-organization-repository" as const;

export async function findTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({ where: { slug } });
}

export async function findTenantById(tenantId: string) {
  return prisma.tenant.findUnique({ where: { id: tenantId } });
}

export async function listTenantsForAdmin(limit = 100) {
  return prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      plan: true,
      memberships: {
        where: { isActive: true },
        select: { id: true },
      },
    },
  });
}

export async function listActiveMembershipsForUser(userId: string) {
  return prisma.tenantMembership.findMany({
    where: { userId, isActive: true },
    include: { tenant: true },
    orderBy: [{ isPrimary: "desc" }, { joinedAt: "asc" }],
  });
}

export async function findPrimaryMembershipForUser(userId: string) {
  return prisma.tenantMembership.findFirst({
    where: { userId, isActive: true, isPrimary: true },
    include: { tenant: true },
  });
}

export async function createTenantWithOwner(input: CreateTenantInput & { ownerUserId: string }) {
  return prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        slug: input.slug,
        legalName: input.legalName,
        displayName: input.displayName ?? input.legalName,
        status: "ACTIVE",
      },
    });

    await tx.tenantMembership.create({
      data: {
        tenantId: tenant.id,
        userId: input.ownerUserId,
        role: "OWNER",
        isPrimary: true,
        isActive: true,
      },
    });

    return tenant;
  });
}

export async function upsertTenantMembership(input: {
  tenantId: string;
  userId: string;
  role: TenantMembershipRole;
  isPrimary?: boolean;
}) {
  return prisma.tenantMembership.upsert({
    where: {
      tenantId_userId: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
    },
    create: {
      tenantId: input.tenantId,
      userId: input.userId,
      role: input.role,
      isPrimary: input.isPrimary ?? false,
      isActive: true,
    },
    update: {
      role: input.role,
      isPrimary: input.isPrimary ?? undefined,
      isActive: true,
      endedAt: null,
    },
  });
}

export async function attachTenantToCase(caseId: string, tenantId: string | null) {
  return prisma.case.update({
    where: { id: caseId },
    data: { tenantId },
    select: { id: true, tenantId: true },
  });
}

export type TenantOrganizationSummary = Prisma.TenantGetPayload<{
  include: { memberships: { where: { isActive: true } } };
}>;

export async function getTenantOrganizationSummary(tenantId: string) {
  return prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      memberships: {
        where: { isActive: true },
        select: {
          id: true,
          userId: true,
          role: true,
          isPrimary: true,
          joinedAt: true,
        },
      },
    },
  });
}
