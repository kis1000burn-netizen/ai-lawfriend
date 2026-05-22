"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { requireOkData } from "@/lib/client/api-error";
import { CASE_STATUS_LABELS } from "@/lib/definitions";

type SummaryContent = {
  caseOverview: string;
  timeline: string[];
  issues: string[];
  riskNotes: string[];
  checklist: string[];
  disclaimer: string;
  contractSections?: { heading: string; body: string }[];
  structuredSummaryNote?: string;
};

type GongbuhoResolutionBadge = {
  via: string;
  code?: string;
  version?: string;
};

type SummaryPayload = {
  generatedAt: string;
  outputContractApplied?: boolean;
  gongbuhoResolution?: GongbuhoResolutionBadge;
  content: SummaryContent;
  caseStatus: string;
};

type Props = {
  caseId: string;
  interviewCompleted: boolean;
};

function SummaryBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <div className="text-xs font-semibold text-slate-500">{title}</div>
      <p className="mt-2 whitespace-pre-wrap text-slate-800">{body}</p>
    </div>
  );
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <div className="text-xs font-semibold text-slate-500">{title}</div>
      <ul className="mt-2 list-inside list-disc space-y-1 text-slate-800">
        {items.map((item, i) => (
          <li key={`${title}-${i}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** 인터뷰 기반 1차 사건 요약 — `/api/cases/.../summary/generate` 응답을 읽기 전용 카드로 표시 */
export function CaseSummaryPanel({ caseId, interviewCompleted }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryPayload | null>(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/summary/generate`, {
        method: "POST",
      });
      const raw = await res.json().catch(() => null);
      const payload = requireOkData<{ summary?: SummaryPayload }>(
        res,
        raw,
        "요약을 불러오지 못했습니다.",
      );
      if (payload.summary == null) {
        throw new Error("요약을 불러오지 못했습니다.");
      }
      setSummary(payload.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">사건 요약 (인터뷰 기반)</h2>
          <p className="mt-1 text-sm text-slate-600">
            {interviewCompleted
              ? "인터뷰 완료 후 답변을 바탕으로 한 1차 요약입니다. 참고용이며 최종 법률 판단을 대체하지 않습니다."
              : "인터뷰 완료 전에는 답변을 기준으로 한 미리보기입니다. 완료 후 동일 API로 정식 1차 요약 흐름에 맞게 활용할 수 있습니다."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/cases/${caseId}/interview`}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            인터뷰 화면
          </Link>
          <button
            type="button"
            disabled={loading}
            onClick={() => void loadSummary()}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "생성 중..." : interviewCompleted ? "1차 요약 불러오기" : "요약 미리보기"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {summary ? (
        <div className="mt-4 space-y-4 text-sm">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>생성 시각: {new Date(summary.generatedAt).toLocaleString("ko-KR")}</span>
            <span>
              · 생성 시점 사건 상태:{" "}
              {CASE_STATUS_LABELS[summary.caseStatus as keyof typeof CASE_STATUS_LABELS] ??
                summary.caseStatus}
            </span>
            {summary.outputContractApplied ? (
              <span className="font-medium text-indigo-700">
                · 공부호 출력 양식 적용됨{" "}
                {summary.gongbuhoResolution
                  ? `(${summary.gongbuhoResolution.code ?? ""}${
                      summary.gongbuhoResolution.version
                        ? ` · v${summary.gongbuhoResolution.version}`
                        : ""
                    })`
                  : ""}
              </span>
            ) : null}
          </div>

          {summary.content.structuredSummaryNote ? (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs leading-relaxed text-sky-950">
              {summary.content.structuredSummaryNote}
            </div>
          ) : null}

          {summary.content.contractSections?.length ? (
            <div className="space-y-4">
              {summary.content.contractSections.map((sec, idx) => (
                <SummaryBlock key={`${sec.heading}-${idx}`} title={sec.heading} body={sec.body} />
              ))}
            </div>
          ) : (
            <>
              <SummaryBlock title="사건 개요" body={summary.content.caseOverview} />
              <SummaryList title="타임라인·경위" items={summary.content.timeline} />
              <SummaryList title="쟁점·이슈" items={summary.content.issues} />
              <SummaryList title="누락·주의" items={summary.content.riskNotes} />
              <SummaryList title="체크리스트" items={summary.content.checklist} />
            </>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
            {summary.content.disclaimer}
          </div>
        </div>
      ) : !error ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600">
          {interviewCompleted
            ? "위 버튼으로 인터뷰 답변을 바탕으로 한 1차 요약을 불러옵니다."
            : "답변이 없으면 항목이 비어 있을 수 있습니다. 미리보기로 형식을 확인할 수 있습니다."}
        </div>
      ) : null}
    </section>
  );
}
