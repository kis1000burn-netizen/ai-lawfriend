-- LawyerMatchingRecommendation persistence + active CaseAssignment partial unique.
-- Pre-deploy: npm run verify:lawyer-matching-migration-predeploy -- --check-duplicates
-- Staging/prod apply: npm run db:deploy  (NOT npm run db:migrate)

-- CreateEnum
CREATE TYPE "LawyerMatchingRecommendationStatus" AS ENUM ('DRAFT', 'REVIEW_REQUIRED', 'ASSIGNMENT_READY', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "LawyerMatchingRecommendationGeneratedBy" AS ENUM ('RULE_ENGINE', 'AI_ASSIST');

-- CreateTable
CREATE TABLE "LawyerMatchingRecommendation" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "status" "LawyerMatchingRecommendationStatus" NOT NULL,
    "matchedSpecialties" JSONB NOT NULL,
    "excludedLawyersSnapshot" JSONB NOT NULL,
    "eligibleLawyerIds" JSONB NOT NULL,
    "recommendedAssignmentNote" TEXT NOT NULL,
    "generatedBy" "LawyerMatchingRecommendationGeneratedBy" NOT NULL DEFAULT 'RULE_ENGINE',
    "requiresHumanApproval" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "activeCaseKey" TEXT,
    "createdByAdminId" TEXT NOT NULL,
    "approvedByAdminId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedAssignmentId" TEXT,
    "rejectedByAdminId" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LawyerMatchingRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LawyerMatchingRecommendation_activeCaseKey_key" ON "LawyerMatchingRecommendation"("activeCaseKey");

-- CreateIndex
CREATE UNIQUE INDEX "LawyerMatchingRecommendation_approvedAssignmentId_key" ON "LawyerMatchingRecommendation"("approvedAssignmentId");

-- CreateIndex
CREATE INDEX "LawyerMatchingRecommendation_caseId_status_createdAt_idx" ON "LawyerMatchingRecommendation"("caseId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "LawyerMatchingRecommendation_createdByAdminId_createdAt_idx" ON "LawyerMatchingRecommendation"("createdByAdminId", "createdAt");

-- AddForeignKey
ALTER TABLE "LawyerMatchingRecommendation" ADD CONSTRAINT "LawyerMatchingRecommendation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerMatchingRecommendation" ADD CONSTRAINT "LawyerMatchingRecommendation_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerMatchingRecommendation" ADD CONSTRAINT "LawyerMatchingRecommendation_approvedByAdminId_fkey" FOREIGN KEY ("approvedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerMatchingRecommendation" ADD CONSTRAINT "LawyerMatchingRecommendation_rejectedByAdminId_fkey" FOREIGN KEY ("rejectedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerMatchingRecommendation" ADD CONSTRAINT "LawyerMatchingRecommendation_approvedAssignmentId_fkey" FOREIGN KEY ("approvedAssignmentId") REFERENCES "CaseAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Partial unique: one active assignment per case+lawyer pair
CREATE UNIQUE INDEX "CaseAssignment_caseId_assigneeUserId_active_unique"
ON "CaseAssignment" ("caseId", "assigneeUserId")
WHERE "isActive" = true;
