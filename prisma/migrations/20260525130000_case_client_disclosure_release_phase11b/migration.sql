-- Phase 11-B — Client disclosure preview release audit
CREATE TABLE "CaseClientDisclosureRelease" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "snapshotId" TEXT,
    "caseStatus" TEXT NOT NULL,
    "previewVersion" TEXT NOT NULL DEFAULT '11-B.1',
    "disclosureVersion" TEXT NOT NULL DEFAULT '10-C.1',
    "statementsJson" JSONB NOT NULL,
    "diffJson" JSONB NOT NULL,
    "releaseNotes" TEXT,
    "releasedByUserId" TEXT NOT NULL,
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseClientDisclosureRelease_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CaseClientDisclosureRelease_caseId_releasedAt_idx" ON "CaseClientDisclosureRelease"("caseId", "releasedAt");

ALTER TABLE "CaseClientDisclosureRelease" ADD CONSTRAINT "CaseClientDisclosureRelease_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CaseClientDisclosureRelease" ADD CONSTRAINT "CaseClientDisclosureRelease_releasedByUserId_fkey" FOREIGN KEY ("releasedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
