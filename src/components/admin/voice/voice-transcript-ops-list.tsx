"use client";

import type { VoiceTranscriptOpsRow } from "@/features/voice/voice-ops.service";

type Props = {
  items: VoiceTranscriptOpsRow[];
};

function statusBadgeClass(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "bg-emerald-50 text-emerald-900 ring-emerald-200";
    case "NEEDS_CONFIRMATION":
      return "bg-sky-50 text-sky-900 ring-sky-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-900 ring-rose-200";
    default:
      return "bg-slate-100 text-slate-800 ring-slate-200";
  }
}

export function VoiceTranscriptOpsList({ items }: Readonly<Props>) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
        표시할 Voice transcript 메타가 없습니다. 본문(`draftText`)은 운영 화면에 노출하지 않습니다.
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"
      data-testid="voice-transcript-ops-list"
    >
      <table className="min-w-[960px] w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="border-b border-slate-200 px-3 py-3">상태</th>
            <th className="border-b border-slate-200 px-3 py-3">caseId</th>
            <th className="border-b border-slate-200 px-3 py-3">questionKey</th>
            <th className="border-b border-slate-200 px-3 py-3">TTL</th>
            <th className="border-b border-slate-200 px-3 py-3">trace</th>
            <th className="border-b border-slate-200 px-3 py-3">수정</th>
          </tr>
        </thead>
        <tbody className="text-slate-800">
          {items.map((row) => (
            <tr key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/90">
              <td className="px-3 py-2 align-middle">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${statusBadgeClass(row.status)}`}
                >
                  {row.status}
                </span>
                {row.ttlOverdue ? (
                  <span className="ml-2 text-xs font-medium text-amber-800">TTL 초과</span>
                ) : null}
              </td>
              <td className="px-3 py-2 font-mono text-xs">{row.caseId}</td>
              <td className="px-3 py-2 font-mono text-xs">{row.questionKey}</td>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">
                {row.expiresAt ? new Date(row.expiresAt).toLocaleString("ko-KR") : "—"}
              </td>
              <td className="px-3 py-2 text-xs">{row.traceCount}</td>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">
                {new Date(row.updatedAt).toLocaleString("ko-KR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
