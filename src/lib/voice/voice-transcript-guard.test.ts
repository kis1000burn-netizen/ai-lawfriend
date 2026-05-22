import { VoiceTranscriptStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { ValidationError } from "@/lib/errors";
import { assertVoiceTranscriptConfirmedForInterviewBinding } from "@/lib/voice/voice-transcript-guard";

describe("voice-transcript-guard", () => {
  it("allows CONFIRMED", () => {
    expect(() => assertVoiceTranscriptConfirmedForInterviewBinding(VoiceTranscriptStatus.CONFIRMED)).not.toThrow();
  });

  it("rejects non-CONFIRMED", () => {
    expect(() => assertVoiceTranscriptConfirmedForInterviewBinding(VoiceTranscriptStatus.NEEDS_CONFIRMATION)).toThrow(
      ValidationError,
    );
  });
});
