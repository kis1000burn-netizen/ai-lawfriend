import { describe, expect, it } from "vitest";

import { computeVoiceTranscriptDraftExpiresAt, VOICE_TRANSCRIPT_DRAFT_TTL_HOURS_DEFAULT } from "@/lib/voice/voice-transcript-policy";

describe("voice-transcript-policy", () => {
  it("computeVoiceTranscriptDraftExpiresAt offsets by TTL hours", () => {
    const from = new Date("2026-05-23T12:00:00.000Z");
    const out = computeVoiceTranscriptDraftExpiresAt(from, VOICE_TRANSCRIPT_DRAFT_TTL_HOURS_DEFAULT);
    expect(out.getTime()).toBe(from.getTime() + VOICE_TRANSCRIPT_DRAFT_TTL_HOURS_DEFAULT * 3600 * 1000);
  });
});
