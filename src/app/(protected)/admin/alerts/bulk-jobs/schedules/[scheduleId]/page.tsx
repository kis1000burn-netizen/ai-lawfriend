import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { ScheduleActionControls } from "@/components/admin/alerts/bulk-jobs/ScheduleActionControls";

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

export default async function BulkJobScheduleDetailPage({
  params,
}: {
  params: Promise<{ scheduleId: string }>;
}) {
  await requireAdmin();
  const { scheduleId } = await params;

  const schedule = await prisma.bulkActionSchedule.findUnique({
    where: { id: scheduleId },
    select: {
      id: true,
      sourceJobId: true,
      taxonomy: true,
      bulkVariant: true,
      status: true,
      scheduledFor: true,
      note: true,
      createdRetryJobId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!schedule) notFound();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-aibeop-subtle">관리자 / 경고 / Bulk Jobs / 예약 재시도</div>
        <h1 className="mt-1 text-xl font-semibold text-aibeop-text">예약 재시도 상세</h1>
        <p className="mt-1 text-sm text-aibeop-subtle">
          예약 상태 확인, 취소, 재예약을 수행합니다.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <StatusBadge status={schedule.status} />
        </div>

        <div className="mt-4 grid gap-3 text-sm text-aibeop-muted md:grid-cols-2">
          <div>
            sourceJob:{" "}
            <Link
              href={`/admin/alerts/bulk-jobs/${schedule.sourceJobId}`}
              className="text-aibeop-subtle underline"
            >
              {schedule.sourceJobId}
            </Link>
          </div>
          <div>taxonomy: {schedule.taxonomy}</div>
          <div>액션: {schedule.bulkVariant}</div>
          <div>실행 예정: {schedule.scheduledFor.toLocaleString("ko-KR")}</div>
          <div>생성일: {schedule.createdAt.toLocaleString("ko-KR")}</div>
          <div>수정일: {schedule.updatedAt.toLocaleString("ko-KR")}</div>
          <div className="md:col-span-2">
            생성된 retryJob:{" "}
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
          </div>
          {schedule.note ? (
            <div className="md:col-span-2">메모: {schedule.note}</div>
          ) : null}
        </div>
      </div>

      <ScheduleActionControls
        scheduleId={schedule.id}
        status={schedule.status}
        scheduledFor={schedule.scheduledFor.toISOString()}
        note={schedule.note}
      />
    </div>
  );
}
