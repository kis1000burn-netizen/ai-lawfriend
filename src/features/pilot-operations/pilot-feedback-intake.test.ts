import { describe, expect, it } from "vitest";
import { assemblePilotFeedbackIntake } from "./pilot-feedback-intake.policy";
import { PILOT_FEEDBACK_CHANNELS, PILOT_FEEDBACK_MIN_INTAKE_COUNT } from "./pilot-feedback-intake.registry";
import { buildPilotFeedbackIntakeSummary } from "./pilot-feedback-intake.service";

describe("pilot-feedback-intake (Phase 27-B)", () => {
  it("requires minimum intake count", () => {
    const result = assemblePilotFeedbackIntake({
      activeChannelIds: new Set(PILOT_FEEDBACK_CHANNELS.map((c) => c.channelId)),
      intakeCount: PILOT_FEEDBACK_MIN_INTAKE_COUNT - 1,
    });
    expect(result.feedbackIntakeReady).toBe(false);
  });

  it("marks feedbackIntakeReady when channels active and intake met", () => {
    const result = buildPilotFeedbackIntakeSummary();
    expect(result.feedbackIntakeReady).toBe(true);
  });
});
