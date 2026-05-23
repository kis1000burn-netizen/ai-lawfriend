"use client";
/* 답변 저장은 `POST /api/cases/:id/interview` — 서버 `saveInterviewAnswerBodySchema`·`.strict()`([Batch B]). */
/* B-G1: `POST /api/cases/:id/interview/complete` — 상세와 동일 `getAllowedCaseActions.COMPLETE_INTERVIEW`일 때만 CTA. */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { requireOkData } from "@/lib/client/api-error";
import { InterviewVoiceGuidedPanel } from "@/components/cases/interview-voice-guided-panel";
import {
  LawyerVoiceReviewPanel,
  type LawyerVoiceReviewSnapshot,
} from "@/components/cases/lawyer-voice-review-panel";
import { buildLawyerVoiceReviewSnapshots } from "@/lib/voice/voice-lawyer-review-snapshot";
import type { VoiceTranscriptRowSnapshot } from "@/lib/voice/voice-lawyer-review-snapshot";
import type { VoicePromptSpec } from "@/features/question-set/question-set.types";

type QuestionOption = {
  label: string;
  value: string;
};

type Question = {
  id: string;
  key: string;
  label: string;
  description?: string | null;
  type:
    | "TEXT"
    | "TEXTAREA"
    | "NUMBER"
    | "DATE"
    | "SELECT"
    | "MULTI_SELECT"
    | "BOOLEAN";
  required: boolean;
  order: number;
  options?: QuestionOption[];
  helpText?: string | null;
  voicePrompt?: VoicePromptSpec | null;
  isVisible: boolean;
  isAnswered: boolean;
};

type InterviewFlowResponse = {
  questionSetId: string;
  questionSetName: string;
  questions: Question[];
  visibleQuestions: Question[];
  answers: Record<string, unknown>;
  nextQuestionKey: string | null;
  progress: {
    totalVisible: number;
    answeredVisible: number;
    percent: number;
  };
};

type Props = {
  caseId: string;
  initialFlow?: InterviewFlowResponse;
  /** 사건 종결·반려·삭제 시 답변 수정 불가(표시·클라이언트만) */
  caseStatus?: string;
  /**
   * 서버 `getCaseAccessContext` + `canPerformCaseInterview`와 동일.
   * (안 A: OWNER / ADMIN / ASSIGNED_LAWYER / ASSIGNED_STAFF일 때 true)
   */
  canEditInterview?: boolean;
  /** 서버 `getAllowedCaseActions`·`COMPLETE_INTERVIEW` — 사건 상세 액션 패널과 동일 조건 */
  showCompleteInterviewCta?: boolean;
  /** Phase 5-H-UI: 변호사·운영 역할에서 음성 transcript 검토 패널 표시 */
  showLawyerVoiceReviewPanel?: boolean;
  /** Phase 5-H-UI: 서버에서 전달한 VoiceTranscript 스냅샷(질문 키별 최신) */
  voiceTranscriptRows?: VoiceTranscriptRowSnapshot[];
  /** Phase 5-H-UI-3: 질문 키별 변호사 검토 완료 플래그 */
  lawyerReviewFlags?: Record<string, boolean>;
};

function renderInputValue(value: unknown, type: Question["type"]) {
  if (type === "MULTI_SELECT") return Array.isArray(value) ? value : [];
  if (type === "BOOLEAN") return typeof value === "boolean" ? value : null;
  return value ?? "";
}

