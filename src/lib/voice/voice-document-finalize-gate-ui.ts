import type { VoiceReviewBlockReason } from "@/lib/voice/voice-lawyer-review-ux-policy";

/** Phase 5-H-UI-6 — Document Finalize Gate UI 마커 */
export const VOICE_DOCUMENT_FINALIZE_GATE_UI_MARKER_PHASE5H_UI_6 =
  "phase5h-ui-6-voice-document-finalize-gate-ui" as const;

/** 서버 `VoiceDocumentFinalizeBlockedError`·UI 패널 공통 사용자 문구 */
export const VOICE_DOCUMENT_FINALIZE_BLOCK_MESSAGES: Record<VoiceReviewBlockReason, string> = {
  "H-BLOCK-TRANSCRIPT-NOT-CONFIRMED":
    "음성 transcript가 사용자 확인(CONFIRMED) 전입니다. 문서 확정을 할 수 없습니다.",
  "H-BLOCK-MISMATCH-NOT-REVIEWED":
    "확정 transcript와 인터뷰 답변이 일치하지 않습니다. 변호사 음성 검토가 필요합니다.",
  "H-BLOCK-LAWYER-VOICE-REVIEW-REQUIRED":
    "변호사 음성 transcript 검토가 완료되지 않았습니다. 문서 확정을 할 수 없습니다.",
  "H-BLOCK-OPEN-SUPPLEMENT-UNRESOLVED":
    "Voice 검토 보완(Supplement) 요청이 아직 처리되지 않았습니다. 문서 확정을 할 수 없습니다.",
};

const BLOCK_HEADLINES: Record<VoiceReviewBlockReason, string> = {
  "H-BLOCK-TRANSCRIPT-NOT-CONFIRMED": "음성 transcript 미확정",
  "H-BLOCK-MISMATCH-NOT-REVIEWED": "transcript · 인터뷰 답변 불일치",
  "H-BLOCK-LAWYER-VOICE-REVIEW-REQUIRED": "변호사 음성 검토 미완료",
  "H-BLOCK-OPEN-SUPPLEMENT-UNRESOLVED": "Voice 보완(Supplement) 미처리",
};

const BLOCK_ACTIONS: Record<
  VoiceReviewBlockReason,
  { label: string; pathSuffix: "interview" | "supplement" }
> = {
  "H-BLOCK-TRANSCRIPT-NOT-CONFIRMED": {
    label: "AI 인터뷰에서 transcript 확인",
    pathSuffix: "interview",
  },
  "H-BLOCK-MISMATCH-NOT-REVIEWED": {
    label: "AI 인터뷰에서 Voice 검토",
    pathSuffix: "interview",
  },
  "H-BLOCK-LAWYER-VOICE-REVIEW-REQUIRED": {
    label: "AI 인터뷰에서 검토 완료 처리",
    pathSuffix: "interview",
  },
  "H-BLOCK-OPEN-SUPPLEMENT-UNRESOLVED": {
    label: "보완(Supplement) 허브에서 처리",
    pathSuffix: "supplement",
  },
};

export type VoiceDocumentFinalizeGateUiSnapshot = {
  allowed: boolean;
  hasVoiceTranscripts: boolean;
  blockReason: VoiceReviewBlockReason | null;
  questionKey: string | null;
  supplementRequestId: string | null;
  gate: "document finalize";
  headline: string;
  detail: string;
  serverMessage: string | null;
  actionLabel: string | null;
  actionHref: string | null;
};

export function resolveVoiceDocumentFinalizeGateUiSnapshot(input: {
  caseId: string;
  allowed: boolean;
  hasVoiceTranscripts: boolean;
  blockReason: VoiceReviewBlockReason | null;
  questionKey: string | null;
  supplementRequestId?: string | null;
}): VoiceDocumentFinalizeGateUiSnapshot {
  const supplementRequestId = input.supplementRequestId ?? null;

  if (input.allowed) {
    return {
      allowed: true,
      hasVoiceTranscripts: input.hasVoiceTranscripts,
      blockReason: null,
      questionKey: null,
      supplementRequestId: null,
      gate: "document finalize",
      headline: "Voice document finalize gate — 통과",
      detail: input.hasVoiceTranscripts
        ? "음성 transcript·변호사 검토·보완(Supplement) 기준을 충족했습니다. 문서 승인·확정을 진행할 수 있습니다."
        : "이 사건에 Voice transcript gate 대상이 없습니다.",
      serverMessage: null,
      actionLabel: input.hasVoiceTranscripts ? "AI 인터뷰 Voice 검토 패널" : null,
      actionHref: input.hasVoiceTranscripts ? `/cases/${input.caseId}/interview` : null,
    };
  }

  const blockReason = input.blockReason;
  if (!blockReason) {
    return {
      allowed: false,
      hasVoiceTranscripts: input.hasVoiceTranscripts,
      blockReason: null,
      questionKey: input.questionKey,
      supplementRequestId,
      gate: "document finalize",
      headline: "document finalize gate — 차단",
      detail: "문서 확정이 Voice gate에 의해 차단되었습니다.",
      serverMessage: null,
      actionLabel: null,
      actionHref: null,
    };
  }

  const action = BLOCK_ACTIONS[blockReason];
  const metaParts = [
    input.questionKey ? `questionKey: ${input.questionKey}` : null,
    supplementRequestId ? `supplementRequestId: ${supplementRequestId}` : null,
    `gate: document finalize`,
  ].filter(Boolean);

  return {
    allowed: false,
    hasVoiceTranscripts: input.hasVoiceTranscripts,
    blockReason,
    questionKey: input.questionKey,
    supplementRequestId,
    gate: "document finalize",
    headline: `document finalize gate — ${BLOCK_HEADLINES[blockReason]}`,
    detail: [
      VOICE_DOCUMENT_FINALIZE_BLOCK_MESSAGES[blockReason],
      metaParts.length ? `(${metaParts.join(" · ")})` : null,
    ]
      .filter(Boolean)
      .join(" "),
    serverMessage: VOICE_DOCUMENT_FINALIZE_BLOCK_MESSAGES[blockReason],
    actionLabel: action.label,
    actionHref: `/cases/${input.caseId}/${action.pathSuffix}`,
  };
}

/** Voice transcript가 없고 통과인 경우 UI 패널을 숨길지 여부 */
export function shouldShowVoiceDocumentFinalizeGatePanel(
  snapshot: VoiceDocumentFinalizeGateUiSnapshot,
): boolean {
  if (!snapshot.allowed) return true;
  return snapshot.hasVoiceTranscripts;
}
