-- Phase 13-F: Evidence Mapping (case-level)

CREATE TYPE "LitigationEvidenceMappingStatus" AS ENUM ('PENDING', 'RUNNING', 'AI_MAPPED', 'FAILED');

CREATE TABLE "LitigationEvidenceMapping" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "mappingStatus" "LitigationEvidenceMappingStatus" NOT NULL,
    "mappingJson" JSONB NOT NULL,
    "errorMessage" TEXT,
    "mappedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationEvidenceMapping_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LitigationEvidenceMappingItemReview" (
    "id" TEXT NOT NULL,
    "mappingId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemKind" TEXT NOT NULL,
    "reviewStatus" TEXT NOT NULL,
    "reviewedByUserId" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationEvidenceMappingItemReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LitigationEvidenceMapping_caseId_revision_key" ON "LitigationEvidenceMapping"("caseId", "revision");
CREATE INDEX "LitigationEvidenceMapping_caseId_mappedAt_idx" ON "LitigationEvidenceMapping"("caseId", "mappedAt");

CREATE UNIQUE INDEX "LitigationEvidenceMappingItemReview_mappingId_itemId_key" ON "LitigationEvidenceMappingItemReview"("mappingId", "itemId");
CREATE INDEX "LitigationEvidenceMappingItemReview_mappingId_itemKind_idx" ON "LitigationEvidenceMappingItemReview"("mappingId", "itemKind");

ALTER TABLE "LitigationEvidenceMapping" ADD CONSTRAINT "LitigationEvidenceMapping_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LitigationEvidenceMappingItemReview" ADD CONSTRAINT "LitigationEvidenceMappingItemReview_mappingId_fkey" FOREIGN KEY ("mappingId") REFERENCES "LitigationEvidenceMapping"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LitigationEvidenceMappingItemReview" ADD CONSTRAINT "LitigationEvidenceMappingItemReview_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
