-- Product Phase 29-B — Customer Success Activity Log

CREATE TYPE "CustomerSuccessActivityType" AS ENUM (
  'ONBOARDING_MEETING',
  'TRAINING_SESSION',
  'FEATURE_INQUIRY',
  'INCIDENT_NOTICE',
  'EXPANSION_PROPOSAL',
  'RENEWAL_DISCUSSION',
  'COMPLAINT_RISK_RESPONSE'
);

CREATE TYPE "ChurnRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE "CustomerSuccessActivity" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "activityType" "CustomerSuccessActivityType" NOT NULL,
  "summary" TEXT NOT NULL,
  "ownerUserId" TEXT,
  "riskSignal" TEXT,
  "nextActionAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerSuccessActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomerSuccessActivity_tenantId_createdAt_idx" ON "CustomerSuccessActivity"("tenantId", "createdAt");
CREATE INDEX "CustomerSuccessActivity_tenantId_activityType_idx" ON "CustomerSuccessActivity"("tenantId", "activityType");

ALTER TABLE "CustomerSuccessActivity"
  ADD CONSTRAINT "CustomerSuccessActivity_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
