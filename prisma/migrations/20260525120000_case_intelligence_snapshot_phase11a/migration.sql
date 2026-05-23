-- Phase 11-A — Lawyer Review Console intelligence snapshot storage
CREATE TABLE "CaseIntelligenceSnapshot" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "caseSummaryAiMode" TEXT NOT NULL,
    "contentJson" JSONB NOT NULL,
    "graphJson" JSONB NOT NULL,
    "radarJson" JSONB NOT NULL,
    "ledgerJson" JSONB NOT NULL,
    "gongbuhoResolutionJson" JSONB,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseIntelligenceSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CaseIntelligenceSnapshot_caseId_createdAt_idx" ON "CaseIntelligenceSnapshot"("caseId", "createdAt");

ALTER TABLE "CaseIntelligenceSnapshot" ADD CONSTRAINT "CaseIntelligenceSnapshot_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CaseIntelligenceSnapshot" ADD CONSTRAINT "CaseIntelligenceSnapshot_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
