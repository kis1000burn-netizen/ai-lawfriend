import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { ManualCronRunner } from "@/components/admin/cron/manual-cron-runner";
import { CronLogsTable } from "@/components/admin/cron/cron-logs-table";

export default async function AdminCronPage() {
  await requireAdmin();

  const logsRaw = await prisma.cronJobExecutionLog.findMany({
    orderBy: [{ createdAt: "desc" }],
    take: 100,
  });

  const logs = logsRaw.map((log) => ({
    id: log.id,
    jobCode: log.jobCode,
    jobName: log.jobName,
    status: log.status,
    startedAt: new Date(log.startedAt).toLocaleString("ko-KR"),
    finishedAt: log.finishedAt ? new Date(log.finishedAt).toLocaleString("ko-KR") : null,
    durationMs: log.durationMs,
    scannedCount: log.scannedCount,
    affectedCount: log.affectedCount,
    triggeredBy: log.triggeredBy,
    message: log.message,
    errorStack: log.errorStack,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-aibeop-text">Cron 실행 로그</h1>
          <p className="mt-1 text-sm text-aibeop-subtle">
            SLA / 에스컬레이션 스캔 실행 기록과 실패 원인을 확인합니다.
          </p>
        </div>

        <ManualCronRunner />
      </div>

      <CronLogsTable logs={logs} />
    </div>
  );
}
