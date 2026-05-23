"use client";

/**
 * Phase 5-H-UI — 변호사 음성 transcript 검토 패널.
 * @see docs/voice/VOICE_LAWYER_REVIEW_UX_SPEC.md
 * verify markers: H-BLOCK-TRANSCRIPT-NOT-CONFIRMED · H-BLOCK-MISMATCH-NOT-REVIEWED · H-BLOCK-LAWYER-VOICE-REVIEW-REQUIRED
 * Phase 5-H-UI-4: POST /api/cases/:caseId/voice/supplement-questions
 */

import { useEffect, useMemo, useState } from "react";
import { requireOkData } from "@/lib/client/api-error";
import {
  canFinalizeDocumentAfterVoiceReview,
  detectVoiceInterviewAnswerMismatch,
  H_BLOCK_LAWYER_VOICE_REVIEW_REQUIRED,
  H_BLOCK_MISMATCH_NOT_REVIEWED,
  H_BLOCK_OPEN_SUPPLEMENT_UNRESOLVED,
  H_BLOCK_TRANSCRIPT_NOT_CONFIRMED,
  normalizeVoiceReviewText,
  resolveVoiceReviewBlockReason,
  VOICE_LAWYER_REVIEW_PANEL_MARKER_PHASE5H_UI,
  type VoiceReviewBlockReason,
} from "@/lib/voice/voice-lawyer-review-ux-policy";

export { VOICE_LAWYER_REVIEW_PANEL_MARKER_PHASE5H_UI };

export type LawyerVoiceReviewSnapshot = {
  questionKey: string;
  questionLabel: string;
  transcriptStatus: "NONE" | "DRAFT" | "CONFIRMED" | "REJECTED";
  sttDraftText?: string | null;
  confirmedTranscriptText?: string | null;
  interviewAnswer?: unknown;
  lawyerReviewed?: boolean;
};

type Props = {
  caseId: string;
  items: LawyerVoiceReviewSnapshot[];
  /** 읽기 전용(변호사 아님 등) */
  readOnly?: boolean;
};

const BLOCK_REASON_LABELS: Record<VoiceReviewBlockReason, string> = {
  [H_BLOCK_TRANSCRIPT_NOT_CONFIRMED]: "사용자가 transcript를 아직 확정하지 않았습니다.",
  [H_BLOCK_MISMATCH_NOT_REVIEWED]:
    "확정 transcript와 인터뷰 답변이 다릅니다. 변호사 검토가 필요합니다.",
  [H_BLOCK_LAWYER_VOICE_REVIEW_REQUIRED]: "변호사 음성 transcript 검토가 필요합니다.",
  [H_BLOCK_OPEN_SUPPLEMENT_UNRESOLVED]: "Voice 보완(Supplement) 요청이 아직 처리되지 않았습니다.",
};

function statusBadge(status: LawyerVoiceReviewSnapshot["transcriptStatus"]) {
  switch (status) {
    case "NONE":
      return { label: "음성 답변 없음", className: "bg-neutral-100 text-neutral-700" };
    case "DRAFT":
      return { label: "사용자 확인 전", className: "bg-amber-100 text-amber-900" };
    case "CONFIRMED":
      return { label: "확정 transcript", className: "bg-emerald-100 text-emerald-900" };
    case "REJECTED":
      return { label: "거절됨", className: "bg-red-100 text-red-800" };
  }
}

