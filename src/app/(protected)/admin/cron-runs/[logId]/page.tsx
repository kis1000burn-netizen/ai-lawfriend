import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getCronRunDetail } from "@/lib/cron/get-cron-run-detail";
import { CronRunDetailCard } from "./_components/cron-run-detail-card";
import { CronRetryHistoryTable } from "./_components/cron-retry-history-table";
import { CronRunNotificationsPanel } from "./_components/cron-run-notifications-panel";
import { CronRetryButton } from "./_components/cron-retry-button";

type PageProps = {
  params: Promise<{ logId: string }>;
};

export default async function CronRunDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { logId } = await params;

  const data = await getCronRunDetail(logId);

  if (!data?.run) {
    notFound();
  }

  const run = data.run;

  const runSerialized = {
    id: run.id,
    jobCode: run.jobCode,
    jobName: run.jobName,
    status: run.status,
    startedAt: run.startedAt.toISOString(),
    finishedAt: run.finishedAt?.toISOString() ?? null,
    durationMs: run.durationMs,
    message: run.message,
    errorStack: run.errorStack,
    retryOfRunId: run.retryOfRunId,
    triggeredBy: run.triggeredBy,
    metaJson: run.metaJson,
    scannedCount: run.scannedCount,
    affectedCount: run.affectedCount,
    createdAt: run.createdAt.toISOString(),
  };

  const retryRows = data.retryRuns.map((r) => ({
    id: r.id,
    jobName: r.jobName,
    jobCode: r.jobCode,
    status: r.status,
    startedAt: r.startedAt.toISOString(),
    finishedAt: r.finishedAt?.toISOString() ?? null,
    retryOfRunId: r.retryOfRunId,
    triggeredBy: r.triggeredBy,
  }));

  const notificationRows = data.notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    readAt: n.readAt?.toISOString() ?? null,
    targetHref: n.targetHref,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-aibeop-subtle">
            <Link href="/admin/cron" className="text-blue-600 hover:underline">
              Cron 실행 로그
            </Link>{" "}
            / 상세
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-aibeop-text">Cron 실행 상세</h1>
        </div>

        {run.status === "FAILED" && <CronRetryButton runId={run.id} />}
      </div>

      <CronRunDetailCard run={runSerialized} />
      <CronRetryHistoryTable rows={retryRows} />
      <CronRunNotificationsPanel rows={notificationRows} />
    </div>
  );
}
