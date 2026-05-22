-- P1: private storage 스키마 확장 — fileUrl legacy nullable, storageKey 계열 추가
-- (동작 전환·signed URL·이관은 P2~P4. LAWYER_VERIFICATION_DOCUMENT_STORAGE_SECURITY_PLAN.md §9)

ALTER TABLE "LawyerVerificationDocument" ALTER COLUMN "fileUrl" DROP NOT NULL;

ALTER TABLE "LawyerVerificationDocument" ADD COLUMN "storageKey" TEXT,
ADD COLUMN "bucket" TEXT,
ADD COLUMN "mimeType" TEXT,
ADD COLUMN "sizeBytes" INTEGER,
ADD COLUMN "checksum" TEXT,
ADD COLUMN "migratedAt" TIMESTAMP(3);

CREATE INDEX "LawyerVerificationDocument_storageKey_idx" ON "LawyerVerificationDocument"("storageKey");
