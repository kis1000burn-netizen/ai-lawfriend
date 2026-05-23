type MissingWarningField = {
  fieldKey: string;
  label: string;
  severity: "WARNING" | "BLOCKING";
  suggestedQuestions?: string[];
};

type DocumentGenerationWarningPanelProps = {
  generationWarnings?: string[];
  missingWarningFields?: MissingWarningField[];
};

export function DocumentGenerationWarningPanel({
  generationWarnings = [],
  missingWarningFields = [],
}: Readonly<DocumentGenerationWarningPanelProps>) {
  const warningFields = missingWarningFields.filter(
    (field) => field.severity === "WARNING",
  );

  if (generationWarnings.length === 0 && warningFields.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-amber-900">
          문서 생성은 완료되었지만, 보강이 필요한 항목이 있습니다.
        </p>

        <p className="text-sm leading-6 text-amber-900/80">
          아래 항목은 문서 생성을 차단하지 않는 WARNING 항목입니다. 본문에는 확정
          사실로 반영하지 않았으며, 확인 후 보완하는 것이 좋습니다.
        </p>
      </div>

      {generationWarnings.length > 0 ? (
        <div className="mt-4 rounded-xl bg-white/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            보강 안내
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-950">
            {generationWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {warningFields.length > 0 ? (
        <div className="mt-4 space-y-3">
          {warningFields.map((field) => (
            <div
              key={field.fieldKey}
              className="rounded-xl border border-amber-100 bg-white/80 p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                  WARNING
                </span>

                <p className="text-sm font-semibold text-aibeop-text">{field.label}</p>

                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-aibeop-muted">
                  {field.fieldKey}
                </code>
              </div>

              {field.suggestedQuestions && field.suggestedQuestions.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-aibeop-muted">보완 질문</p>

                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-aibeop-subtle">
                    {field.suggestedQuestions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}