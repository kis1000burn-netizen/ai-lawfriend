import Link from "next/link";
import { RetryJobsTable } from "@/components/admin/operations/retry-jobs-table";
import {
  listRetryJobsService,
  syncFailedCronLogsToRetryJobs,
} from "@/features/platform/reliability/retry-job.service";
import { syncFailedExternalMessagesToRetryJobs } from "@/features/platform/reliability/external-message-redelivery.service";
import { syncFailedDocumentPipelineJobs } from "@/features/platform/reliability/document-pipeline-recovery.service";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminRetryJobsPage() {
  const user = await requireAdmin();
  const [cronSync, externalSync, pipelineSync] = await Promise.all([
    syncFailedCronLogsToRetryJobs(50),
    syncFailedExternalMessagesToRetryJobs(50),
    syncFailedDocumentPipelineJobs(50),
  ]);
  const list = await listRetryJobsService(user, { page: 1, pageSize: 50 });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-aibeop-muted">
          Phase 18-A / 18-B / 18-C / 18-D / 18-E — Retry Queue
        </p>
        <h1 className="text-2xl font-bold text-aibeop-deep">실패 작업 복구</h1>
        <p className="text-sm text-aibeop-muted">
          실패한 작업은 사라지지 않습니다. 운영자가 원인을 확인하고, 안전한 작업만 재시도 큐에
          넣을 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/admin/operations/monitoring" className="text-aibeop-accent hover:underline">
            Ops Console
          </Link>
          <Link href="/admin/cron" className="text-aibeop-accent hover:underline">
            Cron 로그
          </Link>
        </div>
      </header>

      <RetryJobsTable
        items={list.items}
        syncSummary={{
          scanned: cronSync.scanned + externalSync.scanned + pipelineSync.scanned,
          created: cronSync.created + externalSync.created + pipelineSync.created,
        }}
      />
    </div>
  );
}
