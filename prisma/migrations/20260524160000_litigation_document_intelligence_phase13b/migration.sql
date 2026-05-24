-- Phase 13-B: Legal Document Intelligence — upload & text extraction

CREATE TYPE "LitigationExtractionStatus" AS ENUM ('PENDING', 'EXTRACTING', 'EXTRACTED', 'FAILED');
CREATE TYPE "LitigationExtractionMethod" AS ENUM ('NATIVE', 'OCR', 'HYBRID', 'PLAIN_TEXT');

CREATE TABLE "LitigationUploadedFile" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "uploaderUserId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "extractionStatus" "LitigationExtractionStatus" NOT NULL DEFAULT 'PENDING',
    "extractionQualityScore" DOUBLE PRECISION,
    "pageCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LitigationUploadedFile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LitigationExtractedText" (
    "id" TEXT NOT NULL,
    "uploadedFileId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "extractionMethod" "LitigationExtractionMethod" NOT NULL,
    "pagesJson" JSONB NOT NULL,
    "qualityScore" DOUBLE PRECISION NOT NULL,
    "qualityFlags" JSONB NOT NULL DEFAULT '[]',
    "errorMessage" TEXT,
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationExtractedText_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LitigationUploadedFile_caseId_createdAt_idx" ON "LitigationUploadedFile"("caseId", "createdAt");
CREATE INDEX "LitigationUploadedFile_caseId_extractionStatus_idx" ON "LitigationUploadedFile"("caseId", "extractionStatus");
CREATE INDEX "LitigationExtractedText_uploadedFileId_extractedAt_idx" ON "LitigationExtractedText"("uploadedFileId", "extractedAt");
CREATE UNIQUE INDEX "LitigationExtractedText_uploadedFileId_revision_key" ON "LitigationExtractedText"("uploadedFileId", "revision");

ALTER TABLE "LitigationUploadedFile" ADD CONSTRAINT "LitigationUploadedFile_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LitigationUploadedFile" ADD CONSTRAINT "LitigationUploadedFile_uploaderUserId_fkey" FOREIGN KEY ("uploaderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LitigationExtractedText" ADD CONSTRAINT "LitigationExtractedText_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "LitigationUploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
