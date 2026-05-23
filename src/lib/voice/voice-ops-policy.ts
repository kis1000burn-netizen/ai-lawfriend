/**
 * Phase 7-A — Voice 운영 대시보드·개인정보 민원 처리 SSOT.
 * 런북: [`VOICE_PRIVACY_RETENTION_RUNBOOK.md`](../../../docs/voice/VOICE_PRIVACY_RETENTION_RUNBOOK.md) §7.1〜7.3
 */

export const VOICE_PHASE7A_OPS_POLICY_MARKER = "PHASE7A_VOICE_OPS_E2E_HARDENING" as const;

/** Ops API·UI 응답에 transcript 본문(`draftText`)을 포함하지 않음. */
export const VOICE_OPS_TRANSCRIPT_BODY_EXPOSURE_ALLOWED = false as const;

/** CONFIRMED transcript 자동 TTL 삭제 금지(런북 §7.1). */
export const VOICE_OPS_CONFIRMED_AUTO_PURGE_ALLOWED = false as const;

/** 초안 purge 허용 해결 코드. */
export const VOICE_OPS_DRAFT_PURGE_RESOLUTION = "DRAFT_PURGED" as const;

/** CONFIRMED 삭제·정정은 변호사/운영 검토 에스컬레이션만. */
export const VOICE_OPS_CONFIRMED_ESCALATION_RESOLUTION = "ESCALATED_LAWYER_REVIEW" as const;

export const VOICE_PRIVACY_OPS_TERMINAL_STATUSES = ["RESOLVED", "REJECTED"] as const;

export function isVoicePrivacyOpsTerminalStatus(status: string): boolean {
  return (VOICE_PRIVACY_OPS_TERMINAL_STATUSES as readonly string[]).includes(status);
}

export function canVoiceOpsDraftPurgeForTranscriptStatus(transcriptStatus: string): boolean {
  return (
    transcriptStatus === "CAPTURED" ||
    transcriptStatus === "NEEDS_CONFIRMATION" ||
    transcriptStatus === "REJECTED"
  );
}
