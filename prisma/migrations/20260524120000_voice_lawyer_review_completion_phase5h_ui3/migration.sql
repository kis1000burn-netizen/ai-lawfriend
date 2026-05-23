-- Phase 5-H-UI-3 — Lawyer voice review completion flags (`VoiceLawyerReviewCompletion`).

CREATE TABLE "VoiceLawyerReviewCompletion" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "voiceTranscriptId" TEXT NOT NULL,
    "reviewedByUserId" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceLawyerReviewCompletion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VoiceLawyerReviewCompletion_caseId_questionKey_key" ON "VoiceLawyerReviewCompletion" ("caseId", "questionKey");

CREATE INDEX "VoiceLawyerReviewCompletion_caseId_idx" ON "VoiceLawyerReviewCompletion" ("caseId");

CREATE INDEX "VoiceLawyerReviewCompletion_voiceTranscriptId_idx" ON "VoiceLawyerReviewCompletion" ("voiceTranscriptId");

ALTER TABLE "VoiceLawyerReviewCompletion"
    ADD CONSTRAINT "VoiceLawyerReviewCompletion_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VoiceLawyerReviewCompletion"
    ADD CONSTRAINT "VoiceLawyerReviewCompletion_voiceTranscriptId_fkey" FOREIGN KEY ("voiceTranscriptId") REFERENCES "VoiceTranscript" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VoiceLawyerReviewCompletion"
    ADD CONSTRAINT "VoiceLawyerReviewCompletion_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
