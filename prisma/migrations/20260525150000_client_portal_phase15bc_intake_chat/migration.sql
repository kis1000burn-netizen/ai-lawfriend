-- Phase 15-B/C — file description + chat attachments

ALTER TABLE "ClientSubmissionFile" ADD COLUMN "description" TEXT;

CREATE TABLE "CaseMessageAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "uploadedFileId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseMessageAttachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CaseMessageAttachment_messageId_createdAt_idx" ON "CaseMessageAttachment"("messageId", "createdAt");
CREATE INDEX "CaseMessageAttachment_uploadedFileId_idx" ON "CaseMessageAttachment"("uploadedFileId");

ALTER TABLE "CaseMessageAttachment" ADD CONSTRAINT "CaseMessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "CaseConversationMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseMessageAttachment" ADD CONSTRAINT "CaseMessageAttachment_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "LitigationUploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
