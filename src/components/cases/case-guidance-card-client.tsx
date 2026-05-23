import type { CaseGuidanceCardModel } from "@/features/case-guidance/case-guidance.types";

type Props = { model: CaseGuidanceCardModel };

function SectionBlock({
  section,
}: {
  section: CaseGuidanceCardModel["suggestedNextSteps"];
}) {
  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-labelledby={`guidance-${section.id}`}
    >
      <h2 id={`guidance-${section.id}`} className="text-lg font-semibold text-aibeop-text">
        {section.title}
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-aibeop-subtle">
        {section.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      {section.links?.length ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {section.links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-aibeop-subtle hover:bg-slate-100"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function CaseGuidanceCardClient({ model }: Props) {
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
          사건 진단 카드 (참고)
        </p>
        <h1 className="mt-1 text-2xl font-bold text-aibeop-text">{model.caseCategoryLabel}</h1>
        <p className="mt-2 text-sm text-aibeop-muted">
          아래는 사건 유형·입력 정보를 바탕으로 한 <strong>일반 안내</strong>입니다. 법률 자문이나
          최종 판단을 대신하지 않습니다.
        </p>
        <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-amber-950/90">
          {model.disclaimers.map((d) => (
            <li key={d}>· {d}</li>
          ))}
        </ul>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
        <h2 className="text-lg font-semibold text-aibeop-text">입력 기반 요약 포인트</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-aibeop-subtle">
          {model.situationSummaryBullets.map((b) => (
            <li key={b} className="break-words">
              {b}
            </li>
          ))}
        </ul>
      </section>

      <SectionBlock section={model.suggestedNextSteps} />
      <SectionBlock section={model.institutionChecklist} />
      <SectionBlock section={model.researchAndCasesHint} />
    </div>
  );
}
