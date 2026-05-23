type GuardrailSuggestion = {
  type: string;
  issue: string;
  suggestedQuestions: string[];
};

type DocumentGenerationGuardrailErrorPanelProps = {
  message?: string;
  issues?: string[];
  suggestedQuestions?: string[];
  suggestions?: GuardrailSuggestion[];
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

export function DocumentGenerationGuardrailErrorPanel({
  message,
  issues = [],
  suggestedQuestions = [],
  suggestions = [],
}: Readonly<DocumentGenerationGuardrailErrorPanelProps>) {
  if (!message && issues.length === 0 && suggestedQuestions.length === 0 && suggestions.length === 0) {
    return null;
  }

  const hasStructuredSuggestions = suggestions.length > 0;
  const hasFlatQuestions = suggestedQuestions.length > 0;

  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-rose-950">
          문서 생성이 안전 정책에 의해 중단되었습니다.
        </p>

        <p className="text-sm leading-6 text-rose-900/80">
          {message ??
            "생성 결과에 검증되지 않은 법령·판례·증거 또는 과도한 단정 표현이 포함된 것으로 판단되었습니다."}
        </p>
      </div>

      {issues.length > 0 ? (
        <div className="mt-4 rounded-xl bg-white/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
            감지된 항목
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-950">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasStructuredSuggestions ? (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
            보완 질문 제안
          </p>

          {suggestions.map((suggestion) => (
            <div
              key={`${suggestion.type}-${suggestion.issue}`}
              className="rounded-xl border border-rose-100 bg-white/80 p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-900">
                  {getSuggestionLabel(suggestion.type)}
                </span>

                <p className="text-sm text-rose-950">{suggestion.issue}</p>
              </div>

              {suggestion.suggestedQuestions.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-aibeop-subtle">
                  {suggestion.suggestedQuestions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {!hasStructuredSuggestions && hasFlatQuestions ? (
        <div className="mt-4 rounded-xl bg-white/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
            보완 질문 제안
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-950">
            {suggestedQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-4 text-sm leading-6 text-rose-900/80">
        사건 기록, 인터뷰 답변, 첨부자료 또는 공식서식 trace에 근거가 있는 자료를
        보강한 뒤 다시 생성하십시오.
      </p>
    </section>
  );
}