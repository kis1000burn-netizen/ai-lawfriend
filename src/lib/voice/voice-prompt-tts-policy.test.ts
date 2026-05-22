import { describe, expect, it } from "vitest";

import {
  buildDefaultTtsReadAloudText,
  buildExampleListeningScript,
  buildInterviewPrimaryTtsMainScript,
  resolveSensitiveSpeechOpeningLine,
  VOICE_GUIDED_DEFAULT_SENSITIVE_PREFIX_KO,
  VOICE_PROMPT_PAYLOAD_KEY,
  VOICE_PROMPT_PLATFORM_COPY_KO,
  VOICE_PROMPT_SPEC_MARKER_PHASE5_C,
  VOICE_PROMPT_SPEC_MARKER_PHASE5_E,
} from "@/lib/voice/voice-prompt-tts-policy";

describe("voice-prompt-tts-policy", () => {
  it("Phase 5-C SSOT 마커·payload 키 유지", () => {
    expect(VOICE_PROMPT_SPEC_MARKER_PHASE5_C).toContain("phase5-c");
    expect(VOICE_PROMPT_PAYLOAD_KEY).toBe("voicePrompt");
  });

  it("Phase 5-E 마커·플랫폼 카피 키는 SPEC §5 레이아(id)와 매핑된다", () => {
    expect(VOICE_PROMPT_SPEC_MARKER_PHASE5_E).toContain("phase5-e");
    expect(VOICE_PROMPT_PLATFORM_COPY_KO.replayQuestion.length).toBeGreaterThan(0);
    expect(VOICE_PROMPT_PLATFORM_COPY_KO.speakSlowly.length).toBeGreaterThan(0);
  });

  it("buildDefaultTtsReadAloudText 우선 라벨 + 참고 헬프", () => {
    const s = buildDefaultTtsReadAloudText({
      label: "사건 날짜를 말씀해 주세요.",
      helpText: "대략 기억나는 대로 가능합니다.",
    });
    expect(s).toContain("사건 날짜를 말씀해 주세요.");
    expect(s).toContain("참고로,");
    expect(s).toContain("대략 기억");
  });

  it("buildInterviewPrimaryTtsMainScript 에서 readAloudPrimary 우선", () => {
    expect(
      buildInterviewPrimaryTtsMainScript({
        label: "라벨",
        voicePrompt: { readAloudPrimary: "  덮어쓴 본문  " },
      }),
    ).toBe("덮어쓴 본문");
  });

  it("resolveSensitiveSpeechOpeningLine 는 카스텀이 없으면 기본 접두", () => {
    expect(
      resolveSensitiveSpeechOpeningLine({
        label: "X",
        voicePrompt: {
          requiresSensitiveSpeechNotice: true,
        },
      }),
    ).toBe(VOICE_GUIDED_DEFAULT_SENSITIVE_PREFIX_KO);

    expect(
      resolveSensitiveSpeechOpeningLine({
        label: "X",
        voicePrompt: {
          requiresSensitiveSpeechNotice: true,
          sensitivePrefix: "  커스텀 접두입니다. ",
        },
      }),
    ).toBe("커스텀 접두입니다.");
  });

  it("민감 고지 필요 없음이면 opening null", () => {
    expect(
      resolveSensitiveSpeechOpeningLine({
        label: "일반 문항",
        voicePrompt: { requiresSensitiveSpeechNotice: false },
      }),
    ).toBeNull();

    expect(
      resolveSensitiveSpeechOpeningLine({
        label: "일반 문항",
      }),
    ).toBeNull();
  });

  it("예시 문자열 포함 시 안내 카피 + 예시 패턴 접속", () => {
    expect(buildExampleListeningScript({ label: "Q" })).toContain(
      VOICE_PROMPT_PLATFORM_COPY_KO.exampleHintTemplate,
    );
    expect(
      buildExampleListeningScript({
        label: "Q",
        voicePrompt: { exampleSentence: "사건번호는 문자와 숫자 조합 같은 형태일 수 있습니다." },
      }),
    ).toContain("예시 참고 패턴입니다.");
  });

  it("SELECT 타입은 짧게 보기 안내 접미 가능", () => {
    expect(
      buildInterviewPrimaryTtsMainScript({
        label: "선택",
        type: "SELECT",
        options: [
          { label: "항목 A", value: "a" },
          { label: "항목 B", value: "b" },
        ],
      }),
    ).toContain("보기:");
    expect(buildInterviewPrimaryTtsMainScript({ label: "텍스트", type: "TEXT" })).toBe("텍스트");
  });
});
