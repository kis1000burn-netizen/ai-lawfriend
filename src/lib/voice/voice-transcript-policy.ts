/**
 * Voice transcript TTL 및 Phase 5-I 개인정보·보존 코드 SSOT 헬퍼.
 * 런북 문서 · [`VOICE_PRIVACY_RETENTION_RUNBOOK.md`](../../../docs/voice/VOICE_PRIVACY_RETENTION_RUNBOOK.md)
 * TTL 세부 정책 · [`VOICE_TTL_CLEANUP_POLICY.md`](../../../docs/voice/VOICE_TTL_CLEANUP_POLICY.md)
 */

/** Prisma·제품 일치: 원본 오디오는 기본 비저장. */
export const VOICE_ORIGINAL_AUDIO_STORAGE_DEFAULT = false as const;

/** Draft 초안 TTL(시간). */
export const VOICE_TRANSCRIPT_DRAFT_TTL_HOURS_DEFAULT = 72 as const;

/** 초안 문자열 등 transcript 본문을 일반 애플리케이션 로그로 남기지 않음. */
export const VOICE_TRANSCRIPT_BODY_LOGGING_ALLOWED = false as const;

/** 브라우저 TTS 재생을 VoiceInteractionTrace에 넣지 않음(코드 레벨 기대값 명시용). */
export const VOICE_BROWSER_TTS_TRACE_ALLOWED = false as const;

/** 증빙·정적 검증 문자열 마커(Phase 5-I) */
export const VOICE_PHASE_5I_PRIVACY_RETENTION_OPERATIONS_RUNBOOK_LOCK =
  "PHASE5I_VOICE_PRIVACY_RETENTION_OPERATIONS_RUNBOOK_LOCK" as const;

export function computeVoiceTranscriptDraftExpiresAt(
  from: Date = new Date(),
  ttlHours: number = VOICE_TRANSCRIPT_DRAFT_TTL_HOURS_DEFAULT,
): Date {
  return new Date(from.getTime() + ttlHours * 60 * 60 * 1000);
}

/** TTL 등 일괄 정리 후보 상태(`CONFIRMED` 제외). */
export function isVoiceTranscriptDraftCleanupEligible(status: string): boolean {
  return (
    status === "CAPTURED" || status === "NEEDS_CONFIRMATION" || status === "REJECTED"
  );
}

/** 사용자 확정·사건 증거로 보존 우선 상태. TTL 일괄 삭제 제외 대상이다. */
export function isVoiceTranscriptConfirmedRetained(status: string): boolean {
  return status === "CONFIRMED";
}
