-- Phase 13-H: Litigation Operations Integration

CREATE TYPE "LitigationDeadlineStatus" AS ENUM ('OPEN', 'COMPLETED', 'CANCELLED');
CREATE TYPE "LitigationTaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "LitigationTaskKind" AS ENUM ('RISK', 'ISSUE', 'EVIDENCE_GAP', 'REBUTTAL', 'GENERAL');
CREATE TYPE "LitigationDraftContextStatus" AS ENUM ('DRAFT', 'READY', 'ARCHIVED');
CREATE TYPE "LitigationOpsLinkTargetType" AS ENUM ('DEADLINE', 'TASK', 'SUPPLEMENT', 'DRAFT_CONTEXT');

CREATE TABLE "LitigationDeadline" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "candidateDueText" TEXT,
    "dueAt" TIMESTAMP(3),
    "status" "LitigationDeadlineStatus" NOT NULL DEFAULT 'OPEN',
    "reviewDecisionId" TEXT,
    "sourceItemId" TEXT NOT NULL,
    "sourcePhase" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LitigationDeadline_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LitigationTask" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskKind" "LitigationTaskKind" NOT NULL,
    "status" "LitigationTaskStatus" NOT NULL DEFAULT 'OPEN',
    "reviewDecisionId" TEXT,
    "sourceItemId" TEXT NOT NULL,
    "sourcePhase" TEXT,
    "assigneeUserId" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LitigationTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LitigationDraftContext" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contextJson" JSONB NOT NULL,
    "reviewDecisionIds" JSONB NOT NULL,
    "status" "LitigationDraftContextStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LitigationDraftContext_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LitigationDocumentIntelligenceOpsSync" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "syncJson" JSONB NOT NULL,
    "syncedByUserId" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationDocumentIntelligenceOpsSync_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LitigationDocumentIntelligenceOpsLink" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "reviewDecisionId" TEXT NOT NULL,
    "sourceItemId" TEXT NOT NULL,
    "targetType" "LitigationOpsLinkTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LitigationDocumentIntelligenceOpsLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LitigationDeadline_caseId_sourceItemId_key" ON "LitigationDeadline"("caseId", "sourceItemId");
CREATE INDEX "LitigationDeadline_caseId_status_idx" ON "LitigationDeadline"("caseId", "status");

CREATE UNIQUE INDEX "LitigationTask_caseId_sourceItemId_key" ON "LitigationTask"("caseId", "sourceItemId");
CREATE INDEX "LitigationTask_caseId_status_idx" ON "LitigationTask"("caseId", "status");
CREATE INDEX "LitigationTask_assigneeUserId_status_idx" ON "LitigationTask"("assigneeUserId", "status");

CREATE INDEX "LitigationDraftContext_caseId_status_idx" ON "LitigationDraftContext"("caseId", "status");

CREATE UNIQUE INDEX "LitigationDocumentIntelligenceOpsSync_caseId_revision_key" ON "LitigationDocumentIntelligenceOpsSync"("caseId", "revision");
CREATE INDEX "LitigationDocumentIntelligenceOpsSync_caseId_syncedAt_idx" ON "LitigationDocumentIntelligenceOpsSync"("caseId", "syncedAt");

CREATE UNIQUE INDEX "LitigationDocumentIntelligenceOpsLink_caseId_sourceItemId_targetType_key" ON "LitigationDocumentIntelligenceOpsLink"("caseId", "sourceItemId", "targetType");
CREATE INDEX "LitigationDocumentIntelligenceOpsLink_caseId_reviewDecisionId_idx" ON "LitigationDocumentIntelligenceOpsLink"("caseId", "reviewDecisionId");

ALTER TABLE "LitigationDeadline" ADD CONSTRAINT "LitigationDeadline_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LitigationDeadline" ADD CONSTRAINT "LitigationDeadline_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LitigationTask" ADD CONSTRAINT "LitigationTask_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LitigationTask" ADD CONSTRAINT "LitigationTask_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LitigationTask" ADD CONSTRAINT "LitigationTask_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LitigationDraftContext" ADD CONSTRAINT "LitigationDraftContext_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LitigationDraftContext" ADD CONSTRAINT "LitigationDraftContext_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LitigationDocumentIntelligenceOpsSync" ADD CONSTRAINT "LitigationDocumentIntelligenceOpsSync_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LitigationDocumentIntelligenceOpsSync" ADD CONSTRAINT "LitigationDocumentIntelligenceOpsSync_syncedByUserId_fkey" FOREIGN KEY ("syncedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LitigationDocumentIntelligenceOpsLink" ADD CONSTRAINT "LitigationDocumentIntelligenceOpsLink_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
