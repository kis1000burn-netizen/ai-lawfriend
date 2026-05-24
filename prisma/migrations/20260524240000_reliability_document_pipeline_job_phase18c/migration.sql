-- Phase 18-C — Document pipeline job (stage-preserving recovery)
CREATE TYPE "DocumentPipelineStage" AS ENUM (
  'UPLOAD',
  'EXTRACT',
  'CLASSIFY',
  'ANALYZE',
  'OPPONENT_BRIEF'
);

CREATE TYPE "DocumentPipelineJobStatus" AS ENUM (
  'FAILED',
  'PENDING_RECOVERY',
  'RECOVERING',
  'SUCCEEDED',
  'BLOCKED',
  'EXHAUSTED'
);

CREATE TABLE "DocumentPipelineJob" (
  "id" TEXT NOT NULL,
  "uploadedFileId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "failedStage" "DocumentPipelineStage" NOT NULL,
  "resumeFromStage" "DocumentPipelineStage" NOT NULL,
  "status" "DocumentPipelineJobStatus" NOT NULL DEFAULT 'FAILED',
  "failureReason" TEXT,
  "failurePayload" JSONB,
  "completedStagesJson" JSONB,
  "lawyerReviewLocked" BOOLEAN NOT NULL DEFAULT false,
  "clientDisclosureLocked" BOOLEAN NOT NULL DEFAULT false,
  "duplicateGuardKey" TEXT NOT NULL,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  "resolvedAt" TIMESTAMP(3),
  "resolvedByUserId" TEXT,
  "operatorNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DocumentPipelineJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DocumentPipelineJob_duplicateGuardKey_key" ON "DocumentPipelineJob"("duplicateGuardKey");
CREATE INDEX "DocumentPipelineJob_uploadedFileId_failedStage_idx" ON "DocumentPipelineJob"("uploadedFileId", "failedStage");
CREATE INDEX "DocumentPipelineJob_caseId_status_createdAt_idx" ON "DocumentPipelineJob"("caseId", "status", "createdAt");
CREATE INDEX "DocumentPipelineJob_status_createdAt_idx" ON "DocumentPipelineJob"("status", "createdAt");

ALTER TABLE "DocumentPipelineJob" ADD CONSTRAINT "DocumentPipelineJob_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "LitigationUploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentPipelineJob" ADD CONSTRAINT "DocumentPipelineJob_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentPipelineJob" ADD CONSTRAINT "DocumentPipelineJob_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
