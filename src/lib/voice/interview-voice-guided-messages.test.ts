import { describe, expect, it, vi } from "vitest";

import {
  MESSAGE_MIC_PERMISSION_DENIED_KO,
  speechRecognitionErrorToUserNotice,
  supportsBrowserSpeechSynthesisGlobal,
  VOICE_PANEL_PHASE5_F_QA_MARKER,
} from "@/lib/voice/interview-voice-guided-messages";

describe("interview-voice-guided-messages (Phase 5-F)", () => {
  it("QA 마커 유지", () => {
    expect(VOICE_PANEL_PHASE5_F_QA_MARKER).toContain("phase5-f");
  });

  it("not-allowed → 마이크 권한 안내", () => {
    expect(speechRecognitionErrorToUserNotice({ error: "not-allowed" })).toBe(
      MESSAGE_MIC_PERMISSION_DENIED_KO,
    );
    expect(speechRecognitionErrorToUserNotice({ error: "service-not-allowed" })).toBe(
      MESSAGE_MIC_PERMISSION_DENIED_KO,
    );
  });

  it("aborted 등은 사용자 메시지 생략(취소 경로에서 상위 레이어가 처리 가능)", () => {
    expect(speechRecognitionErrorToUserNotice({ error: "aborted" })).toBeUndefined();
  });

  it("speechSynthesis·Utterance가 준비되면 synthesis 사용 가능으로 본다", () => {
    expect(supportsBrowserSpeechSynthesisGlobal(undefined)).toBe(false);

    const prev = Reflect.get(globalThis, "SpeechSynthesisUtterance");
    try {
      Reflect.set(globalThis, "SpeechSynthesisUtterance", class {});
      const synth = {
        speak: vi.fn(),
        cancel: vi.fn(),
      };
      expect(supportsBrowserSpeechSynthesisGlobal({ speechSynthesis: synth } as unknown as Window)).toBe(
        true,
      );
    } finally {
      if (prev !== undefined) Reflect.set(globalThis, "SpeechSynthesisUtterance", prev);
      else Reflect.deleteProperty(globalThis, "SpeechSynthesisUtterance");
    }
  });
});
