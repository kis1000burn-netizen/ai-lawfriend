/**
 * Phase 5-C — 질문 → TTS 읽어주기 문자열 정책.
 * Phase 5-E — 플레이어·안내 카피(다시 듣기/천천히/예시)·민감 고지 순서 헬퍼.
 * 규격 본문: `docs/voice/VOICE_PROMPT_TTS_SPEC.md`
 */

import type {
  QuestionOption,
  QuestionSetQuestionType,
  VoicePromptSpec,
} from "@/features/question-set/question-set.types";

export const VOICE_PROMPT_SPEC_MARKER_PHASE5_C = "phase5-c-voice-prompt-tts-layer";

/** Phase 5-E — 플레이어·guided UX 레이어 마커(정적 검증·증빙용) */
export const VOICE_PROMPT_SPEC_MARKER_PHASE5_E = "phase5-e-tts-guided-interview-ux";

/** 질문 JSON `voicePrompt` 키 이름(향후 정의 저장 시 SSOT 명칭) */
export const VOICE_PROMPT_PAYLOAD_KEY = "voicePrompt";

export type MinimalQuestionVoiceSource = {
  label: string;
  description?: string | null;
  helpText?: string | null;
};

export type InterviewQuestionVoiceProjection = MinimalQuestionVoiceSource & {
  voicePrompt?: VoicePromptSpec | null;
  type?: QuestionSetQuestionType;
  options?: QuestionOption[];
};

/**
 * §5 — 플레이폼 고정 카피(한국어 초기값). 질문 본문(§4)과 분리 문자열 유지.
 * 키 명은 `VOICE_PROMPT_TTS_SPEC.md` 레이어(id) 명칭에 맞춘다.
 */
export const VOICE_PROMPT_PLATFORM_COPY_KO = {
  replayQuestion: "다시 읽어 드립니다.",
  speakSlowly: "천천히 들려 드립니다.",
  /** exampleHintTemplate — 과도한 구체화 금지, 형식 참고만 */
  exampleHintTemplate:
    "이어서 형식 참고 안내만 드립니다. 구체적인 사실 확인이나 법적 결론이 아닙니다.",
  selectOptionsBrief:
    "보기 목록 중에서 선택하거나, 해당하는 내용을 말씀으로 답할 수 있습니다.",
} as const;

/** §6 기본 접두 민감 고지(카피팀 교체 가능) */
export const VOICE_GUIDED_DEFAULT_SENSITIVE_PREFIX_KO =
  "다음 안내에는 민감할 수 있는 주제가 포함될 수 있습니다. 편한 환경에서 들어 주세요.";

const MAX_HELP_APPEND_CHARS = 500;

/** §4 기본 합성: label + 선택 description/helpText 축약(과장·추측 문자열 포함 금지 — 입력 검증은 상위) */
export function buildDefaultTtsReadAloudText(q: MinimalQuestionVoiceSource): string {
  const base = q.label.trim();
  const extras: string[] = [];

  if (typeof q.description === "string" && q.description.trim().length > 0) {
    extras.push(q.description.trim());
  }
  if (typeof q.helpText === "string" && q.helpText.trim().length > 0) {
    const clipped = clipHelpText(q.helpText.trim());
    extras.push(clipped.length > 0 ? `참고로, ${clipped}` : "");
  }

  const tail = extras.filter(Boolean).join(" ");
  return tail.length > 0 ? `${base} ${tail}` : base;
}

/**
 * 인터뷰 카드 단위 “본 문” TTS(§4). `voicePrompt.readAloudPrimary` 우선, 없으면 기본 합성.
 */
export function buildInterviewPrimaryTtsMainScript(q: InterviewQuestionVoiceProjection): string {
  const vp = q.voicePrompt;
  const explicit = vp?.readAloudPrimary?.trim();
  if (explicit) return explicit;
  let main = buildDefaultTtsReadAloudText({
    label: q.label,
    description: q.description,
    helpText: q.helpText,
  });

  /* SELECT류: 짧게 보기 안내 접미(플랫폼 공통 패턴) */
  const t = q.type;
  if ((t === "SELECT" || t === "MULTI_SELECT") && main.length < 800) {
    const opts = q.options ?? [];
    if (opts.length > 0) {
      const maxLabels = 6;
      const labels = opts
        .slice(0, maxLabels)
        .map((o) => o.label.trim())
        .filter(Boolean);
      const more = opts.length > maxLabels ? ` 외 ${opts.length - maxLabels}항` : "";
      const listed = labels.join(", ");
      if (listed.length > 0) {
        main = `${main} ${VOICE_PROMPT_PLATFORM_COPY_KO.selectOptionsBrief} 보기: ${listed}${more}.`;
      } else {
        main = `${main} ${VOICE_PROMPT_PLATFORM_COPY_KO.selectOptionsBrief}`;
      }
    } else {
      main = `${main} ${VOICE_PROMPT_PLATFORM_COPY_KO.selectOptionsBrief}`;
    }
  }

  return main;
}

/**
 * 민감 표시 필요 시 첫 순서 문자열(null이면 민감 고지 블록 생략).
 */
export function resolveSensitiveSpeechOpeningLine(
  q: InterviewQuestionVoiceProjection,
): string | null {
  if (!q.voicePrompt?.requiresSensitiveSpeechNotice) return null;
  const custom = q.voicePrompt.sensitivePrefix?.trim();
  if (custom && custom.length > 0) return custom;
  return VOICE_GUIDED_DEFAULT_SENSITIVE_PREFIX_KO;
}

/** “예시 듣기” — 본 문과 분리된 보조 문자열만 합치기(판단 금지 톤 고정 카피 + 선택 exampleSentence). */
export function buildExampleListeningScript(q: InterviewQuestionVoiceProjection): string {
  const lead = VOICE_PROMPT_PLATFORM_COPY_KO.exampleHintTemplate;
  const ex = q.voicePrompt?.exampleSentence?.trim();
  if (!ex) return lead;
  return `${lead} 예시 참고 패턴입니다. ${ex}`;
}

function clipHelpText(raw: string): string {
  if (raw.length <= MAX_HELP_APPEND_CHARS) return raw;
  return `${raw.slice(0, MAX_HELP_APPEND_CHARS).trim()}…`;
}
