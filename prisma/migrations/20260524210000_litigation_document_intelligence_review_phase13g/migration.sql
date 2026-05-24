-- Phase 13-G: Lawyer Review Gate

CREATE TYPE "LitigationDocumentIntelligenceReviewPhase" AS ENUM ('PHASE_13D', 'PHASE_13E', 'PHASE_13F');

CREATE TABLE "LitigationDocumentIntelligenceReviewDecision" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "sourcePhase" "LitigationDocumentIntelligenceReviewPhase" NOT NULL,
    "sourceFileId" TEXT,
    "itemCategory" TEXT NOT NULL,
    "aiText" TEXT NOT NULL,
    "reviewStatus" TEXT NOT NULL,
    "editedText" TEXT,
    "rejectionReason" TEXT,
    "reviewNote" TEXT,
    "ledgerEntryJson" JSONB,
    "payloadJson" JSONB,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LitigationDocumentIntelligenceReviewDecision_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LitigationDocumentIntelligenceReviewDecision_caseId_itemId_key" ON "LitigationDocumentIntelligenceReviewDecision"("caseId", "itemId");
CREATE INDEX "LitigationDocumentIntelligenceReviewDecision_caseId_reviewStatus_idx" ON "LitigationDocumentIntelligenceReviewDecision"("caseId", "reviewStatus");
CREATE INDEX "LitigationDocumentIntelligenceReviewDecision_caseId_sourcePhase_idx" ON "LitigationDocumentIntelligenceReviewDecision"("caseId", "sourcePhase");

ALTER TABLE "LitigationDocumentIntelligenceReviewDecision" ADD CONSTRAINT "LitigationDocumentIntelligenceReviewDecision_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LitigationDocumentIntelligenceReviewDecision" ADD CONSTRAINT "LitigationDocumentIntelligenceReviewDecision_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
