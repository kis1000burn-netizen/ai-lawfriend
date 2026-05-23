import { describe, expect, it } from "vitest";

import { resolveLawyerVoiceReviewFlags } from "@/lib/voice/voice-lawyer-review-flags.repository";

describe("voice-lawyer-review-flags.repository (Phase 5-H-UI-3)", () => {
  it("marks reviewed only when completion binds to latest confirmed transcript", () => {
    const flags = resolveLawyerVoiceReviewFlags({
      completions: [{ questionKey: "q1", voiceTranscriptId: "tr_old" }],
      latestConfirmedByQuestionKey: new Map([
        ["q1", { questionKey: "q1", id: "tr_new" }],
      ]),
    });

    expect(flags).toEqual({ q1: false });
  });

  it("returns true when completion matches latest confirmed transcript", () => {
    const flags = resolveLawyerVoiceReviewFlags({
      completions: [{ questionKey: "q1", voiceTranscriptId: "tr_new" }],
      latestConfirmedByQuestionKey: new Map([
        ["q1", { questionKey: "q1", id: "tr_new" }],
      ]),
    });

    expect(flags).toEqual({ q1: true });
  });

  it("ignores completions for questions without confirmed transcript", () => {
    const flags = resolveLawyerVoiceReviewFlags({
      completions: [{ questionKey: "q2", voiceTranscriptId: "tr_x" }],
      latestConfirmedByQuestionKey: new Map([
        ["q1", { questionKey: "q1", id: "tr_a" }],
      ]),
    });

    expect(flags).toEqual({ q1: false });
    expect(flags.q2).toBeUndefined();
  });
});
