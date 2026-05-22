"use client";

/**
 * Phase 5-E — Guided interview: 브라우저 TTS(질문 듣기) + Web Speech STT 초안 +
 * Phase 5-D confirm/reject API 연동. 재생 중 녹음 비활성화.
 * 정적 검증 문자열 리터럴: phase5-e-tts-guided-interview-ux (= `VOICE_PROMPT_SPEC_MARKER_PHASE5_E`)
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { requireOkData } from "@/lib/client/api-error";
import {
  MESSAGE_SPEECH_GENERIC_FAIL_KO,
  MESSAGE_TTS_UNAVAILABLE_KO,
  speechRecognitionErrorToUserNotice,
  supportsBrowserSpeechSynthesisGlobal,
  VOICE_PANEL_PHASE5_F_QA_MARKER,
} from "@/lib/voice/interview-voice-guided-messages";
import type { InterviewQuestionVoiceProjection } from "@/lib/voice/voice-prompt-tts-policy";
import {
  buildExampleListeningScript,
  buildInterviewPrimaryTtsMainScript,
  resolveSensitiveSpeechOpeningLine,
  VOICE_PROMPT_PLATFORM_COPY_KO,
  VOICE_PROMPT_SPEC_MARKER_PHASE5_E,
} from "@/lib/voice/voice-prompt-tts-policy";

/** Phase 5-E — 증빙·정적 검증 마커(화면 엔진) */
export const VOICE_PHASE5_E_SCREEN_MARKER = "phase5-e-interview-guided-voice-panel";

/** Web Speech API 레거시·벤더 프리픽스 — TS lib.dom 과 일치하게 최소만 사용 */
interface BrowserSpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  grammars?: unknown;
  onstart: (() => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((ev: unknown) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type Props = {
  caseId: string;
  questionKey: string;
  projection: InterviewQuestionVoiceProjection;
  /** true — 답변·초안·확정 API 차단(TTS 재생만 허용) */
  interactionDisabled: boolean;
  /** STT 초안 확인 후 플로우 갱신 */
  onCommitted: () => void | Promise<void>;
};

function speechResultFirstLine(event: unknown): string {
  const e = event as {
    readonly results?: ArrayLike<ArrayLike<{ readonly transcript?: string } | undefined> | undefined>;
  };
  const chunk = e.results?.[0]?.[0];
  return chunk?.transcript ?? "";
}

/** 정적 문자열 검증 마커(번들링 시 트리쉐이킹 회피) */
export function assertVoicePhase5EMarkersExported() {
  return VOICE_PROMPT_SPEC_MARKER_PHASE5_E && VOICE_PHASE5_E_SCREEN_MARKER;
}

export function supportsBrowserSpeechRecognition(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    SpeechRecognition?: new () => BrowserSpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognitionInstance;
  };
  return typeof (w.SpeechRecognition ?? w.webkitSpeechRecognition) === "function";
}

export function supportsBrowserSpeechSynthesis(): boolean {
  return typeof window !== "undefined" && supportsBrowserSpeechSynthesisGlobal(window);
}

function createRecognition(): BrowserSpeechRecognitionInstance | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => BrowserSpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognitionInstance;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (typeof Ctor !== "function") return null;
  return new Ctor();
}

/** 자유 형식 문항만 STT 초안 카드 허용(선택형·불린은 플레이어로 질문만 안내). */
export function supportsVoiceDraftCaptureForInterviewType(
  type: InterviewQuestionVoiceProjection["type"],
) {
  return type === "TEXT" || type === "TEXTAREA" || type === "NUMBER" || type === "DATE";
}

