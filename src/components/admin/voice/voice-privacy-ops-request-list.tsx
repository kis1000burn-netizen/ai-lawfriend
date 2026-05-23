"use client";

import Link from "next/link";

type PrivacyRequestRow = {
  id: string;
  caseId: string;
  voiceTranscriptId: string | null;
  requestType: string;
  status: string;
  requesterChannel: string | null;
  requesterNote: string;
  resolutionCode: string | null;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  items: PrivacyRequestRow[];
};

function statusBadgeClass(status: string): string {
  switch (status) {
    case "OPEN":
      return "bg-amber-50 text-amber-900 ring-amber-200";
    case "IN_REVIEW":
      return "bg-sky-50 text-sky-900 ring-sky-200";
    case "RESOLVED":
      return "bg-emerald-50 text-emerald-900 ring-emerald-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-900 ring-rose-200";
    default:
      return "bg-slate-100 text-slate-800 ring-slate-200";
  }
}

export function VoicePrivacyOpsRequestList({ items }: Readonly<Props>) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
        등록된 삭제·정정·STT 민원 요청이 없습니다.
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"
      data-testid="voice-privacy-ops-list"
    >
      <table className="min-w-[960px] w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="border-b border-slate-200 px-3 py-3">상태</th>
            <th className="border-b border-slate-200 px-3 py-3">유형</th>
            <th className="border-b border-slate-200 px-3 py-3">caseId</th>
            <th className="border-b border-slate-200 px-3 py-3">요청 메모</th>
            <th className="border-b border-slate-200 px-3 py-3">등록</th>
            <th className="border-b border-slate-200 px-3 py-3"> </th>
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
              </td>
              <td className="px-3 py-2 text-xs">{row.requestType}</td>
              <td className="px-3 py-2 font-mono text-xs">{row.caseId}</td>
              <td className="max-w-xs truncate px-3 py-2 text-xs" title={row.requesterNote}>
                {row.requesterNote}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">
                {new Date(row.createdAt).toLocaleString("ko-KR")}
              </td>
              <td className="px-3 py-2 text-right">
                <Link
                  href={`/admin/voice/privacy-requests/${row.id}`}
                  className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-100"
                >
                  처리
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