function VoiceReviewQuestionCard({
  caseId,
  item,
  readOnly,
}: {
  caseId: string;
  item: LawyerVoiceReviewSnapshot;
  readOnly: boolean;
}) {
  const [localReviewed, setLocalReviewed] = useState(Boolean(item.lawyerReviewed));
  const [savingReview, setSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [creatingSupplement, setCreatingSupplement] = useState(false);
  const [supplementMessage, setSupplementMessage] = useState<string | null>(null);
  const [supplementError, setSupplementError] = useState<string | null>(null);

  useEffect(() => {
    setLocalReviewed(Boolean(item.lawyerReviewed));
  }, [item.lawyerReviewed, item.questionKey]);
  const badge = statusBadge(item.transcriptStatus);
  const hasVoiceTranscript = item.transcriptStatus !== "NONE";

  const confirmedText =
    item.transcriptStatus === "CONFIRMED"
      ? normalizeVoiceReviewText(item.confirmedTranscriptText ?? item.sttDraftText)
      : "";
  const interviewAnswerText = normalizeVoiceReviewText(item.interviewAnswer);
  const hasMismatch = useMemo(
    () =>
      item.transcriptStatus === "CONFIRMED"
        ? detectVoiceInterviewAnswerMismatch(confirmedText, item.interviewAnswer)
        : false,
    [confirmedText, item.interviewAnswer, item.transcriptStatus],
  );

  const gateInput = useMemo(
    () => ({
      hasVoiceTranscript,
      transcriptConfirmed: item.transcriptStatus === "CONFIRMED",
      lawyerReviewed: localReviewed,
      hasMismatch,
    }),
    [hasVoiceTranscript, hasMismatch, item.transcriptStatus, localReviewed],
  );

  const blockReason = resolveVoiceReviewBlockReason(gateInput);
  const canFinalize = canFinalizeDocumentAfterVoiceReview(gateInput);

  function requestSupplementQuestion() {
    void (async () => {
      setCreatingSupplement(true);
      setSupplementError(null);
      setSupplementMessage(null);
      try {
        const res = await fetch(`/api/cases/${caseId}/voice/supplement-questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionKey: item.questionKey,
            questionLabel: item.questionLabel,
            sendImmediately: true,
          }),
        });
        const raw = await res.json().catch(() => null);
        const payload = requireOkData<{
          supplementHubPath?: string;
          interviewPath?: string;
        }>(res, raw, "보완 질문 생성에 실패했습니다.");
        setSupplementMessage(
          `보완 질문이 생성·발송되었습니다. 보완 허브(${payload.supplementHubPath ?? `/cases/${caseId}/supplement`})에서 의뢰인 응답을 확인하세요.`,
        );
      } catch (e: unknown) {
        setSupplementError(
          e instanceof Error ? e.message : "보완 질문 생성 중 오류가 발생했습니다.",
        );
      } finally {
        setCreatingSupplement(false);
      }
    })();
  }

  function toggleReviewed(next: boolean) {
    void (async () => {
      setSavingReview(true);
      setReviewError(null);
      const previous = localReviewed;
      setLocalReviewed(next);
      try {
        const res = await fetch(`/api/cases/${caseId}/voice/lawyer-reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionKey: item.questionKey, reviewed: next }),
        });
        const raw = await res.json().catch(() => null);
        requireOkData(res, raw, "변호사 검토 완료 상태 저장에 실패했습니다.");
      } catch (e: unknown) {
        setLocalReviewed(previous);
        setReviewError(e instanceof Error ? e.message : "검토 완료 저장 중 오류가 발생했습니다.");
      } finally {
        setSavingReview(false);
      }
    })();
  }

  if (!hasVoiceTranscript) {
    return (
      <article
        className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/80 p-4"
        data-question-key={item.questionKey}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-neutral-800">{item.questionLabel}</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        <p className="mt-2 text-sm text-neutral-600">이 질문에는 음성 transcript가 없습니다.</p>
      </article>
    );
  }

  return (
    <article
      className="rounded-xl border bg-white p-4 shadow-sm"
      data-question-key={item.questionKey}
      data-voice-review-block-reason={blockReason ?? "none"}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-900">{item.questionLabel}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
          {hasMismatch ? (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-900">
              검토 필요
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">STT draft</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-800">
            {normalizeVoiceReviewText(item.sttDraftText) || "—"}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            confirmed transcript
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-900">
            {confirmedText || "—"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Interview answer
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-900">
            {interviewAnswerText || "—"}
          </p>
        </div>
      </div>

      {hasMismatch ? (
        <p className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-950">
          확정 transcript와 인터뷰 답변이 일치하지 않습니다. 변호사 검토 또는 보완 질문이 필요합니다.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={localReviewed}
            disabled={readOnly || savingReview || item.transcriptStatus !== "CONFIRMED"}
            onChange={(e) => toggleReviewed(e.target.checked)}
          />
          검토 완료
        </label>
        {reviewError ? <p className="text-sm text-red-700">{reviewError}</p> : null}
        <button
          type="button"
          disabled={readOnly || creatingSupplement || item.transcriptStatus !== "CONFIRMED"}
          onClick={() => requestSupplementQuestion()}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          data-voice-supplement-trigger="phase5h-ui-4-voice-lawyer-review-supplement"
        >
          {creatingSupplement ? "보완 질문 생성 중…" : "보완 질문"}
        </button>
      </div>

      {supplementMessage ? (
        <p className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-950">
          {supplementMessage}
        </p>
      ) : null}
      {supplementError ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {supplementError}
        </p>
      ) : null}

      {!canFinalize && blockReason ? (
        <div
          className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
          data-document-finalize-gate="blocked"
        >
          <p className="font-semibold">document finalize gate — 차단</p>
          <p className="mt-1">{BLOCK_REASON_LABELS[blockReason]}</p>
          <p className="mt-1 text-xs text-amber-900/80">차단 코드: {blockReason}</p>
        </div>
      ) : hasVoiceTranscript && item.transcriptStatus === "CONFIRMED" ? (
        <p
          className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          data-document-finalize-gate="pass"
        >
          document finalize gate — Voice 검토 기준 통과
        </p>
      ) : null}
    </article>
  );
}

export function LawyerVoiceReviewPanel({
  caseId,
  items,
  readOnly = false,
}: Props) {
  const voiceItems = items.filter((item) => item.transcriptStatus !== "NONE");

  return (
    <section
      className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-sm"
      data-phase5h-ui={VOICE_LAWYER_REVIEW_PANEL_MARKER_PHASE5H_UI}
      data-case-id={caseId}
      aria-label="변호사 음성 transcript 검토"
    >
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold text-indigo-950">변호사 음성 transcript 검토</h2>
        <p className="text-sm text-indigo-900/80">
          STT draft · confirmed transcript · Interview answer를 비교하고, 문서 확정 전 검토 차단
          사유를 확인합니다. (
          <a
            href="/docs/voice/VOICE_LAWYER_REVIEW_UX_SPEC.md"
            className="underline"
            data-voice-lawyer-review-spec-link="VOICE_LAWYER_REVIEW_UX_SPEC.md"
          >
            VOICE_LAWYER_REVIEW_UX_SPEC.md
          </a>
          )
        </p>
      </div>

      {voiceItems.length === 0 ? (
        <p className="rounded-xl border border-dashed border-indigo-200 bg-white/70 p-4 text-sm text-indigo-900">
          이 사건 인터뷰에 연결된 음성 transcript가 없습니다.
        </p>
      ) : (
        <div className="space-y-4">
          {voiceItems.map((item) => (
            <VoiceReviewQuestionCard
              key={item.questionKey}
              caseId={caseId}
              item={item}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </section>
  );
}
