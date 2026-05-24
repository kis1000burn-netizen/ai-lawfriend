-- Phase 13-D: Legal Document Intelligence — document content analysis

CREATE TYPE "LitigationDocumentAnalysisStatus" AS ENUM ('PENDING', 'ANALYZING', 'AI_ANALYZED', 'FAILED');

CREATE TABLE "LitigationDocumentAnalysis" (
    "id" TEXT NOT NULL,
    "uploadedFileId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "classificationRevision" INTEGER,
    "analysisStatus" "LitigationDocumentAnalysisStatus" NOT NULL,
    "documentType" TEXT NOT NULL,
    "analysisJson" JSONB NOT NULL,
    "errorMessage" TEXT,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationDocumentAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LitigationDocumentAnalysis_uploadedFileId_revision_key" ON "LitigationDocumentAnalysis"("uploadedFileId", "revision");
CREATE INDEX "LitigationDocumentAnalysis_uploadedFileId_analyzedAt_idx" ON "LitigationDocumentAnalysis"("uploadedFileId", "analyzedAt");

ALTER TABLE "LitigationDocumentAnalysis" ADD CONSTRAINT "LitigationDocumentAnalysis_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "LitigationUploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
