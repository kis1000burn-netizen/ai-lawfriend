import Link from "next/link";
import { GONGGBUHO_ADMIN_CASE_TYPE_FILTER_PRESETS_ORDERED } from "@/features/gongbuho/admin-gongbuho-case-type-filter-presets";
import type { GongbuhoPacketStatus } from "@prisma/client";

type Props = Readonly<{
  currentStatus: GongbuhoPacketStatus | "";
  currentCaseType: string;
  currentCode: string;
}>;

const STATUS_OPTIONS: Array<{
  value: "" | GongbuhoPacketStatus;
  label: string;
}> = [
  { value: "", label: "상태 전체" },
  { value: "DRAFT", label: "DRAFT" },
  { value: "REVIEW", label: "REVIEW" },
  { value: "APPROVED", label: "APPROVED" },
  { value: "ARCHIVED", label: "ARCHIVED" },
];

export function GongbuhoPacketListFilters(props: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <form action="/admin/gongbuho" method="get" className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            상태
            <select
              name="status"
              defaultValue={props.currentStatus || ""}
              className="min-w-[9rem] rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={String(o.value) || "__all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            caseType / 사건 카테고리
            <select
              name="caseType"
              defaultValue={props.currentCaseType}
              className="min-w-[14rem] max-w-[20rem] rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
            >
              <option value="">유형 전체</option>
              {GONGGBUHO_ADMIN_CASE_TYPE_FILTER_PRESETS_ORDERED.map((p) => (
                <option key={p.caseType} value={p.caseType}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            code 정확 일치
            <input
              name="code"
              type="text"
              placeholder="예: LAW-WAGE-001"
              defaultValue={props.currentCode}
              className="min-w-[12rem] rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400"
            />
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              적용
            </button>
            <Link
              href="/admin/gongbuho"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              초기화
            </Link>
          </div>
        </form>
        <p className="max-w-xl text-[11px] leading-relaxed text-slate-500">
          Phase 4-D: 패킷 라이브러리가 늘어날수록<code className="mx-0.5 font-mono">caseType</code>·코드 접두 검색 기반으로 흐름 확인이 필요합니다.
        </p>
      </div>
    </div>
  );
}
