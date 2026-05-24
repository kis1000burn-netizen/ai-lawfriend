/**
 * Phase 5-H Lawyer Voice Review UX — 기준 명세·document finalize gate 정책.
 * @see docs/voice/VOICE_LAWYER_REVIEW_UX_SPEC.md
 */

/** 번들링·트레이싱 회피용 화면/정책 마커 */
export const VOICE_LAWYER_REVIEW_UX_SPEC_MARKER_PHASE5H = "phase5h-lawyer-voice-review-ux-spec" as const;

/** Phase 5-H-UI 패널 정적 검증 마커 */
export const VOICE_LAWYER_REVIEW_PANEL_MARKER_PHASE5H_UI =
  "phase5h-ui-lawyer-voice-review-panel" as const;

/** 증빙 ID 문자열(SSOT 문자열 포함 확인용 · 실제 헤더는 Markdown) */
export const VOICE_PHASE5H_IMPLEMENTATION_EVIDENCE_ID =
  "EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-LAWYER-VOICE-REVIEW-UX-SPEC" as const;

/** document finalize gate — transcript 미확정 */
export const H_BLOCK_TRANSCRIPT_NOT_CONFIRMED = "H-BLOCK-TRANSCRIPT-NOT-CONFIRMED" as const;

/** document finalize gate — mismatch + 변호사 미검토 */
export const H_BLOCK_MISMATCH_NOT_REVIEWED = "H-BLOCK-MISMATCH-NOT-REVIEWED" as const;

/** document finalize gate — 변호사 음성 검토 미완료 */
export const H_BLOCK_LAWYER_VOICE_REVIEW_REQUIRED = "H-BLOCK-LAWYER-VOICE-REVIEW-REQUIRED" as const;

/** document finalize gate — Voice-origin Supplement 미처리 (명세 H-BLOCK-02) */
export const H_BLOCK_OPEN_SUPPLEMENT_UNRESOLVED = "H-BLOCK-OPEN-SUPPLEMENT-UNRESOLVED" as const;

export type VoiceReviewBlockReason =
  | typeof H_BLOCK_TRANSCRIPT_NOT_CONFIRMED
  | typeof H_BLOCK_MISMATCH_NOT_REVIEWED
  | typeof H_BLOCK_LAWYER_VOICE_REVIEW_REQUIRED
  | typeof H_BLOCK_OPEN_SUPPLEMENT_UNRESOLVED;

export type VoiceReviewGateInput = {
  hasVoiceTranscript: boolean;
  transcriptConfirmed: boolean;
  lawyerReviewed: boolean;
  hasMismatch: boolean;
};

export function normalizeVoiceReviewText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (Array.isArray(value)) return value.map((v) => String(v)).join(", ").trim();
  return String(value).trim();
}

/** confirmed transcript vs Interview answer 불일치 여부 */
export function detectVoiceInterviewAnswerMismatch(
  confirmedTranscript: string | null | undefined,
  interviewAnswer: unknown,
): boolean {
  const left = normalizeVoiceReviewText(confirmedTranscript);
  const right = normalizeVoiceReviewText(interviewAnswer);
  if (!left && !right) return false;
  return left !== right;
}

/** document finalize gate 차단 사유(없으면 null = 통과) */
export function resolveVoiceReviewBlockReason(input: VoiceReviewGateInput): VoiceReviewBlockReason | null {
  if (!input.hasVoiceTranscript) return null;

  if (!input.transcriptConfirmed) {
    return H_BLOCK_TRANSCRIPT_NOT_CONFIRMED;
  }

  if (input.hasMismatch && !input.lawyerReviewed) {
    return H_BLOCK_MISMATCH_NOT_REVIEWED;
  }

  if (!input.lawyerReviewed) {
    return H_BLOCK_LAWYER_VOICE_REVIEW_REQUIRED;
  }

  return null;
}

/** Voice transcript 검토 게이트 통과 시 문서 확정 가능 */
export function canFinalizeDocumentAfterVoiceReview(input: VoiceReviewGateInput): boolean {
  return resolveVoiceReviewBlockReason(input) === null;
}
