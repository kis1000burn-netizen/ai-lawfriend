-- Legal Knowledge Pipeline — Intake · Research Brief · Lawyer Review · Packet lineage
-- SSOT: docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md

-- CreateEnum
CREATE TYPE "LegalKnowledgeIntakeStatus" AS ENUM (
    'DRAFT',
    'MAPPING_PENDING',
    'READY_FOR_RESEARCH',
    'RESEARCH_IN_PROGRESS',
    'LAWYER_REVIEW_PENDING',
    'PACKET_DRAFT_LINKED',
    'PACKET_APPROVED',
    'PIPELINE_REJECTED',
    'REJECTED',
    'ARCHIVED'
);

CREATE TYPE "LegalKnowledgeResearchBriefStatus" AS ENUM (
    'DRAFT',
    'READY_FOR_LAWYER_REVIEW',
    'REVISION_REQUESTED',
    'SUPERSEDED',
    'ARCHIVED'
);

CREATE TYPE "LegalKnowledgeLawyerReviewDecisionType" AS ENUM (
    'APPROVE_FOR_PACKET_DRAFT',
    'REQUEST_BRIEF_REVISION',
    'REJECT'
);

CREATE TYPE "LegalKnowledgeLawyerReviewStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REVISION_REQUESTED',
    'REJECTED'
);

CREATE TYPE "LegalKnowledgePacketIntent" AS ENUM ('NEW_PACKET', 'EXTEND_EXISTING');

-- CreateTable
CREATE TABLE "LegalKnowledgeDemandIntake" (
    "id" TEXT NOT NULL,
    "signalSource" TEXT NOT NULL,
    "observationWindowFrom" DATE NOT NULL,
    "observationWindowTo" DATE NOT NULL,
    "querySignature" JSONB NOT NULL,
    "questionType" JSONB NOT NULL,
    "caseTypeMapping" JSONB NOT NULL,
    "suggestedGongbuhoCode" TEXT,
    "demandStrength" TEXT NOT NULL,
    "intakeCompliance" JSONB NOT NULL,
    "status" "LegalKnowledgeIntakeStatus" NOT NULL DEFAULT 'DRAFT',
    "operatorNote" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalKnowledgeDemandIntake_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LegalKnowledgeResearchBrief" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "demandKeywordSnapshot" TEXT NOT NULL,
    "targetCaseType" TEXT NOT NULL,
    "packetIntent" "LegalKnowledgePacketIntent" NOT NULL,
    "targetGongbuhoCode" TEXT,
    "canonicalSourceRefs" JSONB NOT NULL,
    "legalIssueOutline" TEXT NOT NULL,
    "structureHints" JSONB NOT NULL,
    "researchCompliance" JSONB NOT NULL,
    "status" "LegalKnowledgeResearchBriefStatus" NOT NULL DEFAULT 'DRAFT',
    "preparedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalKnowledgeResearchBrief_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LegalKnowledgeLawyerReviewDecision" (
    "id" TEXT NOT NULL,
    "researchBriefId" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "decision" "LegalKnowledgeLawyerReviewDecisionType" NOT NULL,
    "reviewerAttestation" JSONB NOT NULL,
    "reviewNotes" TEXT NOT NULL,
    "highRiskFlags" JSONB,
    "rejectionReasonCode" TEXT,
    "status" "LegalKnowledgeLawyerReviewStatus" NOT NULL DEFAULT 'PENDING',
    "gongbuhoPacketId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalKnowledgeLawyerReviewDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LegalKnowledgeDemandIntake_status_idx" ON "LegalKnowledgeDemandIntake" ("status");
CREATE INDEX "LegalKnowledgeDemandIntake_createdByUserId_idx" ON "LegalKnowledgeDemandIntake" ("createdByUserId");

CREATE INDEX "LegalKnowledgeResearchBrief_intakeId_idx" ON "LegalKnowledgeResearchBrief" ("intakeId");
CREATE INDEX "LegalKnowledgeResearchBrief_status_idx" ON "LegalKnowledgeResearchBrief" ("status");
CREATE INDEX "LegalKnowledgeResearchBrief_preparedByUserId_idx" ON "LegalKnowledgeResearchBrief" ("preparedByUserId");

CREATE UNIQUE INDEX "LegalKnowledgeLawyerReviewDecision_gongbuhoPacketId_key" ON "LegalKnowledgeLawyerReviewDecision" ("gongbuhoPacketId");
CREATE INDEX "LegalKnowledgeLawyerReviewDecision_researchBriefId_idx" ON "LegalKnowledgeLawyerReviewDecision" ("researchBriefId");
CREATE INDEX "LegalKnowledgeLawyerReviewDecision_intakeId_idx" ON "LegalKnowledgeLawyerReviewDecision" ("intakeId");

-- AddForeignKey
ALTER TABLE "LegalKnowledgeDemandIntake"
    ADD CONSTRAINT "LegalKnowledgeDemandIntake_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LegalKnowledgeResearchBrief"
    ADD CONSTRAINT "LegalKnowledgeResearchBrief_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "LegalKnowledgeDemandIntake" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LegalKnowledgeResearchBrief"
    ADD CONSTRAINT "LegalKnowledgeResearchBrief_preparedByUserId_fkey" FOREIGN KEY ("preparedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LegalKnowledgeLawyerReviewDecision"
    ADD CONSTRAINT "LegalKnowledgeLawyerReviewDecision_researchBriefId_fkey" FOREIGN KEY ("researchBriefId") REFERENCES "LegalKnowledgeResearchBrief" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LegalKnowledgeLawyerReviewDecision"
    ADD CONSTRAINT "LegalKnowledgeLawyerReviewDecision_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "LegalKnowledgeDemandIntake" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LegalKnowledgeLawyerReviewDecision"
    ADD CONSTRAINT "LegalKnowledgeLawyerReviewDecision_gongbuhoPacketId_fkey" FOREIGN KEY ("gongbuhoPacketId") REFERENCES "GongbuhoPacket" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
