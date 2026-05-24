/**
 * Product Phase 22-B — Tenant plan · entitlement repository.
 */
import type { TenantPlanTier, TenantPlanStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { UpsertTenantPlanInput } from "./tenant-plan.schema";
import { parseTenantFeatureFlagOverrides } from "./tenant-entitlement.policy";

export const TENANT_ENTITLEMENT_REPOSITORY_MARKER_PHASE22B =
  "phase22b-tenant-entitlement-repository" as const;

const ACTIVE_CASE_EXCLUDED_STATUSES = ["DELETED", "CLOSED"] as const;

export async function findTenantPlanByTenantId(tenantId: string) {
  return prisma.tenantPlan.findUnique({
    where: { tenantId },
    include: { tenant: { select: { id: true, slug: true, status: true } } },
  });
}

export async function upsertTenantPlan(input: UpsertTenantPlanInput) {
  return prisma.tenantPlan.upsert({
    where: { tenantId: input.tenantId },
    create: {
      tenantId: input.tenantId,
      tier: input.tier,
      status: input.status ?? "ACTIVE",
      featureFlags: input.featureFlags ?? {},
    },
    update: {
      tier: input.tier,
      status: input.status,
      featureFlags: input.featureFlags,
    },
  });
}

export async function countActiveTenantSeats(tenantId: string) {
  return prisma.tenantMembership.count({
    where: { tenantId, isActive: true },
  });
}

export async function countActiveTenantCases(tenantId: string) {
  return prisma.case.count({
    where: {
      tenantId,
      status: { notIn: [...ACTIVE_CASE_EXCLUDED_STATUSES] },
    },
  });
}

export async function loadTenantEntitlementContext(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { plan: true },
  });
  if (!tenant) {
    return null;
  }

  const plan = tenant.plan;
  const tier: TenantPlanTier = plan?.tier ?? "FREE";
  const status: TenantPlanStatus = plan?.status ?? "ACTIVE";
  const featureFlags = parseTenantFeatureFlagOverrides(plan?.featureFlags);

  const [activeSeatCount, activeCaseCount] = await Promise.all([
    countActiveTenantSeats(tenantId),
    countActiveTenantCases(tenantId),
  ]);

  return {
    tenant,
    tier,
    status,
    featureFlags,
    activeSeatCount,
    activeCaseCount,
  };
}
