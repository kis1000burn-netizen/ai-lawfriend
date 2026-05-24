-- Product Phase 22-C — Tenant Usage Metering

CREATE TYPE "TenantUsageEventKind" AS ENUM (
  'AI_TOKEN_USAGE',
  'LLM_CALL',
  'EXTERNAL_MESSAGE',
  'DOCUMENT_PROCESSING',
  'FILE_UPLOAD',
  'CLIENT_PORTAL_ACTIVE'
);

CREATE TYPE "TenantUsageEventUnit" AS ENUM ('COUNT', 'TOKENS', 'BYTES');

CREATE TABLE "TenantUsageEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "kind" "TenantUsageEventKind" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit" "TenantUsageEventUnit" NOT NULL DEFAULT 'COUNT',
    "caseId" TEXT,
    "metadata" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantUsageEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TenantUsageEvent_tenantId_periodKey_kind_idx" ON "TenantUsageEvent"("tenantId", "periodKey", "kind");
CREATE INDEX "TenantUsageEvent_tenantId_caseId_kind_periodKey_idx" ON "TenantUsageEvent"("tenantId", "caseId", "kind", "periodKey");
CREATE INDEX "TenantUsageEvent_tenantId_recordedAt_idx" ON "TenantUsageEvent"("tenantId", "recordedAt");

ALTER TABLE "TenantUsageEvent" ADD CONSTRAINT "TenantUsageEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
