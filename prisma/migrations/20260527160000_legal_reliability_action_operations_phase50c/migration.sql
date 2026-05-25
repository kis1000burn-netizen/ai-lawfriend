-- Phase 50-C — Client Response & Evidence Intake Sync
ALTER TABLE "LegalReliabilityActionOperation"
ADD COLUMN "clientResponseSummary" TEXT,
ADD COLUMN "linkedClientSubmissionIds" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN "linkedUploadedFileIds" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN "linkedEvidenceIntakeIds" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN "evidenceIntakeStatus" TEXT NOT NULL DEFAULT 'NONE',
ADD COLUMN "reviewHandoffJson" JSONB;
