-- Phase 13-C: Legal Document Intelligence — document classification

CREATE TYPE "LitigationClassificationStatus" AS ENUM ('PENDING', 'CLASSIFYING', 'CLASSIFIED', 'FAILED');
CREATE TYPE "LitigationSourceParty" AS ENUM ('CLIENT', 'OPPONENT', 'COURT', 'THIRD_PARTY', 'UNKNOWN');
CREATE TYPE "LitigationStage" AS ENUM ('PRE_FILING', 'COMPLAINT_FILED', 'ANSWER_RECEIVED', 'PREPARATORY_BRIEF', 'JUDGMENT', 'APPEAL', 'UNKNOWN');
CREATE TYPE "LitigationSensitivityLevel" AS ENUM ('GENERAL', 'SENSITIVE', 'LAWYER_ONLY');
CREATE TYPE "LitigationAnalysisReadiness" AS ENUM ('READY', 'NEEDS_OCR', 'LOW_QUALITY', 'ENCRYPTED', 'UNSUPPORTED');

CREATE TABLE "LitigationDocumentClassification" (
    "id" TEXT NOT NULL,
    "uploadedFileId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "classificationStatus" "LitigationClassificationStatus" NOT NULL,
    "documentType" TEXT NOT NULL,
    "sourceParty" "LitigationSourceParty" NOT NULL,
    "litigationStage" "LitigationStage" NOT NULL,
    "sensitivityLevel" "LitigationSensitivityLevel" NOT NULL,
    "analysisReadiness" "LitigationAnalysisReadiness" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "recommendedNextTasks" JSONB NOT NULL,
    "citationsJson" JSONB NOT NULL,
    "errorMessage" TEXT,
    "classifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationDocumentClassification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LitigationDocumentClassification_uploadedFileId_revision_key" ON "LitigationDocumentClassification"("uploadedFileId", "revision");
CREATE INDEX "LitigationDocumentClassification_uploadedFileId_classifiedAt_idx" ON "LitigationDocumentClassification"("uploadedFileId", "classifiedAt");

ALTER TABLE "LitigationDocumentClassification" ADD CONSTRAINT "LitigationDocumentClassification_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "LitigationUploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
