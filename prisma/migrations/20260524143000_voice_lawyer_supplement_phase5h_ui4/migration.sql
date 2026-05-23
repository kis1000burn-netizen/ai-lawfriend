-- Phase 5-H-UI-4 — Voice lawyer review supplement question linkage on SupplementRequestItem.

ALTER TABLE "SupplementRequestItem"
    ADD COLUMN "interviewQuestionKey" TEXT,
    ADD COLUMN "voiceTranscriptId" TEXT,
    ADD COLUMN "sourceMarker" TEXT;

CREATE INDEX "SupplementRequestItem_interviewQuestionKey_idx" ON "SupplementRequestItem" ("interviewQuestionKey");

CREATE INDEX "SupplementRequestItem_sourceMarker_idx" ON "SupplementRequestItem" ("sourceMarker");
