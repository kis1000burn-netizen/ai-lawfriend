"use client";

import Link from "next/link";

type RetryRun = {
  id: string;
  jobName: string;
  jobCode: string;
  status: string;
  startedAt: string;
  finishedAt?: string | null;
  retryOfRunId?: string | null;
  triggeredBy?: string | null;
};

export function CronRetryHistoryTable({ rows }: { rows: RetryRun[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-aibeop-subtle">관련 재시도 이력</h2>
        <p className="mt-1 text-xs text-aibeop-subtle">
          현재 실행과 연결된 재시도·원본 이력을 함께 보여줍니다.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-aibeop-muted">실행 ID</th>
              <th className="px-4 py-3 text-left text-aibeop-muted">상태</th>
              <th className="px-4 py-3 text-left text-aibeop-muted">시작</th>
              <th className="px-4 py-3 text-left text-aibeop-muted">트리거</th>
              <th className="px-4 py-3 text-right text-aibeop-muted">상세</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-mono text-xs text-aibeop-subtle">{row.id}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      row.status === "SUCCESS"
                        ? "bg-emerald-100 text-emerald-700"
                        : row.status === "FAILED"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-aibeop-muted">
                  {new Date(row.startedAt).toLocaleString("ko-KR")}
                </td>
                <td className="px-4 py-3 text-aibeop-muted">{row.triggeredBy ?? "-"}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/cron-runs/${row.id}`}
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
