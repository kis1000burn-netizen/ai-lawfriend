import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InterviewVoiceGuidedPanel } from "@/components/cases/interview-voice-guided-panel";
import {
  MESSAGE_TTS_UNAVAILABLE_KO,
  VOICE_PANEL_PHASE5_F_QA_MARKER,
} from "@/lib/voice/interview-voice-guided-messages";

const baseProjection = {
  label: "사건 내용을 한 문장으로 말씀해 주세요.",
  type: "TEXT" as const,
};

describe("InterviewVoiceGuidedPanel (Phase 5-F)", () => {
  it("data-phase5-f 마커·접근 가능한 레이블(섹션)을 제공", () => {
    render(
      <InterviewVoiceGuidedPanel
        caseId="00000000-0000-4000-a000-000000000001"
        questionKey="case_background"
        interactionDisabled={false}
        projection={baseProjection}
        onCommitted={() => Promise.resolve()}
      />,
    );

    const labelled = screen.getByLabelText(/인터뷰 음성 안내 및 답변 입력/);
    expect(labelled).toHaveAttribute("data-phase5-f", VOICE_PANEL_PHASE5_F_QA_MARKER);
    expect(labelled).toHaveAttribute("data-marker", "phase5-e-interview-guided-voice-panel");
    cleanup();
  });

  it("speech 합성이 없으면 role=status 로 TTS 비가용 카피", () => {
    const ctorPrev = Reflect.get(globalThis, "SpeechSynthesisUtterance");
    const synthDesc = Reflect.getOwnPropertyDescriptor(window, "speechSynthesis");
    try {
      Reflect.deleteProperty(globalThis, "SpeechSynthesisUtterance");
      try {
        Reflect.deleteProperty(window, "speechSynthesis");
      } catch {
        Reflect.defineProperty(window, "speechSynthesis", {
          value: undefined,
          configurable: true,
          enumerable: true,
          writable: true,
        });
      }

      render(
        <InterviewVoiceGuidedPanel
          caseId="00000000-0000-4000-a000-000000000001"
          questionKey="case_background"
          interactionDisabled={false}
          projection={baseProjection}
          onCommitted={() => Promise.resolve()}
        />,
      );

      const ttsNotice = screen.getByText(MESSAGE_TTS_UNAVAILABLE_KO);
      expect(ttsNotice).toHaveAttribute("role", "status");
      expect(screen.queryByRole("toolbar", { name: /질문 음성 재생/ })).toBeNull();
    } finally {
      cleanup();
      if (ctorPrev !== undefined) Reflect.set(globalThis, "SpeechSynthesisUtterance", ctorPrev);
      else Reflect.deleteProperty(globalThis, "SpeechSynthesisUtterance");

      if (synthDesc) Reflect.defineProperty(window, "speechSynthesis", synthDesc);
    }
  });

  it("speech 합성이 있으면 재생 도구모음(toolbar)·질문 듣기", () => {
    const ctorPrev = Reflect.get(globalThis, "SpeechSynthesisUtterance");
    const synthStored = Reflect.getOwnPropertyDescriptor(window, "speechSynthesis");
    try {
      Reflect.set(globalThis, "SpeechSynthesisUtterance", class {});
      Reflect.defineProperty(window, "speechSynthesis", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: {
          speak: vi.fn(),
          cancel: vi.fn(),
          getVoices: () => [],
        },
      });

      render(
        <InterviewVoiceGuidedPanel
          caseId="00000000-0000-4000-a000-000000000001"
          questionKey="case_background"
          interactionDisabled={false}
          projection={baseProjection}
          onCommitted={() => Promise.resolve()}
        />,
      );

      expect(screen.getByRole("toolbar", { name: /질문 음성 재생/ })).toBeTruthy();
      expect(screen.getByRole("button", { name: /질문 본문/ })).toBeTruthy();
      cleanup();
    } finally {
      if (ctorPrev !== undefined) Reflect.set(globalThis, "SpeechSynthesisUtterance", ctorPrev);
      else Reflect.deleteProperty(globalThis, "SpeechSynthesisUtterance");

      if (synthStored) Reflect.defineProperty(window, "speechSynthesis", synthStored);
    }
  });
});
