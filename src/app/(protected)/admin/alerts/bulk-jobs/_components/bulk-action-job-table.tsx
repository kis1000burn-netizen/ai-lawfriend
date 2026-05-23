"use client";

import Link from "next/link";

type Row = {
  id: string;
  action: string;
  status: string;
  createdAt: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  retryOfJobId?: string | null;
  retryScheduledAt?: string | Date | null;
  actor?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

type BulkActionJobTableProps = {
  rows: Row[];
  onRetry: (jobId: string) => void;
  onCancel: (jobId: string) => void;
  selectedIds: string[];
  onToggleSelect: (jobId: string) => void;
};

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "SUCCESS":
      return "bg-emerald-100 text-emerald-700";
    case "PARTIAL_SUCCESS":
      return "bg-amber-100 text-amber-700";
    case "FAILED":
      return "bg-rose-100 text-rose-700";
    case "RUNNING":
      return "bg-blue-100 text-blue-700";
    case "CANCELED":
      return "bg-slate-200 text-aibeop-subtle";
    default:
      return "bg-slate-100 text-aibeop-muted";
  }
}

function canRetryJob(status: string) {
  return status === "FAILED" || status === "PARTIAL_SUCCESS";
}

function canCancelJob(status: string) {
  return status === "QUEUED" || status === "FAILED" || status === "PARTIAL_SUCCESS";
}

export function BulkActionJobTable({
  rows,
  onRetry,
  onCancel,
  selectedIds,
  onToggleSelect,
}: Readonly<BulkActionJobTableProps>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="w-10 px-2 py-3 text-left text-aibeop-muted">
              <span className="sr-only">선택</span>
            </th>
            <th className="px-4 py-3 text-left text-aibeop-muted">Job ID</th>
            <th className="px-4 py-3 text-left text-aibeop-muted">액션</th>
            <th className="px-4 py-3 text-left text-aibeop-muted">상태</th>
            <th className="px-4 py-3 text-left text-aibeop-muted">실행자</th>
            <th className="px-4 py-3 text-left text-aibeop-muted">생성</th>
            <th className="px-4 py-3 text-left text-aibeop-muted">재시도 원본</th>
            <th className="px-4 py-3 text-left text-aibeop-muted">예약 재시도</th>
            <th className="px-4 py-3 text-right text-aibeop-muted">액션</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100">
              <td className="px-2 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(row.id)}
                  onChange={() => onToggleSelect(row.id)}
                  aria-label={`${row.id} 선택`}
                />
              </td>
              <td className="max-w-[140px] truncate px-4 py-3 font-mono text-xs text-aibeop-subtle" title={row.id}>
                {row.id}
              </td>
              <td className="px-4 py-3 text-aibeop-subtle">{row.action}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${getStatusBadgeClass(row.status)}`}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3 text-aibeop-muted">
                {row.actor?.name || row.actor?.email || "-"}
              </td>
              <td className="px-4 py-3 text-aibeop-muted">
                {new Date(row.createdAt).toLocaleString("ko-KR")}
              </td>
              <td className="max-w-[120px] truncate px-4 py-3 font-mono text-xs text-aibeop-subtle" title={row.retryOfJobId ?? ""}>
                {row.retryOfJobId ?? "-"}
              </td>
              <td className="max-w-[140px] truncate px-4 py-3 text-xs text-aibeop-muted">
                {row.retryScheduledAt
                  ? new Date(row.retryScheduledAt).toLocaleString("ko-KR")
                  : "-"}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap justify-end gap-2">
                  <Link
                    href={`/admin/alerts/bulk-jobs/${row.id}`}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-aibeop-subtle hover:bg-slate-50"
                  >
                    상세
                  </Link>

                  {canRetryJob(row.status) && (
                    <button
                      type="button"
                      onClick={() => onRetry(row.id)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-aibeop-subtle hover:bg-slate-50"
                    >
                      재시도
                    </button>
                  )}

                  {canCancelJob(row.status) && (
                    <button
                      type="button"
                      onClick={() => onCancel(row.id)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-aibeop-subtle hover:bg-slate-50"
                    >
                      취소
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
