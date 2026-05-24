-- Phase 18-A — Retry queue / failed job recovery
CREATE TYPE "RetryJobSourceType" AS ENUM (
  'CRON',
  'EXTERNAL_MESSAGE',
  'BULK_ACTION',
  'DOCUMENT_PIPELINE',
  'AI_GOVERNANCE',
  'MANUAL'
);

CREATE TYPE "RetryJobStatus" AS ENUM (
  'FAILED',
  'PENDING_RETRY',
  'RETRYING',
  'SUCCEEDED',
  'CANCELED',
  'EXHAUSTED'
);

CREATE TYPE "RetryJobSafetyClass" AS ENUM (
  'SAFE_AUTO',
  'OPERATOR_APPROVAL',
  'BLOCKED'
);

CREATE TABLE "RetryJob" (
  "id" TEXT NOT NULL,
  "sourceType" "RetryJobSourceType" NOT NULL,
  "sourceRefId" TEXT,
  "jobCode" TEXT NOT NULL,
  "caseId" TEXT,
  "status" "RetryJobStatus" NOT NULL DEFAULT 'FAILED',
  "safetyClass" "RetryJobSafetyClass" NOT NULL DEFAULT 'OPERATOR_APPROVAL',
  "retryable" BOOLEAN NOT NULL DEFAULT false,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  "failureReason" TEXT,
  "failurePayload" JSONB,
  "lastAttemptAt" TIMESTAMP(3),
  "nextRetryAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "resolvedByUserId" TEXT,
  "operatorNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RetryJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RetryJob_sourceType_sourceRefId_key" ON "RetryJob"("sourceType", "sourceRefId");
CREATE INDEX "RetryJob_status_createdAt_idx" ON "RetryJob"("status", "createdAt");
CREATE INDEX "RetryJob_caseId_createdAt_idx" ON "RetryJob"("caseId", "createdAt");
CREATE INDEX "RetryJob_jobCode_status_idx" ON "RetryJob"("jobCode", "status");

ALTER TABLE "RetryJob" ADD CONSTRAINT "RetryJob_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RetryJob" ADD CONSTRAINT "RetryJob_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
