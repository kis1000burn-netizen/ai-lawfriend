-- Phase 21-D — Client portal push subscription + webPushOptIn preference

ALTER TABLE "ClientNotificationPreference"
ADD COLUMN "webPushOptIn" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "ClientPushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" VARCHAR(2000) NOT NULL,
    "p256dh" VARCHAR(500) NOT NULL,
    "auth" VARCHAR(500) NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientPushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClientPushSubscription_endpoint_key" ON "ClientPushSubscription"("endpoint");

CREATE INDEX "ClientPushSubscription_userId_idx" ON "ClientPushSubscription"("userId");

ALTER TABLE "ClientPushSubscription" ADD CONSTRAINT "ClientPushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
