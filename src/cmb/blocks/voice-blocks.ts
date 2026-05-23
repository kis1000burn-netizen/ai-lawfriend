/** Voice review / finalize gate block IDs — Voice Phase 5-J RC 정렬 */
export const CMB_VOICE_BLOCKS = {
  VOICE_REVIEW: "voice-review",
  VOICE_TRANSCRIPT_CONFIRM: "voice-transcript-confirm",
  VOICE_FINALIZE_GATE: "voice-finalize-gate",
} as const;

export const CMB_VOICE_GATE_MODULE_IDS = {
  STANDARD: "standardVoiceFinalizeGate",
  DISABLED: "voiceGateDisabled",
} as const;