export default function CaseInterviewClient({
  caseId,
  initialFlow,
  caseStatus,
  canEditInterview = true,
  showCompleteInterviewCta = false,
  showLawyerVoiceReviewPanel = false,
  voiceTranscriptRows = [],
  lawyerReviewFlags = {},
}: Props) {
  const router = useRouter();
  const isTerminalCase =
    caseStatus === "CLOSED" || caseStatus === "REJECTED" || caseStatus === "DELETED";
  /** 권한 없음·종결·반려·삭제 중 하나라면 읽기 전용 (service `assert`와 화면 일치) */
  const interviewReadOnly = !canEditInterview || isTerminalCase;

  const [flow, setFlow] = useState<InterviewFlowResponse | null>(initialFlow ?? null);
  const [drafts, setDrafts] = useState<Record<string, unknown>>(initialFlow?.answers ?? {});
  const [loading, setLoading] = useState(!initialFlow);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [completingInterview, setCompletingInterview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlow = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/cases/${caseId}/interview`, { cache: "no-store" });
      const raw = await res.json().catch(() => null);
      const flowPayload = requireOkData<InterviewFlowResponse>(
        res,
        raw,
        "인터뷰 조회에 실패했습니다.",
      );

      setFlow(flowPayload);
      setDrafts(flowPayload.answers ?? {});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    if (!initialFlow) {
      void fetchFlow();
    }
  }, [caseId, initialFlow, fetchFlow]);

  const visibleQuestions = useMemo(() => flow?.visibleQuestions ?? [], [flow]);

  const lawyerVoiceReviewItems = useMemo((): LawyerVoiceReviewSnapshot[] => {
    if (!flow || !showLawyerVoiceReviewPanel) return [];
    const labels = Object.fromEntries(flow.questions.map((q) => [q.key, q.label]));
    return buildLawyerVoiceReviewSnapshots({
      transcripts: voiceTranscriptRows,
      answers: flow.answers ?? {},
      questionLabels: labels,
      lawyerReviewedByQuestionKey: lawyerReviewFlags,
    }).filter((item) => item.transcriptStatus !== "NONE");
  }, [flow, lawyerReviewFlags, showLawyerVoiceReviewPanel, voiceTranscriptRows]);

  const handleCompleteInterview = useCallback(async () => {
    setCompletingInterview(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/interview/complete`, {
        method: "POST",
      });
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "인터뷰 완료 처리에 실패했습니다.");
      router.push(`/cases/${caseId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "인터뷰 완료 처리 중 오류가 발생했습니다.");
    } finally {
      setCompletingInterview(false);
    }
  }, [caseId, router]);

  async function saveAnswer(questionKey: string, value: unknown) {
    setSavingKey(questionKey);
    setError(null);

    try {
      const res = await fetch(`/api/cases/${caseId}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionKey, value }),
      });

      const raw = await res.json().catch(() => null);
      const payload = requireOkData<{ saved?: boolean; flow?: InterviewFlowResponse }>(
        res,
        raw,
        "답변 저장에 실패했습니다.",
      );

      if (payload.flow) {
        setFlow(payload.flow);
        setDrafts(payload.flow.answers ?? {});
      }

      const nextKey = payload.flow?.nextQuestionKey;
      if (nextKey) {
        requestAnimationFrame(() => {
          const target = document.getElementById(`question-${nextKey}`);
          target?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "답변 저장 중 오류가 발생했습니다.");
    } finally {
      setSavingKey(null);
    }
  }

  function updateDraft(questionKey: string, value: unknown) {
    setDrafts((prev) => ({
      ...prev,
      [questionKey]: value,
    }));
  }

  if (loading) {
    return (
      <div className="rounded-xl border p-6 text-sm text-neutral-600">
        인터뷰 흐름을 불러오는 중입니다...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
    );
  }

  if (!flow) {
    return (
      <div className="rounded-xl border p-6 text-sm text-neutral-600">표시할 인터뷰가 없습니다.</div>
    );
  }

  return (
    <div className="space-y-6">
      {interviewReadOnly ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          {!canEditInterview
            ? "현재 권한으로는 인터뷰 답변을 수정할 수 없습니다. 내용은 확인만 가능합니다."
            : "종결·반려·삭제된 사건은 인터뷰 답변을 수정할 수 없습니다. 내용은 확인만 가능합니다."}
        </div>
      ) : null}

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{flow.questionSetName}</h2>
          <span className="text-sm text-neutral-500">
            {flow.progress.answeredVisible}/{flow.progress.totalVisible}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-black transition-all"
            style={{ width: `${flow.progress.percent}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-neutral-500">
          현재 표시되는 질문 기준 진행률 {flow.progress.percent}%
        </p>
      </section>

      {visibleQuestions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/80 p-6 text-sm text-neutral-600">
          현재 표시할 질문이 없습니다. 질문셋 구성·가시성 조건이 충족되면 여기에 나타납니다.
        </div>
      ) : null}

      <section className="space-y-4">
        {visibleQuestions.map((question) => {
          const value = renderInputValue(drafts[question.key], question.type);
          const isSaving = savingKey === question.key;

          return (
            <article
              key={question.key}
              id={`question-${question.key}`}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="mb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{question.label}</h3>
                    {question.description ? (
                      <p className="mt-1 text-sm text-neutral-500">{question.description}</p>
                    ) : null}
                  </div>
                  {question.required ? (
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
                      필수
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mb-5">
                <InterviewVoiceGuidedPanel
                  caseId={caseId}
                  questionKey={question.key}
                  interactionDisabled={interviewReadOnly}
                  projection={{
                    label: question.label,
                    description: question.description ?? null,
                    helpText: question.helpText ?? null,
                    voicePrompt: question.voicePrompt ?? null,
                    type: question.type,
                    options: question.options,
                  }}
                  onCommitted={() => void fetchFlow()}
                />
              </div>

              {question.type === "TEXT" && (
                <input
                  className="w-full rounded-xl border px-3 py-2 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-80"
                  disabled={interviewReadOnly}
                  value={String(value)}
                  onChange={(e) => updateDraft(question.key, e.target.value)}
                />
              )}

              {question.type === "TEXTAREA" && (
                <textarea
                  className="min-h-[120px] w-full rounded-xl border px-3 py-2 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-80"
                  disabled={interviewReadOnly}
                  value={String(value)}
                  onChange={(e) => updateDraft(question.key, e.target.value)}
                />
              )}

              {question.type === "NUMBER" && (
                <input
                  type="number"
                  className="w-full rounded-xl border px-3 py-2 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-80"
                  disabled={interviewReadOnly}
                  value={value === "" || value === null ? "" : Number(value)}
                  onChange={(e) =>
                    updateDraft(question.key, e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              )}

              {question.type === "DATE" && (
                <input
                  type="date"
                  className="w-full rounded-xl border px-3 py-2 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-80"
                  disabled={interviewReadOnly}
                  value={String(value)}
                  onChange={(e) => updateDraft(question.key, e.target.value)}
                />
              )}

              {question.type === "SELECT" && (
                <select
                  className="w-full rounded-xl border px-3 py-2 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-80"
                  disabled={interviewReadOnly}
                  value={String(value)}
                  onChange={(e) => updateDraft(question.key, e.target.value)}
                >
                  <option value="">선택하세요</option>
                  {(question.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {question.type === "MULTI_SELECT" && (
                <div className="space-y-2">
                  {(question.options ?? []).map((option) => {
                    const checked = Array.isArray(value) ? value.includes(option.value) : false;
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 text-sm ${
                          interviewReadOnly ? "cursor-not-allowed opacity-80" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={interviewReadOnly}
                          checked={checked}
                          onChange={(e) => {
                            const current = Array.isArray(value) ? value : [];
                            const next = e.target.checked
                              ? [...current, option.value]
                              : current.filter((v) => v !== option.value);
                            updateDraft(question.key, next);
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {question.type === "BOOLEAN" && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={interviewReadOnly}
                    className={`rounded-xl border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 ${value === true ? "bg-black text-white" : "bg-white"}`}
                    onClick={() => updateDraft(question.key, true)}
                  >
                    예
                  </button>
                  <button
                    type="button"
                    disabled={interviewReadOnly}
                    className={`rounded-xl border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 ${value === false ? "bg-black text-white" : "bg-white"}`}
                    onClick={() => updateDraft(question.key, false)}
                  >
                    아니오
                  </button>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  disabled={isSaving || interviewReadOnly}
                  onClick={() => void saveAnswer(question.key, drafts[question.key] ?? null)}
                  className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "저장 중..." : "답변 저장"}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {showLawyerVoiceReviewPanel ? (
        <LawyerVoiceReviewPanel caseId={caseId} items={lawyerVoiceReviewItems} readOnly={interviewReadOnly} />
      ) : null}

      {showCompleteInterviewCta && !interviewReadOnly && flow ? (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">인터뷰 완료</h2>
          <p className="mt-2 text-sm text-slate-600">
            필수 항목을 저장한 뒤 아래를 누르면 인터뷰가 완료되고, <strong>사건 상세</strong> 화면으로
            이동합니다. 상세에서 갱신된 사건 상태·다음 단계를 확인할 수 있습니다.
          </p>
          <button
            type="button"
            disabled={completingInterview}
            onClick={() => void handleCompleteInterview()}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {completingInterview ? "완료 처리 중…" : "인터뷰 완료하고 사건 상세로 이동"}
          </button>
        </section>
      ) : null}
    </div>
  );
}
