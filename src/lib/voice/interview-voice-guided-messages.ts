/**
 * Phase 5-F — 패널용 사용자 노출 카피·Web Speech 에러 매핑(단위 테스트 가능).
 */

/** 증빙·정적 검증 문자열 마커 */
export const VOICE_PANEL_PHASE5_F_QA_MARKER = "phase5-f-voice-qa-accessibility-smoke";

/** 브라우저에 `speechSynthesis` 또는 `SpeechSynthesisUtterance`가 없을 때(TTS 기능 비활성) */
export const MESSAGE_TTS_UNAVAILABLE_KO =
  "이 브라우저나 환경에서는 음성 합성(Web Speech synthesis)을 쓸 수 없습니다. 아래처럼 질문 문구와 답변을 텍스트로 진행할 수 있습니다.";

/** 마이크 권한 거부 또는 보안 컨텍스트에서 시작 불가 */
export const MESSAGE_MIC_PERMISSION_DENIED_KO =
  "마이크 권한이 거부되어 음성 인식을 시작할 수 없습니다. 브라우저 주소 표시줄의 권한 설정에서 마이크를 허용하거나, 아래 입력란에 내용을 적어 「텍스트로 초안 만들기」를 사용해 주세요.";

export const MESSAGE_SPEECH_GENERIC_FAIL_KO =
  "음성 인식을 사용할 수 없습니다. 브라우저·네트워크를 확인하거나 아래 입력란으로 초안을 보내 주세요.";

/** `SpeechSynthesisUtterance` + `speechSynthesis.speak` 모두 있을 때만 true (SSR/구형 환경 제외) */
export function supportsBrowserSpeechSynthesisGlobal(win: Window | undefined): boolean {
  if (!win) return false;
  if (typeof win.speechSynthesis === "undefined") return false;
  if (typeof SpeechSynthesisUtterance === "undefined") return false;
  return typeof win.speechSynthesis.speak === "function";
}

/**
 * SpeechRecognition `error` 이벤트 — 브라우저마다 문자열 명칭이 다름.
 * @returns 사용자 안내 문자열 또는 알 수 없을 때 undefined
 */
export function speechRecognitionErrorToUserNotice(event: unknown): string | undefined {
  const typed = event as { error?: string } | undefined;
  const raw = typed?.error;
  if (!raw) return undefined;
  switch (raw) {
    case "not-allowed":
    case "service-not-allowed":
      return MESSAGE_MIC_PERMISSION_DENIED_KO;
    case "aborted":
      return undefined;
    default:
      return undefined;
  }
}
