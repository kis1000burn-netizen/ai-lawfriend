-- Phase 49-A — Legal Reliability Action Loop (Risk Radar → Supplement Action Candidate)

CREATE TABLE "LegalReliabilityActionCandidate" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "tenantId" TEXT,
    "sourcePhase" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "riskType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "lawyerFacingTitle" TEXT NOT NULL,
    "lawyerFacingReason" TEXT NOT NULL,
    "proposedClientRequestTitle" TEXT NOT NULL,
    "proposedClientRequestBody" TEXT NOT NULL,
    "clientVisibleByDefault" BOOLEAN NOT NULL DEFAULT false,
    "prohibitedClientTextRemoved" BOOLEAN NOT NULL DEFAULT true,
    "requiresLawyerApproval" BOOLEAN NOT NULL DEFAULT true,
    "linkedClaimIds" JSONB NOT NULL,
    "linkedEvidenceIds" JSONB NOT NULL,
    "linkedJudgmentIds" JSONB NOT NULL,
    "supplementRequestId" TEXT,
    "createdByUserId" TEXT,
    "approvedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalReliabilityActionCandidate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LegalReliabilityActionDecisionLedger" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "tenantId" TEXT,
    "actionCandidateId" TEXT NOT NULL,
    "decisionType" TEXT NOT NULL,
    "decidedByUserId" TEXT NOT NULL,
    "decidedByRole" TEXT NOT NULL,
    "beforeClientRequestBody" TEXT,
    "afterClientRequestBody" TEXT,
    "rejectionReason" TEXT,
    "deferReason" TEXT,
    "sourceRiskRadarSignalId" TEXT,
    "linkedClaimIds" JSONB NOT NULL,
    "linkedEvidenceIds" JSONB NOT NULL,
    "linkedJudgmentIds" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalReliabilityActionDecisionLedger_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LegalReliabilityActionCandidate_caseId_status_createdAt_idx" ON "LegalReliabilityActionCandidate"("caseId", "status", "createdAt");
CREATE INDEX "LegalReliabilityActionCandidate_sourceId_caseId_idx" ON "LegalReliabilityActionCandidate"("sourceId", "caseId");
CREATE INDEX "LegalReliabilityActionCandidate_supplementRequestId_idx" ON "LegalReliabilityActionCandidate"("supplementRequestId");

CREATE INDEX "LegalReliabilityActionDecisionLedger_caseId_createdAt_idx" ON "LegalReliabilityActionDecisionLedger"("caseId", "createdAt");
CREATE INDEX "LegalReliabilityActionDecisionLedger_actionCandidateId_createdAt_idx" ON "LegalReliabilityActionDecisionLedger"("actionCandidateId", "createdAt");

ALTER TABLE "LegalReliabilityActionCandidate" ADD CONSTRAINT "LegalReliabilityActionCandidate_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LegalReliabilityActionDecisionLedger" ADD CONSTRAINT "LegalReliabilityActionDecisionLedger_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LegalReliabilityActionDecisionLedger" ADD CONSTRAINT "LegalReliabilityActionDecisionLedger_actionCandidateId_fkey" FOREIGN KEY ("actionCandidateId") REFERENCES "LegalReliabilityActionCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
