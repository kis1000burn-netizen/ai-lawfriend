-- CreateEnum
CREATE TYPE "AibeopchinCmbConfigStatus" AS ENUM ('DRAFT', 'REVIEW', 'VERIFY_PASS', 'LOCKED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "AibeopchinCmbConfigRevision" (
    "id" TEXT NOT NULL,
    "caseType" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "AibeopchinCmbConfigStatus" NOT NULL DEFAULT 'DRAFT',
    "configJson" JSONB NOT NULL,
    "evidenceTag" TEXT NOT NULL,
    "changeReason" TEXT,
    "verifyPassedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AibeopchinCmbConfigRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AibeopchinCmbPublishEvent" (
    "id" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "fromStatus" "AibeopchinCmbConfigStatus" NOT NULL,
    "toStatus" "AibeopchinCmbConfigStatus" NOT NULL,
    "evidenceTag" TEXT NOT NULL,
    "changeReason" TEXT,
    "verifyPassed" BOOLEAN NOT NULL DEFAULT false,
    "actorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AibeopchinCmbPublishEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AibeopchinCmbConfigRevision_caseType_status_idx" ON "AibeopchinCmbConfigRevision"("caseType", "status");

-- CreateIndex
CREATE INDEX "AibeopchinCmbConfigRevision_configId_idx" ON "AibeopchinCmbConfigRevision"("configId");

-- CreateIndex
CREATE UNIQUE INDEX "AibeopchinCmbConfigRevision_caseType_version_key" ON "AibeopchinCmbConfigRevision"("caseType", "version");

-- CreateIndex
CREATE INDEX "AibeopchinCmbPublishEvent_revisionId_createdAt_idx" ON "AibeopchinCmbPublishEvent"("revisionId", "createdAt");

-- CreateIndex
CREATE INDEX "AibeopchinCmbPublishEvent_actorUserId_createdAt_idx" ON "AibeopchinCmbPublishEvent"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "AibeopchinCmbConfigRevision" ADD CONSTRAINT "AibeopchinCmbConfigRevision_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AibeopchinCmbPublishEvent" ADD CONSTRAINT "AibeopchinCmbPublishEvent_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "AibeopchinCmbConfigRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AibeopchinCmbPublishEvent" ADD CONSTRAINT "AibeopchinCmbPublishEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
