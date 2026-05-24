-- Product Phase 23-A — AI Evaluation Dataset

CREATE TYPE "AiEvaluationCasePackType" AS ENUM (
  'LOAN',
  'LEASE',
  'DIVORCE',
  'DAMAGES',
  'LABOR',
  'CRIMINAL',
  'GENERIC'
);

CREATE TABLE "AiEvaluationDatasetEntry" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "packType" "AiEvaluationCasePackType" NOT NULL,
    "feature" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "inputContext" JSONB NOT NULL,
    "expectedCriteria" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiEvaluationDatasetEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AiEvaluationDatasetEntry_code_key" ON "AiEvaluationDatasetEntry"("code");
CREATE INDEX "AiEvaluationDatasetEntry_packType_feature_isActive_idx" ON "AiEvaluationDatasetEntry"("packType", "feature", "isActive");
