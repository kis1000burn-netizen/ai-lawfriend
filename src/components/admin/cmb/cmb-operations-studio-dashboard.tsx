"use client";

import Link from "next/link";
import type { CmbOperationsStudioDashboard } from "@/cmb/ops/cmb-operations-studio.service";
import { cmbStatusBadgeClass } from "@/cmb/admin/cmb-admin-preview";

type Props = {
  dashboard: CmbOperationsStudioDashboard;
};

const BOTTLENECK_LABELS: Record<string, string> = {
  DRAFT_REVIEW_QUEUE: "DRAFT/REVIEW 큐",
  VERIFY_PASS_AWAITING_LOCK: "VERIFY_PASS → LOCK 대기",
  LOCKED_AWAITING_PUBLISH: "LOCKED → PUBLISH 대기",
  CASE_TYPE_NO_PUBLISHED: "caseType 미 PUBLISH",
};

const GAP_LABELS: Record<string, string> = {
  NONE: "OK",
  NO_REVISION: "revision 없음",
  NO_PUBLISHED: "PUBLISHED 없음",
  VALIDATION_FAIL: "registry 검증 실패",
};

function pct(value: number | null): string {
  if (value == null) return "—";
  return `${value}%`;
}

export function CmbOperationsStudioDashboardView({ dashboard }: Readonly<Props>) {
  const { revisionBacklog, statusQueue, transitionFunnel, coverageSummary } = dashboard;

  return (
    <div className="space-y-8" data-testid="cmb-operations-studio-dashboard">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-aibeop-subtle">전체 revision</p>
          <p className="mt-2 text-2xl font-semibold text-aibeop-text" data-testid="cmb-ops-total-revisions">
            {revisionBacklog.total}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">PUBLISHED</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-950">{statusQueue.published}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">비종료 backlog</p>
          <p className="mt-2 text-2xl font-semibold text-amber-950">{statusQueue.nonTerminalBacklog}</p>
        </div>
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">병목</p>
          <p className="mt-2 text-sm font-semibold text-sky-950">
            {BOTTLENECK_LABELS[dashboard.bottleneckStage] ?? dashboard.bottleneckStage}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-aibeop-text">Status queue</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-5">
          {(
            [
              ["DRAFT", statusQueue.draft],
              ["REVIEW", statusQueue.review],
              ["VERIFY_PASS", statusQueue.verifyPass],
              ["LOCKED", statusQueue.locked],
              ["PUBLISHED", statusQueue.published],
            ] as const
          ).map(([label, count]) => (
            <div key={label}>
              <dt className="font-mono text-xs text-aibeop-subtle">{label}</dt>
              <dd className="text-lg font-semibold">{count}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-aibeop-text">Publish/Lock 전이 funnel</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-aibeop-subtle">→ VERIFY_PASS+</dt>
            <dd className="text-lg font-semibold">{pct(transitionFunnel.rates.toVerifyPassPct)}</dd>
            <dd className="text-xs text-aibeop-muted">
              {transitionFunnel.reachedVerifyPass} / {transitionFunnel.totalRevisions}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-aibeop-subtle">→ LOCKED+</dt>
            <dd className="text-lg font-semibold">{pct(transitionFunnel.rates.toLockedPct)}</dd>
            <dd className="text-xs text-aibeop-muted">
              {transitionFunnel.reachedLocked} / {transitionFunnel.totalRevisions}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-aibeop-subtle">→ PUBLISHED</dt>
            <dd className="text-lg font-semibold">{pct(transitionFunnel.rates.toPublishedPct)}</dd>
            <dd className="text-xs text-aibeop-muted">
              {transitionFunnel.reachedPublished} / {transitionFunnel.totalRevisions}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-aibeop-text">caseType 커버리지</h2>
        <p className="mt-1 text-xs text-aibeop-muted">
          registry {coverageSummary.registeredCaseTypes}종 · PUBLISHED {coverageSummary.withPublishedRevision} ·
          gap {coverageSummary.withoutPublishedRevision} · 검증 실패 {coverageSummary.withValidationFailure}
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[720px] w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-aibeop-muted">
              <tr>
                <th className="border-b border-slate-200 px-3 py-3">caseType</th>
                <th className="border-b border-slate-200 px-3 py-3">revisions</th>
                <th className="border-b border-slate-200 px-3 py-3">latest</th>
                <th className="border-b border-slate-200 px-3 py-3">published</th>
                <th className="border-b border-slate-200 px-3 py-3">gap</th>
                <th className="border-b border-slate-200 px-3 py-3"> </th>
              </tr>
            </thead>
            <tbody>
              {dashboard.caseTypeCoverage.map((row) => (
                <tr key={row.caseType} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-3 py-2 font-mono text-xs">{row.caseType}</td>
                  <td className="px-3 py-2">{row.revisionCount}</td>
                  <td className="px-3 py-2">
                    {row.latestRevisionStatus ? (
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${cmbStatusBadgeClass(row.latestRevisionStatus)}`}
                      >
                        {row.latestRevisionStatus}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{row.publishedVersion ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{GAP_LABELS[row.coverageGap] ?? row.coverageGap}</td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/admin/cmb/case-types/${row.caseType}`}
                      className="text-xs font-medium text-aibeop-subtle underline"
                    >
                      Preview
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {dashboard.publishEventsRecent.length > 0 ? (
        <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-aibeop-text">
            최근 Publish events
          </h2>
          <table className="min-w-[880px] w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-aibeop-muted">
              <tr>
                <th className="border-b border-slate-200 px-3 py-3">시각</th>
                <th className="border-b border-slate-200 px-3 py-3">caseType</th>
                <th className="border-b border-slate-200 px-3 py-3">전이</th>
                <th className="border-b border-slate-200 px-3 py-3">verify</th>
                <th className="border-b border-slate-200 px-3 py-3">evidenceTag</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.publishEventsRecent.map((ev) => (
                <tr key={ev.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-aibeop-muted">
                    {new Date(ev.createdAt).toLocaleString("ko-KR")}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {ev.caseType}@{ev.version}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {ev.fromStatus} → {ev.toStatus}
                  </td>
                  <td className="px-3 py-2 text-xs">{ev.verifyPassed ? "PASS" : "—"}</td>
                  <td className="max-w-xs truncate px-3 py-2 font-mono text-xs" title={ev.evidenceTag}>
                    {ev.evidenceTag}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <p className="text-xs text-aibeop-subtle">
        생성: {new Date(dashboard.generatedAt).toLocaleString("ko-KR")} · configJson 미노출
      </p>
    </div>
  );
}
