-- Product Phase 22-B — Tenant Plan / Feature Entitlement

CREATE TYPE "TenantPlanTier" AS ENUM ('FREE', 'STARTER', 'PRO', 'ENTERPRISE');
CREATE TYPE "TenantPlanStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'SUSPENDED');

CREATE TABLE "TenantPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tier" "TenantPlanTier" NOT NULL DEFAULT 'FREE',
    "status" "TenantPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "featureFlags" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantPlan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TenantPlan_tenantId_key" ON "TenantPlan"("tenantId");
CREATE INDEX "TenantPlan_tier_status_idx" ON "TenantPlan"("tier", "status");

ALTER TABLE "TenantPlan" ADD CONSTRAINT "TenantPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
