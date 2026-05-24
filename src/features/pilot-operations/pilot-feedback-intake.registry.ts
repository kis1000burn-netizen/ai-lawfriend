/**
 * Product Phase 27-B — Pilot feedback intake channels SSOT.
 */
import type { PilotFeedbackIntakeResult } from "./pilot-feedback-intake.schema";

export const PILOT_FEEDBACK_INTAKE_REGISTRY_MARKER_PHASE27B =
  "phase27b-pilot-feedback-intake-registry" as const;

export const PILOT_FEEDBACK_MIN_INTAKE_COUNT = 3 as const;

type FeedbackChannel = Omit<PilotFeedbackIntakeResult["channels"][number], "active">;

export const PILOT_FEEDBACK_CHANNELS: FeedbackChannel[] = [
  { channelId: "IN_APP", label: "In-app feedback widget", required: true },
  { channelId: "SUPPORT_EMAIL", label: "Support email intake", required: true },
  { channelId: "PILOT_KICKOFF", label: "Pilot kickoff notes", required: true },
  { channelId: "WEEKLY_CHECKIN", label: "Weekly pilot check-in", required: true },
  { channelId: "NPS_SURVEY", label: "NPS / satisfaction survey", required: false },
];
