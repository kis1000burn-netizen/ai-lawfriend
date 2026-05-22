-- AlterTable: 일반·변호사 계정 공통 — 이메일/휴대폰 검증 시각(선택)
ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN "phoneVerifiedAt" TIMESTAMP(3);

-- CreateEnum
CREATE TYPE "LawyerVerificationStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'NEEDS_MORE_INFO', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "LawyerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "barAssociation" TEXT,
    "officeName" TEXT,
    "officeAddress" TEXT,
    "officePhone" TEXT,
    "websiteUrl" TEXT,
    "specialtiesNote" TEXT,
    "verificationStatus" "LawyerVerificationStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LawyerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawyerVerificationDocument" (
    "id" TEXT NOT NULL,
    "lawyerProfileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LawyerVerificationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LawyerProfile_userId_key" ON "LawyerProfile"("userId");

-- CreateIndex
CREATE INDEX "LawyerProfile_verificationStatus_idx" ON "LawyerProfile"("verificationStatus");

-- CreateIndex
CREATE INDEX "LawyerProfile_reviewedById_idx" ON "LawyerProfile"("reviewedById");

-- CreateIndex
CREATE INDEX "LawyerVerificationDocument_lawyerProfileId_idx" ON "LawyerVerificationDocument"("lawyerProfileId");

-- AddForeignKey
ALTER TABLE "LawyerProfile" ADD CONSTRAINT "LawyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerProfile" ADD CONSTRAINT "LawyerProfile_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerVerificationDocument" ADD CONSTRAINT "LawyerVerificationDocument_lawyerProfileId_fkey" FOREIGN KEY ("lawyerProfileId") REFERENCES "LawyerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 기존 LAWYER 계정: 마이그레이션 직후에도 변호사 기능이 유지되도록 승인 프로필을 둔다(등록번호는 운영에서 정비).
INSERT INTO "LawyerProfile" ("id", "userId", "registrationNumber", "barAssociation", "verificationStatus", "createdAt", "updatedAt")
SELECT concat('lp_migrate_', replace(gen_random_uuid()::text, '-', '')),
       u."id",
       'MIGRATION-LEGACY',
       'MIGRATION-LEGACY',
       'APPROVED',
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM "User" u
WHERE u."role" = 'LAWYER'
AND NOT EXISTS (SELECT 1 FROM "LawyerProfile" p WHERE p."userId" = u."id");
