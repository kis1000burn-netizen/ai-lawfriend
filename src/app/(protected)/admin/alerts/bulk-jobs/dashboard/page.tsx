import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getBulkJobTimeseriesMetrics } from "@/lib/admin/bulk-jobs/metrics-timeseries";
import { AnomalyTrendChart } from "@/components/admin/alerts/bulk-jobs/anomaly-trend-chart";
import { BulkJobAnomalyWidget } from "@/components/admin/alerts/bulk-jobs/bulk-job-anomaly-widget";
import { RetryStormChart } from "@/components/admin/alerts/bulk-jobs/retry-storm-chart";

export default async function BulkJobDashboardPage() {
  await requireAdmin();

  const points = await getBulkJobTimeseriesMetrics(48);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm text-aibeop-subtle">관리자 / 경고 / Bulk Jobs</div>
          <h1 className="mt-1 text-2xl font-semibold text-aibeop-text">BulkActionJob 운영 대시보드</h1>
          <p className="mt-1 text-sm text-aibeop-subtle">
            retry storm, anomaly 추이, 동시성 병목을 빠르게 확인합니다.
          </p>
        </div>
        <Link
          href="/admin/alerts/bulk-jobs"
          className="text-sm font-medium text-aibeop-subtle underline-offset-4 hover:underline"
        >
          ← 목록으로
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RetryStormChart data={points} />
        <AnomalyTrendChart data={points} />
      </div>

      <BulkJobAnomalyWidget />
    </div>
  );
}
