-- Product Phase 22-D — Billing-safe Usage Ledger

CREATE TYPE "BillingLedgerStatus" AS ENUM ('DRAFT', 'POSTED', 'VOIDED', 'ADJUSTED');
CREATE TYPE "BillingChargeCategory" AS ENUM (
  'AI_TOKEN',
  'LLM_CALL',
  'EXTERNAL_MESSAGE',
  'DOCUMENT_PROCESSING',
  'FILE_UPLOAD',
  'FILE_STORAGE',
  'CLIENT_PORTAL',
  'MANUAL_ADJUSTMENT'
);

CREATE TABLE "BillingUsageLedger" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "meteringEventId" TEXT,
    "billingPeriodKey" TEXT NOT NULL,
    "chargeCategory" "BillingChargeCategory" NOT NULL,
    "billableQuantity" INTEGER NOT NULL,
    "unitCostSnapshot" JSONB NOT NULL,
    "planSnapshot" JSONB NOT NULL,
    "status" "BillingLedgerStatus" NOT NULL DEFAULT 'DRAFT',
    "adjustmentOfId" TEXT,
    "voidReason" TEXT,
    "adjustmentReason" TEXT,
    "actorUserId" TEXT,
    "postedAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingUsageLedger_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BillingUsageLedger_meteringEventId_key" ON "BillingUsageLedger"("meteringEventId");
CREATE INDEX "BillingUsageLedger_tenantId_billingPeriodKey_status_idx" ON "BillingUsageLedger"("tenantId", "billingPeriodKey", "status");
CREATE INDEX "BillingUsageLedger_tenantId_chargeCategory_billingPeriodKey_idx" ON "BillingUsageLedger"("tenantId", "chargeCategory", "billingPeriodKey");

CREATE TABLE "BillingLedgerPeriodClose" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "billingPeriodKey" TEXT NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedByUserId" TEXT,

    CONSTRAINT "BillingLedgerPeriodClose_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BillingLedgerPeriodClose_tenantId_billingPeriodKey_key" ON "BillingLedgerPeriodClose"("tenantId", "billingPeriodKey");

ALTER TABLE "BillingUsageLedger" ADD CONSTRAINT "BillingUsageLedger_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BillingUsageLedger" ADD CONSTRAINT "BillingUsageLedger_meteringEventId_fkey" FOREIGN KEY ("meteringEventId") REFERENCES "TenantUsageEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BillingUsageLedger" ADD CONSTRAINT "BillingUsageLedger_adjustmentOfId_fkey" FOREIGN KEY ("adjustmentOfId") REFERENCES "BillingUsageLedger"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BillingLedgerPeriodClose" ADD CONSTRAINT "BillingLedgerPeriodClose_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
