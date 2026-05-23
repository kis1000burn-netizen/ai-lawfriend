-- Phase 7-A — Voice Operations dashboard + privacy ops requests

CREATE TYPE "VoicePrivacyOpsRequestType" AS ENUM ('DELETION', 'CORRECTION', 'STT_COMPLAINT');

CREATE TYPE "VoicePrivacyOpsRequestStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED');

CREATE TYPE "VoicePrivacyOpsResolutionCode" AS ENUM (
  'DRAFT_PURGED',
  'ESCALATED_LAWYER_REVIEW',
  'USER_GUIDED_RECONFIRM',
  'METADATA_ONLY_CLOSED',
  'REQUEST_REJECTED'
);

CREATE TABLE "VoicePrivacyOpsRequest" (
  "id" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "voiceTranscriptId" TEXT,
  "requestType" "VoicePrivacyOpsRequestType" NOT NULL,
  "status" "VoicePrivacyOpsRequestStatus" NOT NULL DEFAULT 'OPEN',
  "requesterChannel" TEXT,
  "requesterNote" TEXT NOT NULL,
  "opsNotes" TEXT,
  "resolutionCode" "VoicePrivacyOpsResolutionCode",
  "evidenceTag" TEXT,
  "createdByUserId" TEXT NOT NULL,
  "assignedToUserId" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "resolvedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "VoicePrivacyOpsRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VoicePrivacyOpsRequest_status_createdAt_idx" ON "VoicePrivacyOpsRequest"("status", "createdAt");

CREATE INDEX "VoicePrivacyOpsRequest_caseId_idx" ON "VoicePrivacyOpsRequest"("caseId");

CREATE INDEX "VoicePrivacyOpsRequest_voiceTranscriptId_idx" ON "VoicePrivacyOpsRequest"("voiceTranscriptId");

ALTER TABLE "VoicePrivacyOpsRequest" ADD CONSTRAINT "VoicePrivacyOpsRequest_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VoicePrivacyOpsRequest" ADD CONSTRAINT "VoicePrivacyOpsRequest_voiceTranscriptId_fkey" FOREIGN KEY ("voiceTranscriptId") REFERENCES "VoiceTranscript"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VoicePrivacyOpsRequest" ADD CONSTRAINT "VoicePrivacyOpsRequest_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VoicePrivacyOpsRequest" ADD CONSTRAINT "VoicePrivacyOpsRequest_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VoicePrivacyOpsRequest" ADD CONSTRAINT "VoicePrivacyOpsRequest_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
