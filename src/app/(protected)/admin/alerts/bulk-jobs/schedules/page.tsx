import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { BulkScheduleControls } from "@/components/admin/alerts/bulk-jobs/BulkScheduleControls";

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "PENDING"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : status === "CLAIMED"
        ? "border-violet-200 bg-violet-50 text-violet-700"
        : status === "DONE"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : status === "FAILED"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : status === "CANCELED"
              ? "border-slate-200 bg-slate-50 text-aibeop-muted"
              : "border-slate-200 bg-slate-50 text-aibeop-muted";

  return (
    <span className={`rounded-lg border px-2 py-1 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default async function BulkJobSchedulesPage() {
  await requireAdmin();

  const schedules = await prisma.bulkActionSchedule.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      sourceJobId: true,
      taxonomy: true,
      bulkVariant: true,
      status: true,
      scheduledFor: true,
      createdRetryJobId: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-aibeop-text">예약 재시도</h1>
        <p className="mt-1 text-sm text-aibeop-subtle">
          추천 액션의 대기 후 재시도 요청 목록입니다.
        </p>
      </div>

      <BulkScheduleControls
        schedules={schedules.map((s) => ({
          id: s.id,
          status: s.status,
        }))}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-aibeop-muted">sourceJob</th>
              <th className="px-4 py-3 text-left font-medium text-aibeop-muted">taxonomy</th>
              <th className="px-4 py-3 text-left font-medium text-aibeop-muted">액션</th>
              <th className="px-4 py-3 text-left font-medium text-aibeop-muted">상태</th>
              <th className="px-4 py-3 text-left font-medium text-aibeop-muted">실행 예정</th>
              <th className="px-4 py-3 text-left font-medium text-aibeop-muted">생성된 retryJob</th>
              <th className="px-4 py-3 text-left font-medium text-aibeop-muted">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/alerts/bulk-jobs/${schedule.sourceJobId}`}
                    className="text-aibeop-subtle underline"
                  >
                    {schedule.sourceJobId}
                  </Link>
                </td>
                <td className="px-4 py-3">{schedule.taxonomy}</td>
                <td className="px-4 py-3">{schedule.bulkVariant}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={schedule.status} />
                </td>
                <td className="px-4 py-3">
                  {schedule.scheduledFor.toLocaleString("ko-KR")}
                </td>
                <td className="px-4 py-3">
                  {schedule.createdRetryJobId ? (
                    <Link
                      href={`/admin/alerts/bulk-jobs/${schedule.createdRetryJobId}`}
                      className="text-aibeop-subtle underline"
                    >
                      {schedule.createdRetryJobId}
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/alerts/bulk-jobs/schedules/${schedule.id}`}
                    className="text-aibeop-subtle underline"
                  >
                    관리
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
