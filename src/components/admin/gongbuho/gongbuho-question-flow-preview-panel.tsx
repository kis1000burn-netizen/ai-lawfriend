import type { GongbuhoQuestionFlowPreviewResult } from "@/features/gongbuho/admin-gongbuho-question-flow-preview";

export function GongbuhoQuestionFlowPreviewPanel(props: Readonly<{
  preview: GongbuhoQuestionFlowPreviewResult;
}>) {
  return (
    <section
      aria-label="공부호 questionFlow 미리보기"
      className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-indigo-950">
        questionFlow 미리보기 (Phase 4-C)
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-indigo-900/90">
        STAFF·ADMIN 모두 패킷 저장 없이 동일 규약으로 투영 결과를 검토합니다. 화면은 상세에 로드된{" "}
        <code className="font-mono text-[11px]">packetJson</code>
        과 일치합니다. REST 검증에는{" "}
        <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[10px]">
          POST …/question-flow/preview
        </code>
        도 사용합니다.
      </p>

      {!props.preview.ok ? (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
          <p className="font-semibold text-amber-950">미리보기 실패 · 투영 규격 오류</p>
          <p className="mt-1 text-xs text-amber-900">
            코드:{" "}
            <span className="font-mono text-[11px]">{props.preview.code}</span>
          </p>
          <p className="mt-2 text-xs text-amber-900/95">{props.preview.message}</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-medium text-indigo-950">
            투영된 질문 {props.preview.questions.length}개 (순서·키·라벨)
          </p>
          <ul className="divide-y divide-indigo-200/70 rounded-xl border border-indigo-200 bg-white text-xs shadow-inner">
            {props.preview.questions.map((q) => (
              <li key={q.key} className="px-4 py-3">
                <div className="flex flex-wrap items-baseline gap-2 font-mono text-[11px] text-slate-600">
                  <span className="text-slate-500">순번 {q.order}</span>
                  <span>{q.key}</span>
                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 font-sans text-[10px] text-indigo-900">
                    {q.type}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-snug text-slate-900">{q.label}</p>
                {q.description ? (
                  <p className="mt-1 text-[11px] text-slate-600">{q.description}</p>
                ) : null}
                {q.helpText ? (
                  <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded border border-slate-100 bg-slate-50 p-2 font-sans text-[11px] text-slate-700">
                    {q.helpText}
                  </pre>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
