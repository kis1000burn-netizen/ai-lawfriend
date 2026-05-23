"use client";

import { useEffect, useMemo, useState } from "react";

export type GuardrailSuggestion = {
  type: string;
  issue: string;
  suggestedQuestions: string[];
};

export type GuardrailTraceCandidate = {
  generationPolicy: string;
  guardrailCheckStatus: "PASSED" | "FAILED" | "SKIPPED";
  guardrailIssues: string[];
  warningMissingFields: Array<{
    fieldKey: string;
    label: string;
    severity: "WARNING";
    suggestedQuestions: string[];
  }>;
  checkedAt: string;
};

export type SupplementRequestDraft = {
  title: string;
  reason: string;
  questions: string[];
  guardrailTrace?: GuardrailTraceCandidate | null;
};

type DocumentGenerationSupplementRequestPanelProps = {
  suggestions?: GuardrailSuggestion[];
  suggestedQuestions?: string[];
  guardrailTrace?: GuardrailTraceCandidate | null;
  isSubmitting?: boolean;
  onCreateSupplementRequest?: (draft: SupplementRequestDraft) => Promise<void> | void;
};

function getSuggestionLabel(type: string): string {
  switch (type) {
    case "CASE_LAW_REFERENCE":
      return "판례 근거 보완";
    case "LEGAL_ARTICLE_REFERENCE":
      return "법령 조문 근거 보완";
    case "OVERCONFIDENT_ASSERTION":
      return "사실관계·증거 보완";
    default:
      return "자료 보완";
  }
}

function buildUniqueQuestions(input: {
  suggestions: GuardrailSuggestion[];
  suggestedQuestions: string[];
}): string[] {
  const questions = [
    ...input.suggestions.flatMap((suggestion) => suggestion.suggestedQuestions),
    ...input.suggestedQuestions,
  ];

  return Array.from(
    new Set(
      questions.map((question) => question.trim()).filter((question) => question.length > 0),
    ),
  );
}

function buildDefaultTitle(guardrailTrace?: GuardrailTraceCandidate | null): string {
  if (guardrailTrace?.generationPolicy) {
    return `AI 문서 생성 보완 요청 - ${guardrailTrace.generationPolicy}`;
  }

  return "AI 문서 생성 보완 요청";
}

function buildDefaultReason(suggestions: GuardrailSuggestion[]): string {
  if (suggestions.length === 0) {
    return "AI 문서 생성 안전검사에서 보완이 필요한 항목이 확인되었습니다.";
  }

  const labels = Array.from(
    new Set(suggestions.map((suggestion) => getSuggestionLabel(suggestion.type))),
  );

  return `AI 문서 생성 안전검사에서 ${labels.join(", ")} 항목 보완이 필요합니다.`;
}

export function DocumentGenerationSupplementRequestPanel({
  suggestions = [],
  suggestedQuestions = [],
  guardrailTrace = null,
  isSubmitting = false,
  onCreateSupplementRequest,
}: Readonly<DocumentGenerationSupplementRequestPanelProps>) {
  const questions = useMemo(
    () => buildUniqueQuestions({ suggestions, suggestedQuestions }),
    [suggestions, suggestedQuestions],
  );
  const defaultTitle = useMemo(() => buildDefaultTitle(guardrailTrace), [guardrailTrace]);
  const defaultReason = useMemo(() => buildDefaultReason(suggestions), [suggestions]);

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(questions);
  const [title, setTitle] = useState(defaultTitle);
  const [reason, setReason] = useState(defaultReason);

  useEffect(() => {
    setSelectedQuestions(questions);
  }, [questions]);

  useEffect(() => {
    setTitle(defaultTitle);
  }, [defaultTitle]);

  useEffect(() => {
    setReason(defaultReason);
  }, [defaultReason]);

  if (questions.length === 0 && suggestions.length === 0 && !guardrailTrace) {
    return null;
  }

  const selectedQuestionSet = new Set(selectedQuestions);

  function toggleQuestion(question: string) {
    setSelectedQuestions((current) =>
      current.includes(question)
        ? current.filter((item) => item !== question)
        : [...current, question],
    );
  }

  function selectAllQuestions() {
    setSelectedQuestions(questions);
  }

  function clearQuestions() {
    setSelectedQuestions([]);
  }

  async function handleCreateSupplementRequest() {
    if (!onCreateSupplementRequest || selectedQuestions.length === 0) {
      return;
    }

    await onCreateSupplementRequest({
      title: title.trim() || "AI 문서 생성 보완 요청",
      reason:
        reason.trim() ||
        "AI 문서 생성 안전검사에서 보완이 필요한 항목이 확인되었습니다.",
      questions: selectedQuestions,
      guardrailTrace,
    });
  }

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-indigo-950">보완 요청 초안</p>

        <p className="text-sm leading-6 text-indigo-900/80">
          안전 정책으로 문서 생성이 중단되었습니다. 아래 질문 중 필요한 항목을 선택하여
          의뢰인 보완 요청 또는 인터뷰 추가 질문으로 전환할 수 있습니다.
        </p>
      </div>

      {suggestions.length > 0 ? (
        <div className="mt-4 space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={`${suggestion.type}-${suggestion.issue}`}
              className="rounded-xl border border-indigo-100 bg-white/80 p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-900">
                  {getSuggestionLabel(suggestion.type)}
                </span>
                <p className="text-sm text-aibeop-subtle">{suggestion.issue}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        <div className="grid gap-1">
          <label htmlFor="supplement-request-title" className="text-xs font-semibold text-aibeop-muted">
            보완 요청 제목
          </label>
          <input
            id="supplement-request-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="supplement-request-reason" className="text-xs font-semibold text-aibeop-muted">
            보완 요청 사유
          </label>
          <textarea
            id="supplement-request-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      {questions.length > 0 ? (
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-800">
              선택할 보완 질문
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllQuestions}
                className="rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-800"
              >
                전체 선택
              </button>

              <button
                type="button"
                onClick={clearQuestions}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-aibeop-muted"
              >
                선택 해제
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {questions.map((question, index) => {
              const checkboxId = `supplement-question-${index}`;

              return (
                <label
                  key={question}
                  htmlFor={checkboxId}
                  className="flex gap-3 rounded-xl border border-indigo-100 bg-white/80 p-3 text-sm text-aibeop-subtle"
                >
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={selectedQuestionSet.has(question)}
                    onChange={() => toggleQuestion(question)}
                    className="mt-1"
                  />
                  <span>{question}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCreateSupplementRequest}
          disabled={!onCreateSupplementRequest || selectedQuestions.length === 0 || isSubmitting}
          className="rounded-xl bg-indigo-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "보완 요청 생성 중..." : "보완 요청 생성"}
        </button>

        <p className="text-xs text-aibeop-subtle">
          선택한 질문은 보완 요청 초안으로 저장되며, 문서는 아직 생성되지 않은 상태로 유지됩니다.
        </p>
      </div>
    </section>
  );
}