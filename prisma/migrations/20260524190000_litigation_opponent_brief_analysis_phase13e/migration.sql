-- Phase 13-E: Opponent Brief Analyzer

CREATE TYPE "LitigationOpponentBriefAnalysisStatus" AS ENUM ('PENDING', 'ANALYZING', 'AI_ANALYZED', 'FAILED');

CREATE TABLE "LitigationOpponentBriefAnalysis" (
    "id" TEXT NOT NULL,
    "uploadedFileId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "documentAnalysisRevision" INTEGER,
    "analysisStatus" "LitigationOpponentBriefAnalysisStatus" NOT NULL,
    "documentType" TEXT NOT NULL,
    "analysisJson" JSONB NOT NULL,
    "errorMessage" TEXT,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationOpponentBriefAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LitigationOpponentBriefAnalysis_uploadedFileId_revision_key" ON "LitigationOpponentBriefAnalysis"("uploadedFileId", "revision");
CREATE INDEX "LitigationOpponentBriefAnalysis_uploadedFileId_analyzedAt_idx" ON "LitigationOpponentBriefAnalysis"("uploadedFileId", "analyzedAt");

ALTER TABLE "LitigationOpponentBriefAnalysis" ADD CONSTRAINT "LitigationOpponentBriefAnalysis_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "LitigationUploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
