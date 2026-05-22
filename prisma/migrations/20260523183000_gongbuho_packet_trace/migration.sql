-- CreateEnum
CREATE TYPE "GongbuhoPacketStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "GongbuhoPacket" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "caseType" TEXT,
    "status" "GongbuhoPacketStatus" NOT NULL DEFAULT 'DRAFT',
    "packetJson" JSONB NOT NULL,
    "createdByUserId" TEXT,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GongbuhoPacket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GongbuhoTrace" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "gongbuhoPacketId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "inputSnapshot" JSONB,
    "outputSnapshot" JSONB,
    "validationResult" JSONB,
    "riskFlags" JSONB,
    "expertReviewPoints" JSONB,
    "humanApprovalStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GongbuhoTrace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GongbuhoPacket_code_version_key" ON "GongbuhoPacket" ("code", "version");

CREATE INDEX "GongbuhoPacket_code_idx" ON "GongbuhoPacket" ("code");

CREATE INDEX "GongbuhoPacket_caseType_idx" ON "GongbuhoPacket" ("caseType");

CREATE INDEX "GongbuhoPacket_status_idx" ON "GongbuhoPacket" ("status");

CREATE INDEX "GongbuhoPacket_createdByUserId_idx" ON "GongbuhoPacket" ("createdByUserId");

CREATE INDEX "GongbuhoPacket_approvedByUserId_idx" ON "GongbuhoPacket" ("approvedByUserId");

CREATE INDEX "GongbuhoTrace_caseId_idx" ON "GongbuhoTrace" ("caseId");

CREATE INDEX "GongbuhoTrace_code_version_idx" ON "GongbuhoTrace" ("code", "version");

CREATE INDEX "GongbuhoTrace_gongbuhoPacketId_idx" ON "GongbuhoTrace" ("gongbuhoPacketId");

-- AddForeignKey
ALTER TABLE "GongbuhoPacket"
    ADD CONSTRAINT "GongbuhoPacket_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GongbuhoPacket"
    ADD CONSTRAINT "GongbuhoPacket_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GongbuhoTrace"
    ADD CONSTRAINT "GongbuhoTrace_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GongbuhoTrace"
    ADD CONSTRAINT "GongbuhoTrace_gongbuhoPacketId_fkey" FOREIGN KEY ("gongbuhoPacketId") REFERENCES "GongbuhoPacket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
