-- Phase 5-B Voice transcript draft + interaction trace (`docs/voice/`).

CREATE TYPE "VoiceTranscriptStatus" AS ENUM ('CAPTURED', 'NEEDS_CONFIRMATION', 'CONFIRMED', 'REJECTED');

CREATE TYPE "VoiceInteractionTraceEvent" AS ENUM (
    'VOICE_TRANSCRIPT_CREATED',
    'VOICE_TRANSCRIPT_CONFIRMED',
    'VOICE_TRANSCRIPT_REJECTED',
    'VOICE_INTERVIEW_ANSWER_BOUND'
);

CREATE TABLE "VoiceTranscript" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "interviewId" TEXT,
    "status" "VoiceTranscriptStatus" NOT NULL DEFAULT 'CAPTURED',
    "draftText" TEXT,
    "storeOriginalAudio" BOOLEAN NOT NULL DEFAULT false,
    "originalAudioStorageKey" TEXT,
    "expiresAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceTranscript_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VoiceInteractionTrace" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "voiceTranscriptId" TEXT NOT NULL,
    "event" "VoiceInteractionTraceEvent" NOT NULL,
    "payloadJson" JSONB,
    "actorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceInteractionTrace_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VoiceTranscript_caseId_questionKey_status_idx" ON "VoiceTranscript" ("caseId", "questionKey", "status");

CREATE INDEX "VoiceTranscript_caseId_status_expiresAt_idx" ON "VoiceTranscript" ("caseId", "status", "expiresAt");

CREATE INDEX "VoiceInteractionTrace_caseId_idx" ON "VoiceInteractionTrace" ("caseId");

CREATE INDEX "VoiceInteractionTrace_voiceTranscriptId_createdAt_idx" ON "VoiceInteractionTrace" ("voiceTranscriptId", "createdAt");

ALTER TABLE "VoiceTranscript"
    ADD CONSTRAINT "VoiceTranscript_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VoiceTranscript"
    ADD CONSTRAINT "VoiceTranscript_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VoiceTranscript"
    ADD CONSTRAINT "VoiceTranscript_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VoiceInteractionTrace"
    ADD CONSTRAINT "VoiceInteractionTrace_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VoiceInteractionTrace"
    ADD CONSTRAINT "VoiceInteractionTrace_voiceTranscriptId_fkey" FOREIGN KEY ("voiceTranscriptId") REFERENCES "VoiceTranscript" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VoiceInteractionTrace"
    ADD CONSTRAINT "VoiceInteractionTrace_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
