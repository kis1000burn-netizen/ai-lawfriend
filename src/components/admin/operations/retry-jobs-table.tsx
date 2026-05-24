import Link from "next/link";
import { RetryJobQueueButton } from "@/components/admin/operations/retry-job-queue-button";
import { canOperatorQueueRetry } from "@/features/platform/reliability/retry-job-policy";
import type { RetryJobListItemDto } from "@/features/platform/reliability/retry-job.schema";

type Props = {
  items: RetryJobListItemDto[];
  syncSummary: { scanned: number; created: number };
};

export function RetryJobsTable({ items, syncSummary }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-aibeop-muted">
        Cron FAIL 동기화: scanned {syncSummary.scanned} · new {syncSummary.created}
      </p>
      <div className="overflow-x-auto rounded-xl border border-aibeop-border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-aibeop-surface/60 text-aibeop-muted">
              <th className="px-4 py-3">when</th>
              <th className="px-4 py-3">source</th>
              <th className="px-4 py-3">job</th>
              <th className="px-4 py-3">case</th>
              <th className="px-4 py-3">status</th>
              <th className="px-4 py-3">safety</th>
              <th className="px-4 py-3">failure</th>
              <th className="px-4 py-3">action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-aibeop-muted">
                  실패 작업 없음 — 실패한 cron/external job은 자동으로 큐에 적재됩니다.
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const gate = canOperatorQueueRetry({
                  retryable: row.retryable,
                  safetyClass: row.safetyClass,
                  status: row.status,
                  attemptCount: row.attemptCount,
                  maxAttempts: row.maxAttempts,
                });
                return (
                  <tr key={row.id} className="border-b border-aibeop-border/60 align-top">
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                      {row.createdAt.slice(0, 19)}
                    </td>
                    <td className="px-4 py-3">{row.sourceType}</td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs">{row.jobCode}</div>
                      <div className="text-xs text-aibeop-muted">
                        {row.attemptCount}/{row.maxAttempts}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {row.caseId ? (
                        <Link href={`/cases/${row.caseId}`} className="text-aibeop-accent hover:underline">
                          {row.caseId.slice(0, 10)}…
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          row.safetyClass === "BLOCKED"
                            ? "bg-rose-50 text-rose-700"
                            : row.safetyClass === "SAFE_AUTO"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-800",
                        ].join(" ")}
                      >
                        {row.safetyClass}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-xs text-aibeop-muted" title={row.failureReason ?? undefined}>
                      {row.failureReason ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <RetryJobQueueButton
                        retryJobId={row.id}
                        disabled={!gate.allowed}
                        disabledReason={gate.reason}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
