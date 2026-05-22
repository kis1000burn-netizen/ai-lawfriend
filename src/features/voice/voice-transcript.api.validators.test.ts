import { describe, expect, it } from "vitest";

import { voiceSttCaptureBodySchema } from "@/features/voice/voice-transcript.api.validators";

describe("voice-transcript.api.validators", () => {
  it("originalAudioStorageKey 는 storeOriginalAudio 없으면 검증 오류", () => {
    const r = voiceSttCaptureBodySchema.safeParse({
      questionKey: "q1",
      sttDraftText: "내용입니다",
      originalAudioStorageKey: "blob/x",
    });
    expect(r.success).toBe(false);
  });

  it("양쪽 모두 허용되면 통과", () => {
    const r = voiceSttCaptureBodySchema.safeParse({
      questionKey: "q1",
      sttDraftText: "내용입니다",
      storeOriginalAudio: true,
      originalAudioStorageKey: "blob/x",
    });
    expect(r.success).toBe(true);
  });
});
