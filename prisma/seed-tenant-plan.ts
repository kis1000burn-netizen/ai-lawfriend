/**
 * Product Phase 22-B — Seed demo tenant plan (PRO tier).
 */
import type { PrismaClient } from "@prisma/client";
import { TENANT_ORGANIZATION_DEFAULT_SLUG } from "@/features/platform/tenant-organization/tenant-organization.policy";
import { findTenantBySlug } from "@/features/platform/tenant-organization/tenant-organization.repository";
import { upsertTenantPlan } from "@/features/platform/tenant-entitlement/tenant-entitlement.repository";

export async function seedTenantPlanDemo(prisma: PrismaClient) {
  const tenant = await findTenantBySlug(TENANT_ORGANIZATION_DEFAULT_SLUG);
  if (!tenant) {
    return null;
  }

  return upsertTenantPlan({
    tenantId: tenant.id,
    tier: "PRO",
    status: "ACTIVE",
    featureFlags: {
      CLIENT_PORTAL_PUSH: true,
    },
  });
}
