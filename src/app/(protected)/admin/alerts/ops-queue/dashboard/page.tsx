import Link from "next/link";
import { requireRolePage } from "@/lib/auth/session";
import { AssigneeWorkloadCharts } from "@/components/admin/alerts/ops-queue/AssigneeWorkloadCharts";
import { OpsQueueWorkloadBoard } from "@/components/admin/alerts/ops-queue/OpsQueueWorkloadBoard";
import { getOpsQueueWorkloadRows } from "@/lib/ops-queue/workload";

export default async function OpsQueueDashboardPage() {
  await requireRolePage("STAFF");
  const rows = await getOpsQueueWorkloadRows();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/alerts/ops-queue"
          className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
        >
          ← 운영 큐 목록
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-aibeop-text">
          운영 큐 워크로드 대시보드
        </h1>
        <p className="mt-1 text-sm text-aibeop-subtle">
          담당자별 티켓 분포와 SLA 초과 상황을 확인합니다.
        </p>
      </div>

      <AssigneeWorkloadCharts />

      <OpsQueueWorkloadBoard rows={rows} />
    </div>
  );
}
