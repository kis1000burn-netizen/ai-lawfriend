-- Phase 15-F — Secure document delivery & external message log

ALTER TABLE "ClientNotificationPreference"
ADD COLUMN "documentShareNoticeEnabled" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "CaseSharedDocument"
ADD COLUMN "firstViewedAt" TIMESTAMP(3);

CREATE TYPE "CaseDocumentDeliveryChannel" AS ENUM ('IN_APP', 'EMAIL', 'KAKAO_ALIMTALK', 'SMS');

CREATE TYPE "CaseDocumentDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED_NO_CONSENT', 'VIEWED');

CREATE TYPE "ExternalMessageStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED_NO_CONSENT');

CREATE TABLE "CaseDocumentDelivery" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "sharedDocumentId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "recipientClientUserId" TEXT NOT NULL,
    "deliveryChannel" "CaseDocumentDeliveryChannel" NOT NULL,
    "deliveryStatus" "CaseDocumentDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "secureLinkTokenHash" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseDocumentDelivery_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExternalMessageLog" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "deliveryId" TEXT,
    "channel" "CaseDocumentDeliveryChannel" NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'STUB',
    "templateCode" TEXT,
    "payloadSummaryJson" JSONB NOT NULL,
    "status" "ExternalMessageStatus" NOT NULL DEFAULT 'PENDING',
    "failureReason" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalMessageLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CaseDocumentDelivery_caseId_deliveryStatus_idx" ON "CaseDocumentDelivery"("caseId", "deliveryStatus");
CREATE INDEX "CaseDocumentDelivery_sharedDocumentId_deliveryChannel_idx" ON "CaseDocumentDelivery"("sharedDocumentId", "deliveryChannel");
CREATE INDEX "CaseDocumentDelivery_recipientClientUserId_deliveryStatus_idx" ON "CaseDocumentDelivery"("recipientClientUserId", "deliveryStatus");

CREATE INDEX "ExternalMessageLog_caseId_channel_status_idx" ON "ExternalMessageLog"("caseId", "channel", "status");
CREATE INDEX "ExternalMessageLog_recipientUserId_createdAt_idx" ON "ExternalMessageLog"("recipientUserId", "createdAt");
CREATE INDEX "ExternalMessageLog_deliveryId_idx" ON "ExternalMessageLog"("deliveryId");

ALTER TABLE "CaseDocumentDelivery" ADD CONSTRAINT "CaseDocumentDelivery_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseDocumentDelivery" ADD CONSTRAINT "CaseDocumentDelivery_sharedDocumentId_fkey" FOREIGN KEY ("sharedDocumentId") REFERENCES "CaseSharedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseDocumentDelivery" ADD CONSTRAINT "CaseDocumentDelivery_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseDocumentDelivery" ADD CONSTRAINT "CaseDocumentDelivery_recipientClientUserId_fkey" FOREIGN KEY ("recipientClientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseDocumentDelivery" ADD CONSTRAINT "CaseDocumentDelivery_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExternalMessageLog" ADD CONSTRAINT "ExternalMessageLog_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExternalMessageLog" ADD CONSTRAINT "ExternalMessageLog_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExternalMessageLog" ADD CONSTRAINT "ExternalMessageLog_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "CaseDocumentDelivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
