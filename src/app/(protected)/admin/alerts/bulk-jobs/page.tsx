import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import BulkJobCharts from "@/components/admin/alerts/bulk-jobs/bulk-job-charts";
import { BulkJobCsvDownloadButton } from "@/components/admin/alerts/bulk-jobs/bulk-job-csv-download-button";
import WorkerHealthPanel from "@/components/admin/alerts/bulk-jobs/worker-health-panel";
import { getBulkActionJobs } from "@/lib/alerts/bulk-job/get-bulk-action-jobs";
import { getBulkJobFailureReasonStats } from "@/lib/alerts/bulk-job/get-bulk-job-failure-reason-stats";
import { getBulkJobOpsDashboard } from "@/lib/alerts/bulk-job/get-bulk-job-ops-dashboard";
import { BulkActionJobListClient } from "./_components/bulk-action-job-list-client";
import { BulkActionJobFilterBar } from "./_components/bulk-action-job-filter-bar";
import { BulkJobFailureReasonWidget } from "./_components/bulk-job-failure-reason-widget";
import { BulkJobOpsDashboard } from "./_components/bulk-job-ops-dashboard";
import { RecoverStaleLocksButton } from "./_components/recover-stale-locks-button";
import { BulkJobAnomalyWidget } from "@/components/admin/alerts/bulk-jobs/bulk-job-anomaly-widget";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    action?: string;
    priority?: string;
    from?: string;
    to?: string;
    actorQuery?: string;
    query?: string;
    onlyRetry?: string;
  }>;
};

export default async function BulkActionJobsPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const page = Number(params.page ?? "1");

  const [data, failureStats, ops] = await Promise.all([
    getBulkActionJobs({
      status: params.status,
      action: params.action,
      from: params.from,
      to: params.to,
      actorQuery: params.actorQuery,
      query: params.query,
      onlyRetry: params.onlyRetry === "true",
      page,
      pageSize: 20,
    }),
    getBulkJobFailureReasonStats({
      from: params.from,
      to: params.to,
      limit: 8,
    }),
    getBulkJobOpsDashboard({
      from: params.from,
      to: params.to,
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-aibeop-subtle">관리자 / 경고 / Bulk Jobs</div>
          <h1 className="mt-1 text-2xl font-semibold text-aibeop-text">대량 액션 Job 목록</h1>
          <p className="mt-1 text-sm text-aibeop-subtle">
            비동기 대량 액션 큐 상태를 조회하고, 실패 Job 재시도·취소를 관리합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/alerts/bulk-jobs/dashboard"
            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
          >
            운영 대시보드
          </Link>
          <Suspense fallback={null}>
            <BulkJobCsvDownloadButton />
          </Suspense>
          <RecoverStaleLocksButton />
        </div>
      </div>

      <BulkJobCharts />
      <WorkerHealthPanel />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BulkJobOpsDashboard data={ops} />
        <BulkJobAnomalyWidget />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-aibeop-subtle">필터를 불러오는 중…</div>}>
          <BulkActionJobFilterBar />
        </Suspense>
        <BulkJobFailureReasonWidget rows={failureStats} />
      </div>

      <Suspense fallback={<div className="text-sm text-aibeop-subtle">목록을 불러오는 중…</div>}>
        <BulkActionJobListClient
          initialRows={data.rows}
          page={data.page}
          totalPages={data.totalPages}
        />
      </Suspense>
    </div>
  );
}
