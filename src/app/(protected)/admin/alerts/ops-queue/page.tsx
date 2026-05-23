import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRolePage } from "@/lib/auth/session";
import { OpsQueueSlaBadge } from "@/components/admin/alerts/ops-queue/OpsQueueSlaBadge";

function SeverityBadge({ severity }: { severity: string }) {
  const cls =
    severity === "HIGH" || severity === "CRITICAL"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : severity === "MEDIUM"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <span className={`rounded-lg border px-2 py-1 text-xs font-medium ${cls}`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "OPEN"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : status === "ACKED"
        ? "border-violet-200 bg-violet-50 text-violet-700"
        : status === "IN_PROGRESS"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : status === "RESOLVED"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : status === "CANCELED"
              ? "border-slate-200 bg-slate-50 text-aibeop-muted"
              : "border-slate-200 bg-slate-50 text-aibeop-muted";

  return (
    <span className={`rounded-lg border px-2 py-1 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default async function OpsQueuePage() {
  await requireRolePage("STAFF");

  const tickets = await prisma.opsQueueTicket.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      sourceJobId: true,
      taxonomy: true,
      bulkVariant: true,
      title: true,
      description: true,
      severity: true,
      status: true,
      assigneeUserId: true,
      createdAt: true,
      dueAt: true,
      completedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-aibeop-text">운영 큐</h1>
          <p className="mt-1 text-sm text-aibeop-subtle">
            추천 액션에서 생성된 운영 점검/권한 점검/수동 검토 티켓입니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/alerts/ops-queue/dashboard"
            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
          >
            워크로드 보드
          </Link>
          <Link
            href="/admin/alerts/ops-queue/board"
            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
          >
            칸반 보드
          </Link>
          <Link
            href="/admin/alerts/ops-queue/settings"
            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
          >
            운영 큐 설정
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-aibeop-muted">제목</th>
              <th className="px-4 py-3 text-left font-medium text-aibeop-muted">심각도</th>
              <th className="px-4 py-3 text-left font-medium text-aibeop-muted">상태</th>
              <th className="px-4 py-3 text-left font-medium text-aibeop-muted">SLA</th>
              <th className="px-4 py-3 text-left font-medium text-aibeop-muted">taxonomy</th>
              <th className="px-4 py-3 text-left font-medium text-aibeop-muted">담당자</th>
              <th className="px-4 py-3 text-left font-medium text-aibeop-muted">sourceJob</th>
              <th className="px-4 py-3 text-left font-medium text-aibeop-muted">생성일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/alerts/ops-queue/${ticket.id}`}
                    className="font-medium text-aibeop-text underline"
                  >
                    {ticket.title}
                  </Link>
                  {ticket.description ? (
                    <div className="mt-1 text-xs text-aibeop-subtle">{ticket.description}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <SeverityBadge severity={ticket.severity} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-4 py-3">
                  <OpsQueueSlaBadge
                    createdAt={ticket.createdAt}
                    severity={ticket.severity}
                    status={ticket.status}
                    dueAt={ticket.dueAt}
                    completedAt={ticket.completedAt}
                  />
                </td>
                <td className="px-4 py-3">{ticket.taxonomy}</td>
                <td className="px-4 py-3">
                  {ticket.assigneeUserId ? ticket.assigneeUserId : "-"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/alerts/bulk-jobs/${ticket.sourceJobId}`}
                    className="text-aibeop-subtle underline"
                  >
                    {ticket.sourceJobId}
                  </Link>
                </td>
                <td className="px-4 py-3">{ticket.createdAt.toLocaleString("ko-KR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