export function InterviewVoiceGuidedPanel({
  caseId,
  questionKey,
  projection,
  interactionDisabled,
  onCommitted,
}: Props) {
  const manualDraftId = useId();
  const editConfirmId = useId();

  const synthOk = typeof window !== "undefined" && supportsBrowserSpeechSynthesis();
  const recOk = supportsBrowserSpeechRecognition();
  const canCapture = supportsVoiceDraftCaptureForInterviewType(projection.type);

  const mainScript = useMemo(() => buildInterviewPrimaryTtsMainScript(projection), [projection]);
  const sensitiveOpening = useMemo(() => resolveSensitiveSpeechOpeningLine(projection), [projection]);
  const exampleScript = useMemo(() => buildExampleListeningScript(projection), [projection]);
  const showSensitiveBanner = sensitiveOpening !== null;

  const [ttsBusy, setTtsBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);

  type PendingDraft = {
    id: string;
    draftText: string;
    expiresAt: string | null;
  };

  const [pending, setPending] = useState<PendingDraft | null>(null);
  const [editConfirm, setEditConfirm] = useState("");
  const [manualDraft, setManualDraft] = useState("");
  const [submitting, setSubmitting] = useState<"capture" | "confirm" | "reject" | null>(null);

  const recognitionRef = useRef<BrowserSpeechRecognitionInstance | null>(null);

  const endSynthSession = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setTtsBusy(false);
  }, []);

  const abortRecognition = useCallback(() => {
    try {
      recognitionRef.current?.abort();
    } catch {
      /* noop */
    }
    recognitionRef.current = null;
    setListening(false);
  }, []);

  useEffect(() => {
    endSynthSession();
    abortRecognition();
    setPending(null);
    setMicNotice(null);
    setEditConfirm("");
    setManualDraft("");
  }, [questionKey, endSynthSession, abortRecognition]);

  useEffect(() => {
    return () => {
      endSynthSession();
      abortRecognition();
    };
  }, [endSynthSession, abortRecognition]);

  /** Phase 5-F — 탭 전환·뒤로 가기·페이지 이탈 시 재생·녹음 정리(스피커/마이크 점유 해제) */
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const releaseAudioUi = () => {
      endSynthSession();
      abortRecognition();
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        releaseAudioUi();
      }
    };

    window.addEventListener("pagehide", releaseAudioUi);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pagehide", releaseAudioUi);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [endSynthSession, abortRecognition]);

  /** 브라우저 `speechSynthesis` 순차 재생 (`onend` 체인) */
  const speakTexts = useCallback(
    (texts: ReadonlyArray<string>, rate: number) => {
      if (!synthOk) return;
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel();
      const queue = texts.map((t) => t.trim()).filter((t) => t.length > 0);
      if (queue.length === 0) {
        setTtsBusy(false);
        return;
      }

      setTtsBusy(true);

      let index = 0;
      const synth = window.speechSynthesis;

      const drain = () => {
        const next = queue[index];
        if (next === undefined) {
          setTtsBusy(false);
          return;
        }

        const u = new SpeechSynthesisUtterance(next);
        u.lang = "ko-KR";
        u.rate = rate;
        u.onend = () => {
          index += 1;
          drain();
        };
        u.onerror = () => {
          setTtsBusy(false);
        };

        synth.speak(u);
      };

      drain();
    },
    [synthOk],
  );

  const playPrimaryFirstPass = () =>
    speakTexts([sensitiveOpening ?? "", mainScript].filter(Boolean), 1);
  const playReplay = () => speakTexts([VOICE_PROMPT_PLATFORM_COPY_KO.replayQuestion, mainScript], 1);
  const playSlow = () => speakTexts([VOICE_PROMPT_PLATFORM_COPY_KO.speakSlowly, mainScript], 0.76);
  const playExample = () => speakTexts([exampleScript], 1);

  const postSttCaptureRef = useRef<(draft: string) => Promise<void>>(async () => {});

  const postSttCapture = useCallback(
    async (draft: string) => {
      const trimmed = draft.trim();
      if (!trimmed) {
        setMicNotice("초안 문구가 비어 있습니다.");
        return;
      }
      if (interactionDisabled || submitting !== null || pending) {
        if (pending) setMicNotice("먼저 열려 있는 초안 카드를 처리해 주세요.");
        return;
      }

      setSubmitting("capture");
      setMicNotice(null);
      try {
        const res = await fetch(`/api/cases/${caseId}/voice/transcripts/stt-capture`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionKey, sttDraftText: trimmed }),
        });
        const raw = await res.json().catch(() => null);
        const payload = requireOkData<{ transcript: PendingDraft }>(
          res,
          raw,
          "음성 초안 저장에 실패했습니다.",
        );

        const tr = payload.transcript;
        setPending({
          id: tr.id,
          draftText: tr.draftText,
          expiresAt: tr.expiresAt ?? null,
        });
        setEditConfirm(tr.draftText);
      } catch (e: unknown) {
        setMicNotice(e instanceof Error ? e.message : "초안 저장 중 오류가 발생했습니다.");
      } finally {
        setSubmitting(null);
      }
    },
    [caseId, questionKey, interactionDisabled, submitting, pending],
  );

  postSttCaptureRef.current = postSttCapture;

  const startListeningStable = useCallback(() => {
    if (!recOk || !canCapture || interactionDisabled || pending) return;
    if (ttsBusy || listening) return;

    endSynthSession();
    abortRecognition();

    const rec = createRecognition();
    if (!rec) return;
    recognitionRef.current = rec;
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "ko-KR";
    setMicNotice(null);

    rec.onstart = () => setListening(true);
    rec.onerror = (ev: Event) => {
      abortRecognition();
      const mapped = speechRecognitionErrorToUserNotice(ev);
      setMicNotice(mapped ?? MESSAGE_SPEECH_GENERIC_FAIL_KO);
    };
    rec.onend = () => abortRecognition();

    rec.onresult = (event: unknown) => {
      try {
        const first = speechResultFirstLine(event).trim();
        if (!first.length) {
          setMicNotice("입력된 음성이 비어 있습니다. 다시 시도해 주세요.");
          return;
        }
        void postSttCaptureRef.current(first);
      } catch {
        setMicNotice("음성 결과를 처리하지 못했습니다.");
      }
    };

    try {
      rec.start();
    } catch {
      abortRecognition();
      setMicNotice("음성 인식을 시작하지 못했습니다.");
    }
  }, [
    abortRecognition,
    endSynthSession,
    interactionDisabled,
    canCapture,
    recOk,
    ttsBusy,
    listening,
    pending,
  ]);

  const captureActionLocked =
    interactionDisabled || submitting !== null || Boolean(pending);
  const playbackControlsDisabled = listening || submitting !== null || ttsBusy;
  const formLocked = interactionDisabled || submitting !== null;
  /** 녹음 버튼 등 — 질문 TTS 재생 중에는 마이크만 잠금(Phase 5-F 마감 보정). */
  const recordLocked = listening || captureActionLocked || ttsBusy;
  /** 텍스트 초안 — 재생(`ttsBusy`) 중에도 입력·전송 허용. */
  const manualTextDraftLocked = listening || captureActionLocked || formLocked;

  const confirmDraft = async () => {
    if (!pending || formLocked || submitting !== null) return;

    const text = editConfirm.trim();
    const body = pending.draftText.trim() === text ? {} : { confirmedText: text };

    setSubmitting("confirm");
    setMicNotice(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/voice/transcripts/${pending.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "답변 확정에 실패했습니다.");

      setPending(null);
      setEditConfirm("");
      await onCommitted();
    } catch (e: unknown) {
      setMicNotice(e instanceof Error ? e.message : "확정 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(null);
    }
  };

  const rejectDraft = async () => {
    if (!pending || formLocked || submitting !== null) return;

    setSubmitting("reject");
    setMicNotice(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/voice/transcripts/${pending.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "초안 폐기에 실패했습니다.");

      setPending(null);
      setEditConfirm("");
    } catch (e: unknown) {
      setMicNotice(e instanceof Error ? e.message : "폐기 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <section
      className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 shadow-inner"
      aria-label="인터뷰 음성 안내 및 답변 입력"
      data-marker={VOICE_PHASE5_E_SCREEN_MARKER}
      data-phase5-e={VOICE_PROMPT_SPEC_MARKER_PHASE5_E}
      data-phase5-f={VOICE_PANEL_PHASE5_F_QA_MARKER}
    >
      {showSensitiveBanner ? (
        <div
          className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950"
          role="status"
        >
          민감 주제 가능 질문입니다. 「질문 듣기」 시 접두 안내 후 본문이 재생됩니다.
        </div>
      ) : null}

      {!synthOk ? (
        <p className="text-sm text-neutral-700" role="status">
          {MESSAGE_TTS_UNAVAILABLE_KO}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2" role="toolbar" aria-label="질문 음성 재생">
          <button
            type="button"
            className="min-h-[44px] rounded-xl bg-blue-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            disabled={playbackControlsDisabled}
            aria-busy={ttsBusy || undefined}
            aria-label="질문 본문·민감 안내 순서대로 듣기"
            onClick={() => playPrimaryFirstPass()}
          >
            질문 듣기
          </button>
          <button
            type="button"
            className="min-h-[44px] rounded-xl border border-blue-950/30 bg-white px-4 py-3 text-sm font-medium text-blue-950 disabled:opacity-50"
            disabled={playbackControlsDisabled}
            aria-label="동일 속도로 질문 다시 듣기"
            onClick={() => playReplay()}
          >
            다시 듣기
          </button>
          <button
            type="button"
            className="min-h-[44px] rounded-xl border border-blue-950/30 bg-white px-4 py-3 text-sm font-medium text-blue-950 disabled:opacity-50"
            aria-label="느린 속도로 질문 듣기"
            onClick={() => playSlow()}
          >
            천천히 듣기
          </button>
          <button
            type="button"
            className="min-h-[44px] rounded-xl border border-blue-950/30 bg-white px-4 py-3 text-sm font-medium text-blue-950 disabled:opacity-50"
            aria-label="형식 참고 예시 안내만 듣기"
            onClick={() => playExample()}
          >
            예시 듣기
          </button>
          {ttsBusy ? (
            <button
              type="button"
              className="min-h-[44px] rounded-xl border border-neutral-400 bg-white px-4 py-3 text-sm"
              disabled={interactionDisabled || submitting !== null}
              aria-label="음성 재생 즉시 멈춤"
              onClick={() => endSynthSession()}
            >
              재생 멈춤
            </button>
          ) : null}
        </div>
      )}

      {ttsBusy ? (
        <p className="mt-3 text-xs text-neutral-700" aria-live="polite">
          질문이 재생 중입니다. 「말해서 답하기」는 재생 종료 또는 멈춤 후 이용해 주세요. 아래에서는 텍스트로 초안 작성·전송이
          가능합니다.
        </p>
      ) : null}

      {!canCapture ? (
        <p className="mt-3 text-sm text-neutral-700 md:max-w-prose">
          이 질문은 선택·예/아니오 형식입니다. 음성 버튼은 질문만 안내합니다. 실제 선택은 아래 입력으로 해 주세요.
        </p>
      ) : interactionDisabled ? (
        <p className="mt-3 text-sm text-neutral-600 md:max-w-prose">
          읽기 전용에서는 질문 듣기만 사용할 수 있습니다. 답변 입력·음성 초안은 비활성화되어 있습니다.
        </p>
      ) : (
        <div role="group" aria-label="답변 음성·텍스트 초안">
          {!recOk ? (
            <p className="mt-3 text-sm text-amber-900" role="status">
              브라우저 음성 인식(Web Speech Recognition)을 쓸 수 없습니다. 말할 내용을 적은 뒤 「텍스트로 초안 만들기」로
              초안 카드로 넘기세요.
            </p>
          ) : (
            <p className="mt-3 text-sm text-neutral-700 md:max-w-prose">
              질문 재생 중에는 「말해서 답하기」가 꺼집니다.
            </p>
          )}

          <div className="mt-3 space-y-2">
            <label
              htmlFor={manualDraftId}
              className="block text-xs font-semibold uppercase tracking-wide text-neutral-700"
            >
              STT 없이 초안 보내기(직접 입력·선택)
            </label>
            <textarea
              id={manualDraftId}
              className="min-h-[88px] w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-base leading-relaxed text-neutral-900 md:text-sm"
              disabled={manualTextDraftLocked}
              value={manualDraft}
              placeholder="예: 사건 내용 요약 또는 날짜·금액"
              aria-describedby={recOk ? undefined : `${manualDraftId}-mic-fallback`}
              onChange={(ev) => setManualDraft(ev.target.value)}
            />
            {!recOk ? (
              <p id={`${manualDraftId}-mic-fallback`} className="text-xs text-neutral-600 md:max-w-prose">
                음성 인식이 불가할 때 기본 입력 경로입니다. 키보드만으로도 작성 가능합니다.
              </p>
            ) : null}
            <button
              type="button"
              disabled={manualTextDraftLocked}
              className="min-h-[44px] w-full rounded-xl bg-blue-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
              aria-label="입력 내용으로 음성 초안 만들기 요청 전송"
              onClick={() => void postSttCapture(manualDraft)}
            >
              {submitting === "capture" ? "초안 전송 중…" : "텍스트로 초안 만들기"}
            </button>
          </div>

          {recOk ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={`min-h-[44px] rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50 ${
                  listening ? "bg-amber-600 text-white" : "bg-neutral-900 text-white"
                }`}
                aria-busy={listening || undefined}
                aria-pressed={listening}
                disabled={recordLocked}
                aria-label="마이크로 말해서 답변 텍스트 인식 시작"
                onClick={() => startListeningStable()}
              >
                말해서 답하기
              </button>
              <button
                type="button"
                className="min-h-[44px] rounded-xl border border-neutral-900 bg-white px-4 py-3 text-sm font-medium disabled:opacity-50"
                disabled={interactionDisabled || submitting !== null || !listening}
                aria-label="음성 인식 세션 취소"
                onClick={() => abortRecognition()}
              >
                녹음 취소
              </button>
            </div>
          ) : null}
        </div>
      )}

      {micNotice ? (
        <p className="mt-3 text-sm text-red-700" aria-live="assertive">
          {micNotice}
        </p>
      ) : null}

      {pending && !interactionDisabled ? (
        <div
          className="mt-4 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm"
          aria-live="polite"
          role="region"
          aria-label="음성 초안 확인 및 저장"
        >
          <h4 className="text-sm font-semibold text-blue-950">음성·텍스트 초안 확인</h4>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600 md:max-w-prose">
            아래 문자열은 아직 인터뷰 최종 답변으로 확정되지 않았습니다. 「이 문구로 답변 저장」을 누르기 전까지 서버 저장 경로 및
            Voice trace는 Phase 5-D 규격을 따릅니다.
            {pending.expiresAt ? ` 초안 TTL 기준 만료 예정: ${pending.expiresAt}` : ""}
          </p>
          <label htmlFor={editConfirmId} className="sr-only">
            확정 전 편집 가능한 초안 문자열
          </label>
          <textarea
            id={editConfirmId}
            className="mt-3 min-h-[100px] w-full rounded-xl border px-3 py-2 text-sm disabled:opacity-60"
            disabled={formLocked || submitting !== null}
            value={editConfirm}
            onChange={(ev) => setEditConfirm(ev.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-[44px] rounded-xl bg-blue-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              disabled={formLocked || submitting !== null}
              aria-label="편집한 초안 문자열을 인터뷰 최종 답변으로 저장"
              onClick={() => void confirmDraft()}
            >
              {submitting === "confirm" ? "저장 중…" : "이 문구로 답변 저장"}
            </button>
            <button
              type="button"
              className="min-h-[44px] rounded-xl border px-4 py-3 text-sm font-medium disabled:opacity-50"
              disabled={formLocked || submitting !== null}
              aria-label="초안 폐기·인터뷰 답변은 변경 안 함"
              onClick={() => void rejectDraft()}
            >
              {submitting === "reject" ? "처리 중…" : "초안 폐기"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
