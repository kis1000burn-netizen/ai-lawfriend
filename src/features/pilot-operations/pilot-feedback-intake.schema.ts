/**
 * Product Phase 27-B — Pilot feedback intake schema (Zod SSOT).
 */
import { z } from "zod";

export const PILOT_FEEDBACK_INTAKE_SCHEMA_MARKER_PHASE27B =
  "phase27b-pilot-feedback-intake-schema" as const;

export const PILOT_FEEDBACK_INTAKE_VERSION = "27-B.1" as const;

export const PILOT_FEEDBACK_CHANNEL_IDS = [
  "IN_APP",
  "SUPPORT_EMAIL",
  "PILOT_KICKOFF",
  "WEEKLY_CHECKIN",
  "NPS_SURVEY",
] as const;

export const pilotFeedbackChannelSchema = z.object({
  channelId: z.enum(PILOT_FEEDBACK_CHANNEL_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  active: z.boolean(),
});

export const pilotFeedbackIntakeResultSchema = z.object({
  version: z.literal(PILOT_FEEDBACK_INTAKE_VERSION),
  generatedAt: z.string().datetime(),
  channels: z.array(pilotFeedbackChannelSchema).min(1),
  intakeCount: z.number().min(0),
  completionRate: z.number().min(0).max(100),
  feedbackIntakeReady: z.boolean(),
});

export type PilotFeedbackChannelId = (typeof PILOT_FEEDBACK_CHANNEL_IDS)[number];
export type PilotFeedbackIntakeResult = z.infer<typeof pilotFeedbackIntakeResultSchema>;
