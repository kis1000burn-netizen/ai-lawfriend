import type { PublicSafeDocumentGenerationGuardrailTrace } from "@/features/document-generation/document-generation-guardrail-trace";

type GuardrailCheckStatus = "PASSED" | "FAILED" | "SKIPPED";

type WarningMissingField = {
  fieldKey: string;
  label: string;
  severity: "WARNING";
  suggestedQuestions?: string[];
};

export type PublicSafeGuardrailTrace = PublicSafeDocumentGenerationGuardrailTrace;

type DocumentGuardrailTracePanelProps = {
  guardrailTrace?: PublicSafeGuardrailTrace | null;
  title?: string;
  compact?: boolean;
};

function getStatusLabel(status: GuardrailCheckStatus): string {
  switch (status) {
    case "PASSED":
      return "통과";

    case "FAILED":
      return "차단";

    case "SKIPPED":
      return "건너뜀";
  }
}

function getStatusClassName(status: GuardrailCheckStatus): string {
  switch (status) {
    case "PASSED":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";

    case "FAILED":
      return "border-rose-200 bg-rose-50 text-rose-900";

    case "SKIPPED":
      return "border-slate-200 bg-slate-50 text-aibeop-subtle";
  }
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function DocumentGuardrailTracePanel({
  guardrailTrace,
  title = "AI 생성 안전검사 이력",
  compact = false,
}: Readonly<DocumentGuardrailTracePanelProps>) {
  if (!guardrailTrace) {
    return null;
  }

  const hasIssues = guardrailTrace.guardrailIssues.length > 0;
  const hasWarningFields = guardrailTrace.warningMissingFields.length > 0;

  return (
    <section
      aria-label={title}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-aibeop-text">{title}</p>
          <p className="mt-1 text-sm leading-6 text-aibeop-muted">
            승인본 문서가 어떤 AI 생성 정책과 안전검사를 거쳤는지 표시합니다. 내부
            프롬프트, 인터뷰 원문, 첨부 원문, 모델 원문 응답은 표시하지 않습니다.
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClassName(
            guardrailTrace.guardrailCheckStatus,
          )}`}
        >
          {getStatusLabel(guardrailTrace.guardrailCheckStatus)}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-aibeop-subtle">
            생성 정책
          </dt>
          <dd className="mt-1 text-sm font-medium text-aibeop-text">
            {guardrailTrace.generationPolicy}
          </dd>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-aibeop-subtle">
            검사 시각
          </dt>
          <dd className="mt-1 text-sm font-medium text-aibeop-text">
            {formatDateTime(guardrailTrace.checkedAt)}
          </dd>
        </div>
      </dl>

      {!compact && hasWarningFields ? (
        <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            WARNING 보강 항목
          </p>

          <ul className="mt-2 space-y-3">
            {guardrailTrace.warningMissingFields.map((field: WarningMissingField) => (
              <li
                key={field.fieldKey}
                className="rounded-lg bg-white/80 p-3 text-sm text-amber-950"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                    WARNING
                  </span>
                  <span className="font-semibold">{field.label}</span>
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-aibeop-muted">
                    {field.fieldKey}
                  </code>
                </div>

                {field.suggestedQuestions && field.suggestedQuestions.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-aibeop-subtle">
                    {field.suggestedQuestions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!compact && hasIssues ? (
        <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
            감지된 안전검사 이슈
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-950">
            {guardrailTrace.guardrailIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}