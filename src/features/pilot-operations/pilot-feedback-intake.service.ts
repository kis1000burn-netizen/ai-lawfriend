/**
 * Product Phase 27-B — Pilot feedback intake service.
 */
import { assemblePilotFeedbackIntake } from "./pilot-feedback-intake.policy";
import {
  PILOT_FEEDBACK_CHANNELS,
  PILOT_FEEDBACK_MIN_INTAKE_COUNT,
} from "./pilot-feedback-intake.registry";
import type { PilotFeedbackIntakeResult } from "./pilot-feedback-intake.schema";

export const PILOT_FEEDBACK_INTAKE_SERVICE_MARKER_PHASE27B =
  "phase27b-pilot-feedback-intake-service" as const;

export function buildPilotFeedbackIntakeSummary(input?: {
  activeChannelIds?: string[];
  intakeCount?: number;
}): PilotFeedbackIntakeResult {
  const activeChannelIds = new Set(
    input?.activeChannelIds ?? PILOT_FEEDBACK_CHANNELS.map((c) => c.channelId),
  );

  return assemblePilotFeedbackIntake({
    activeChannelIds,
    intakeCount: input?.intakeCount ?? PILOT_FEEDBACK_MIN_INTAKE_COUNT,
  });
}
