-- Phase 50-B — Assignment / Due Date / SLA Tracking

ALTER TABLE "LegalReliabilityActionOperation" ADD COLUMN "assignedByUserId" TEXT;
ALTER TABLE "LegalReliabilityActionOperation" ADD COLUMN "assignedAt" TIMESTAMP(3);
ALTER TABLE "LegalReliabilityActionOperation" ADD COLUMN "slaStatus" TEXT NOT NULL DEFAULT 'NO_DUE_DATE';
ALTER TABLE "LegalReliabilityActionOperation" ADD COLUMN "slaCheckedAt" TIMESTAMP(3);

ALTER TABLE "LegalReliabilityActionOperation" ALTER COLUMN "priority" SET DEFAULT 'MEDIUM';

CREATE INDEX "LegalReliabilityActionOperation_assignedToUserId_idx" ON "LegalReliabilityActionOperation"("assignedToUserId");
CREATE INDEX "LegalReliabilityActionOperation_slaStatus_idx" ON "LegalReliabilityActionOperation"("slaStatus");
