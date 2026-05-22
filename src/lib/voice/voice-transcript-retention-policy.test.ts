import { describe, expect, it } from "vitest";

import {
  isVoiceTranscriptConfirmedRetained,
  isVoiceTranscriptDraftCleanupEligible,
  VOICE_BROWSER_TTS_TRACE_ALLOWED,
  VOICE_ORIGINAL_AUDIO_STORAGE_DEFAULT,
  VOICE_PHASE_5I_PRIVACY_RETENTION_OPERATIONS_RUNBOOK_LOCK,
  VOICE_TRANSCRIPT_BODY_LOGGING_ALLOWED,
} from "@/lib/voice/voice-transcript-policy";

describe("voice transcript retention · Phase 5-I policy constants", () => {
  it("CAPTURED is TTL cleanup eligible", () => {
    expect(isVoiceTranscriptDraftCleanupEligible("CAPTURED")).toBe(true);
  });
  it("NEEDS_CONFIRMATION is TTL cleanup eligible", () => {
    expect(isVoiceTranscriptDraftCleanupEligible("NEEDS_CONFIRMATION")).toBe(true);
  });
  it("REJECTED is TTL cleanup eligible", () => {
    expect(isVoiceTranscriptDraftCleanupEligible("REJECTED")).toBe(true);
  });
  it("CONFIRMED is NOT TTL cleanup eligible by batch policy helper", () => {
    expect(isVoiceTranscriptDraftCleanupEligible("CONFIRMED")).toBe(false);
  });
  it("defaults: original audio off", () => {
    expect(VOICE_ORIGINAL_AUDIO_STORAGE_DEFAULT).toBe(false);
  });
  it("defaults: browser TTS trace disabled", () => {
    expect(VOICE_BROWSER_TTS_TRACE_ALLOWED).toBe(false);
  });
  it("defaults: transcript body logging disallowed", () => {
    expect(VOICE_TRANSCRIPT_BODY_LOGGING_ALLOWED).toBe(false);
  });
  it("Phase 5-I verifier lock marker string present", () => {
    expect(VOICE_PHASE_5I_PRIVACY_RETENTION_OPERATIONS_RUNBOOK_LOCK).toContain("PHASE5I");
    expect(VOICE_PHASE_5I_PRIVACY_RETENTION_OPERATIONS_RUNBOOK_LOCK).toContain(
      "VOICE_PRIVACY_RETENTION_OPERATIONS_RUNBOOK_LOCK",
    );
  });
});

describe("confirmed retention helper", () => {
  it("CONFIRMED is retained per helper", () => {
    expect(isVoiceTranscriptConfirmedRetained("CONFIRMED")).toBe(true);
  });
  it("draft statuses are not ‘confirmed retained’", () => {
    expect(isVoiceTranscriptConfirmedRetained("CAPTURED")).toBe(false);
    expect(isVoiceTranscriptConfirmedRetained("NEEDS_CONFIRMATION")).toBe(false);
    expect(isVoiceTranscriptConfirmedRetained("REJECTED")).toBe(false);
  });
});
