/**
 * Phase 5-J — Voice Release Candidate / Predeploy Closure 마커.
 * @see docs/voice/VOICE_RC_LOCK_SUMMARY.md
 */
export const VOICE_RC_LOCK_MARKER_PHASE5J = "phase5j-voice-rc-predeploy-closure" as const;

/** Phase 5-H-UI-3/4 Prisma migration 디렉터리(배포 전 `db:migrate`/`db:deploy` 필수) */
export const VOICE_RC_REQUIRED_MIGRATION_DIRS = [
  "20260524120000_voice_lawyer_review_completion_phase5h_ui3",
  "20260524143000_voice_lawyer_supplement_phase5h_ui4",
] as const;
