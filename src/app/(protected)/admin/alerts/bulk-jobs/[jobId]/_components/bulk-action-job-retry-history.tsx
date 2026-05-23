"use client";

import Link from "next/link";

type Row = {
  id: string;
  status: string;
  createdAt: string | Date;
};

export function BulkActionJobRetryHistory({ rows }: { rows: Row[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-aibeop-subtle">관련 재시도 이력</h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-aibeop-muted">Job ID</th>
              <th className="px-4 py-3 text-left text-aibeop-muted">상태</th>
              <th className="px-4 py-3 text-left text-aibeop-muted">생성</th>
              <th className="px-4 py-3 text-right text-aibeop-muted">상세</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-aibeop-subtle">
                  관련 Job이 없습니다.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="max-w-[160px] truncate px-4 py-3 font-mono text-xs text-aibeop-subtle" title={row.id}>
                  {row.id}
                </td>
                <td className="px-4 py-3 text-aibeop-subtle">{row.status}</td>
                <td className="px-4 py-3 text-aibeop-muted">
                  {new Date(row.createdAt).toLocaleString("ko-KR")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/alerts/bulk-jobs/${row.id}`}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-aibeop-subtle hover:bg-slate-50"
                  >
                    보기
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
