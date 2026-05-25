-- Phase 50-A — Legal Reliability Action Operations Queue

CREATE TABLE "LegalReliabilityActionOperation" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "tenantId" TEXT,
    "sourcePhase" TEXT NOT NULL,
    "sourceActionCandidateId" TEXT NOT NULL,
    "supplementRequestId" TEXT,
    "operationType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "assignedToUserId" TEXT,
    "dueAt" TIMESTAMP(3),
    "clientResponseReceivedAt" TIMESTAMP(3),
    "lawyerReviewedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "completionResult" TEXT,
    "lawyerFacingTitle" TEXT NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalReliabilityActionOperation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LegalReliabilityActionOperation_sourceActionCandidateId_key" ON "LegalReliabilityActionOperation"("sourceActionCandidateId");
CREATE INDEX "LegalReliabilityActionOperation_caseId_status_createdAt_idx" ON "LegalReliabilityActionOperation"("caseId", "status", "createdAt");
CREATE INDEX "LegalReliabilityActionOperation_supplementRequestId_idx" ON "LegalReliabilityActionOperation"("supplementRequestId");

ALTER TABLE "LegalReliabilityActionOperation" ADD CONSTRAINT "LegalReliabilityActionOperation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LegalReliabilityActionOperation" ADD CONSTRAINT "LegalReliabilityActionOperation_sourceActionCandidateId_fkey" FOREIGN KEY ("sourceActionCandidateId") REFERENCES "LegalReliabilityActionCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
