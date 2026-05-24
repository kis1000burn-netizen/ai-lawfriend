-- Phase 15-D — Court schedule & client reminder layer

CREATE TYPE "LitigationDeadlineNotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'KAKAO_ALIMTALK');
CREATE TYPE "LitigationDeadlineNotificationStatus" AS ENUM ('SCHEDULED', 'SENT', 'FAILED', 'CANCELLED', 'SKIPPED_NO_CONSENT');
CREATE TYPE "LitigationDeadlineReminderOffset" AS ENUM ('D14', 'D7', 'D3', 'D1', 'D0');

ALTER TABLE "LitigationDeadline" ADD COLUMN IF NOT EXISTS "courtName" TEXT;
ALTER TABLE "LitigationDeadline" ADD COLUMN IF NOT EXISTS "hearingKind" TEXT;
ALTER TABLE "LitigationDeadline" ADD COLUMN IF NOT EXISTS "clientVisible" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "LitigationDeadline_caseId_dueAt_idx" ON "LitigationDeadline"("caseId", "dueAt");

CREATE TABLE "LitigationDeadlineNotification" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "deadlineId" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "recipientRole" "UserRole" NOT NULL,
    "channel" "LitigationDeadlineNotificationChannel" NOT NULL,
    "reminderOffset" "LitigationDeadlineReminderOffset" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "LitigationDeadlineNotificationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "failureReason" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LitigationDeadlineNotification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClientNotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kakaoOptIn" BOOLEAN NOT NULL DEFAULT false,
    "emailOptIn" BOOLEAN NOT NULL DEFAULT true,
    "smsOptIn" BOOLEAN NOT NULL DEFAULT false,
    "litigationDeadlineReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientNotificationPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LitigationDeadlineNotification_deadlineId_recipientUserId_channel_reminderOffset_key" ON "LitigationDeadlineNotification"("deadlineId", "recipientUserId", "channel", "reminderOffset");
CREATE INDEX "LitigationDeadlineNotification_caseId_scheduledAt_idx" ON "LitigationDeadlineNotification"("caseId", "scheduledAt");
CREATE INDEX "LitigationDeadlineNotification_deadlineId_status_idx" ON "LitigationDeadlineNotification"("deadlineId", "status");
CREATE INDEX "LitigationDeadlineNotification_recipientUserId_status_idx" ON "LitigationDeadlineNotification"("recipientUserId", "status");

CREATE UNIQUE INDEX "ClientNotificationPreference_userId_key" ON "ClientNotificationPreference"("userId");

ALTER TABLE "LitigationDeadlineNotification" ADD CONSTRAINT "LitigationDeadlineNotification_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LitigationDeadlineNotification" ADD CONSTRAINT "LitigationDeadlineNotification_deadlineId_fkey" FOREIGN KEY ("deadlineId") REFERENCES "LitigationDeadline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LitigationDeadlineNotification" ADD CONSTRAINT "LitigationDeadlineNotification_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LitigationDeadlineNotification" ADD CONSTRAINT "LitigationDeadlineNotification_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ClientNotificationPreference" ADD CONSTRAINT "ClientNotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
