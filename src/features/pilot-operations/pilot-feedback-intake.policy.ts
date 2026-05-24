/**
 * Product Phase 27-B — Pilot feedback intake policy SSOT.
 */
import {
  PILOT_FEEDBACK_CHANNELS,
  PILOT_FEEDBACK_MIN_INTAKE_COUNT,
} from "./pilot-feedback-intake.registry";
import type { PilotFeedbackIntakeResult } from "./pilot-feedback-intake.schema";
import { PILOT_FEEDBACK_INTAKE_VERSION } from "./pilot-feedback-intake.schema";

export const PILOT_FEEDBACK_INTAKE_POLICY_MARKER_PHASE27B =
  "phase27b-pilot-feedback-intake-policy" as const;

export function assemblePilotFeedbackIntake(input: {
  activeChannelIds: Set<string>;
  intakeCount: number;
  generatedAt?: string;
}): PilotFeedbackIntakeResult {
  const channels = PILOT_FEEDBACK_CHANNELS.map((channel) => ({
    ...channel,
    active: input.activeChannelIds.has(channel.channelId),
  }));

  const required = channels.filter((channel) => channel.required);
  const activeRequired = required.filter((channel) => channel.active).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((activeRequired / required.length) * 100);

  return {
    version: PILOT_FEEDBACK_INTAKE_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    channels,
    intakeCount: input.intakeCount,
    completionRate,
    feedbackIntakeReady:
      activeRequired === required.length && input.intakeCount >= PILOT_FEEDBACK_MIN_INTAKE_COUNT,
  };
}
