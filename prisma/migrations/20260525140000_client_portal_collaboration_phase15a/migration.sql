-- Phase 15-A — Client-Lawyer Collaboration Portal

CREATE TYPE "CaseClientPortalAccessStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REVOKED');
CREATE TYPE "ClientSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'RECEIVED', 'UNDER_REVIEW', 'ACCEPTED', 'NEEDS_MORE_INFO', 'REJECTED');
CREATE TYPE "ClientSubmissionKind" AS ENUM ('SUPPLEMENT', 'FREE_UPLOAD', 'CHAT_ATTACHMENT');
CREATE TYPE "CaseConversationThreadType" AS ENUM ('GENERAL', 'SUPPLEMENT');
CREATE TYPE "CaseSharedDocumentStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

CREATE TABLE "CaseClientPortalAccess" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "invitedByUserId" TEXT,
    "accessStatus" "CaseClientPortalAccessStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastAccessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseClientPortalAccess_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClientSubmission" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "supplementRequestId" TEXT,
    "submittedByUserId" TEXT NOT NULL,
    "reviewedByUserId" TEXT,
    "kind" "ClientSubmissionKind" NOT NULL DEFAULT 'SUPPLEMENT',
    "status" "ClientSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "message" TEXT,
    "reviewMemo" TEXT,
    "submittedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientSubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClientSubmissionFile" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "uploadedFileId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "fileType" TEXT,
    "sharedWithLawyer" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientSubmissionFile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CaseConversationThread" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "threadType" "CaseConversationThreadType" NOT NULL DEFAULT 'GENERAL',
    "supplementRequestId" TEXT,
    "title" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseConversationThread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CaseConversationMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "senderRole" "UserRole" NOT NULL,
    "body" TEXT NOT NULL,
    "attachmentIds" JSONB,
    "readByJson" JSONB,
    "isPinnedForRecord" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseConversationMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CaseSharedDocument" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "sharedByUserId" TEXT NOT NULL,
    "sharedWithClientUserId" TEXT NOT NULL,
    "shareStatus" "CaseSharedDocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseSharedDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CaseClientPortalAccess_caseId_clientUserId_key" ON "CaseClientPortalAccess"("caseId", "clientUserId");
CREATE INDEX "CaseClientPortalAccess_clientUserId_accessStatus_idx" ON "CaseClientPortalAccess"("clientUserId", "accessStatus");

CREATE INDEX "ClientSubmission_caseId_status_createdAt_idx" ON "ClientSubmission"("caseId", "status", "createdAt");
CREATE INDEX "ClientSubmission_supplementRequestId_status_idx" ON "ClientSubmission"("supplementRequestId", "status");
CREATE INDEX "ClientSubmission_submittedByUserId_createdAt_idx" ON "ClientSubmission"("submittedByUserId", "createdAt");

CREATE INDEX "ClientSubmissionFile_submissionId_createdAt_idx" ON "ClientSubmissionFile"("submissionId", "createdAt");
CREATE INDEX "ClientSubmissionFile_uploadedFileId_idx" ON "ClientSubmissionFile"("uploadedFileId");

CREATE INDEX "CaseConversationThread_caseId_lastMessageAt_idx" ON "CaseConversationThread"("caseId", "lastMessageAt");
CREATE INDEX "CaseConversationThread_supplementRequestId_idx" ON "CaseConversationThread"("supplementRequestId");

CREATE INDEX "CaseConversationMessage_threadId_createdAt_idx" ON "CaseConversationMessage"("threadId", "createdAt");
CREATE INDEX "CaseConversationMessage_caseId_createdAt_idx" ON "CaseConversationMessage"("caseId", "createdAt");
CREATE INDEX "CaseConversationMessage_senderUserId_createdAt_idx" ON "CaseConversationMessage"("senderUserId", "createdAt");

CREATE INDEX "CaseSharedDocument_caseId_shareStatus_sharedAt_idx" ON "CaseSharedDocument"("caseId", "shareStatus", "sharedAt");
CREATE INDEX "CaseSharedDocument_sharedWithClientUserId_shareStatus_idx" ON "CaseSharedDocument"("sharedWithClientUserId", "shareStatus");

ALTER TABLE "CaseClientPortalAccess" ADD CONSTRAINT "CaseClientPortalAccess_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseClientPortalAccess" ADD CONSTRAINT "CaseClientPortalAccess_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseClientPortalAccess" ADD CONSTRAINT "CaseClientPortalAccess_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ClientSubmission" ADD CONSTRAINT "ClientSubmission_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientSubmission" ADD CONSTRAINT "ClientSubmission_supplementRequestId_fkey" FOREIGN KEY ("supplementRequestId") REFERENCES "SupplementRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClientSubmission" ADD CONSTRAINT "ClientSubmission_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientSubmission" ADD CONSTRAINT "ClientSubmission_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ClientSubmissionFile" ADD CONSTRAINT "ClientSubmissionFile_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ClientSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientSubmissionFile" ADD CONSTRAINT "ClientSubmissionFile_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "LitigationUploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CaseConversationThread" ADD CONSTRAINT "CaseConversationThread_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseConversationThread" ADD CONSTRAINT "CaseConversationThread_supplementRequestId_fkey" FOREIGN KEY ("supplementRequestId") REFERENCES "SupplementRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CaseConversationMessage" ADD CONSTRAINT "CaseConversationMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "CaseConversationThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseConversationMessage" ADD CONSTRAINT "CaseConversationMessage_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseConversationMessage" ADD CONSTRAINT "CaseConversationMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CaseSharedDocument" ADD CONSTRAINT "CaseSharedDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseSharedDocument" ADD CONSTRAINT "CaseSharedDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseSharedDocument" ADD CONSTRAINT "CaseSharedDocument_sharedByUserId_fkey" FOREIGN KEY ("sharedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseSharedDocument" ADD CONSTRAINT "CaseSharedDocument_sharedWithClientUserId_fkey" FOREIGN KEY ("sharedWithClientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
