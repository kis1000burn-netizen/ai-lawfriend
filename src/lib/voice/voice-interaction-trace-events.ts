/**
 * Phase 5-B — Prisma enum `VoiceInteractionTraceEvent`와 동일 순서 값 SSOT(JS).
 */

export const VOICE_INTERACTION_TRACE_EVENTS = [
  "VOICE_TRANSCRIPT_CREATED",
  "VOICE_TRANSCRIPT_CONFIRMED",
  "VOICE_TRANSCRIPT_REJECTED",
  "VOICE_INTERVIEW_ANSWER_BOUND",
] as const;

export type VoiceInteractionTraceEventCode = (typeof VOICE_INTERACTION_TRACE_EVENTS)[number];
