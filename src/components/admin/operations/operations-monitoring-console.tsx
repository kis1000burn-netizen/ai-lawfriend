import Link from "next/link";
import type { OperationsMonitoringSnapshot } from "@/features/operations-monitoring/operations-monitoring-snapshot.service";
import {
  OPERATIONS_MONITORING_RC_ADMIN_CONSOLE_PATH,
  OPERATIONS_MONITORING_RC_SNAPSHOT_API_PATH,
} from "@/features/platform/operations-monitoring-rc-lock";

type Props = {
  snapshot: OperationsMonitoringSnapshot;
};

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        ok
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export function OperationsMonitoringConsole({ snapshot }: Props) {
  const healthOk = snapshot.health.ok;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-aibeop-muted">Phase 17-D — Admin Ops Console</p>
        <h1 className="text-2xl font-bold text-aibeop-deep">운영 모니터링 · 장애 triage</h1>
        <p className="text-sm text-aibeop-muted">
          배포 후 <strong>누가 · 언제 · 어떤 사건 · AI/문서/알림/파일</strong>에서 문제가 났는지
          확인합니다. Snapshot: {snapshot.capturedAt} · window {snapshot.windowHours}h
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-aibeop-border bg-white p-4">
          <p className="text-xs text-aibeop-muted">Health</p>
          <div className="mt-2">
            <StatusPill ok={healthOk} label={healthOk ? "OK" : "DB ERROR"} />
          </div>
        </div>
        <div className="rounded-xl border border-aibeop-border bg-white p-4">
          <p className="text-xs text-aibeop-muted">Audit (24h)</p>
          <p className="mt-2 text-xl font-semibold">{snapshot.audit.totalInWindow}</p>
          <p className="text-xs text-aibeop-muted">issues {snapshot.audit.issueCountInWindow}</p>
        </div>
        <div className="rounded-xl border border-aibeop-border bg-white p-4">
          <p className="text-xs text-aibeop-muted">External msg FAIL</p>
          <p className="mt-2 text-xl font-semibold">{snapshot.externalMessages.failedInWindow}</p>
        </div>
        <div className="rounded-xl border border-aibeop-border bg-white p-4">
          <p className="text-xs text-aibeop-muted">Cron FAIL</p>
          <p className="mt-2 text-xl font-semibold">{snapshot.cron.failedInWindow}</p>
        </div>
      </section>

      <section className="rounded-xl border border-aibeop-border bg-white p-5">
        <h2 className="text-lg font-semibold text-aibeop-deep">Release · API</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-aibeop-muted">commit</dt>
            <dd className="font-mono text-xs">{snapshot.release.commitSha ?? "(local)"}</dd>
          </div>
          <div>
            <dt className="text-aibeop-muted">appEnv</dt>
            <dd>{snapshot.release.appEnv}</dd>
          </div>
          <div>
            <dt className="text-aibeop-muted">Snapshot API</dt>
            <dd className="font-mono text-xs">{OPERATIONS_MONITORING_RC_SNAPSHOT_API_PATH}</dd>
          </div>
          <div>
            <dt className="text-aibeop-muted">Console path</dt>
            <dd className="font-mono text-xs">{OPERATIONS_MONITORING_RC_ADMIN_CONSOLE_PATH}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-aibeop-border bg-white p-5">
        <h2 className="text-lg font-semibold text-aibeop-deep">Observer domains (17-B)</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(snapshot.audit.byDomain).map(([domain, count]) => (
            <li
              key={domain}
              className="flex items-center justify-between rounded-lg bg-aibeop-surface px-3 py-2 text-sm"
            >
              <span>{domain}</span>
              <span className="font-semibold">{count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-aibeop-border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-aibeop-deep">Recent audit issues</h2>
          <Link href="/admin/audit-logs" className="text-sm text-aibeop-accent hover:underline">
            전체 감사로그 →
          </Link>
          <Link
            href="/admin/operations/data-governance"
            className="text-sm text-aibeop-accent hover:underline"
          >
            Data Governance →
          </Link>
        </div>
        {snapshot.audit.recentIssues.length === 0 ? (
          <p className="mt-3 text-sm text-aibeop-muted">최근 issue action 없음</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-aibeop-muted">
                  <th className="py-2 pr-4">when</th>
                  <th className="py-2 pr-4">who</th>
                  <th className="py-2 pr-4">case/entity</th>
                  <th className="py-2 pr-4">domain</th>
                  <th className="py-2">action</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.audit.recentIssues.map((row) => (
                  <tr key={row.id} className="border-b border-aibeop-border/60">
                    <td className="py-2 pr-4 font-mono text-xs">{row.createdAt.slice(0, 19)}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{row.actorUserId.slice(0, 8)}…</td>
                    <td className="py-2 pr-4 font-mono text-xs">
                      {row.entityId?.slice(0, 12) ?? "—"}
                    </td>
                    <td className="py-2 pr-4">{row.domain}</td>
                    <td className="py-2 font-mono text-xs">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-aibeop-border bg-white p-5">
          <h2 className="text-lg font-semibold text-aibeop-deep">External message failures</h2>
          {snapshot.externalMessages.recentFailures.length === 0 ? (
            <p className="mt-3 text-sm text-aibeop-muted">없음</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {snapshot.externalMessages.recentFailures.map((row) => (
                <li key={row.id} className="rounded-lg bg-aibeop-surface p-3">
                  <p className="font-mono text-xs">{row.createdAt.slice(0, 19)}</p>
                  <p>
                    case {row.caseId.slice(0, 10)}… · {row.channel} · {row.status}
                  </p>
                  {row.failureReason ? (
                    <p className="text-aibeop-muted">{row.failureReason}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-aibeop-border bg-white p-5">
          <h2 className="text-lg font-semibold text-aibeop-deep">Cron failures</h2>
          {snapshot.cron.recentFailures.length === 0 ? (
            <p className="mt-3 text-sm text-aibeop-muted">없음</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {snapshot.cron.recentFailures.map((row) => (
                <li key={row.id} className="rounded-lg bg-aibeop-surface p-3">
                  <p className="font-mono text-xs">{row.startedAt.slice(0, 19)}</p>
                  <p>
                    {row.jobCode} · {row.status}
                  </p>
                  {row.message ? <p className="text-aibeop-muted">{row.message}</p> : null}
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/cron" className="mt-3 inline-block text-sm text-aibeop-accent hover:underline">
            Cron 로그 →
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-aibeop-border bg-aibeop-surface/50 p-5">
        <h2 className="text-lg font-semibold text-aibeop-deep">Ops shortcuts</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href="/admin/operations/retry-jobs" className="text-aibeop-accent hover:underline">
            Retry Queue (18-A)
          </Link>
          <Link href="/admin/operations/aibeopchin-7-dashboard" className="text-aibeop-accent hover:underline">
            7.0 정적 대시보드 (17-A)
          </Link>
          <Link href="/admin/system" className="text-aibeop-accent hover:underline">
            시스템 점검
          </Link>
          <Link href="/admin/alerts/ops-dashboard" className="text-aibeop-accent hover:underline">
            Alert Ops
          </Link>
          <Link href="/admin/audit-logs" className="text-aibeop-accent hover:underline">
            감사로그
          </Link>
        </div>
      </section>
    </div>
  );
}
