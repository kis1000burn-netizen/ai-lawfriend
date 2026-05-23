"use client";

import Link from "next/link";

type Props = {
  currentStatus: string;
};

const STATUS_OPTIONS = [
  "",
  "DRAFT",
  "MAPPING_PENDING",
  "READY_FOR_RESEARCH",
  "RESEARCH_IN_PROGRESS",
  "LAWYER_REVIEW_PENDING",
  "PACKET_DRAFT_LINKED",
  "PACKET_APPROVED",
  "PIPELINE_REJECTED",
] as const;

export function LegalKnowledgeIntakeListFilters({ currentStatus }: Readonly<Props>) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <form
        action="/admin/gongbuho/legal-knowledge"
        method="get"
        className="flex flex-wrap items-end gap-3"
      >
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Intake 상태
          <select
            name="status"
            defaultValue={currentStatus}
            className="min-w-[220px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">전체</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          필터
        </button>
        <Link
          href="/admin/gongbuho/legal-knowledge"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          초기화
        </Link>
      </form>
    </div>
  );
}
