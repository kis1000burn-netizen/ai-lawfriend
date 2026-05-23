import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRolePage } from "@/lib/auth/session";
import { OpsQueueAssigneeSelect } from "@/components/admin/alerts/ops-queue/OpsQueueAssigneeSelect";
import { OpsQueueSlaBadge } from "@/components/admin/alerts/ops-queue/OpsQueueSlaBadge";
import { OpsQueueMoveAuditPanel } from "@/components/admin/audit/OpsQueueMoveAuditPanel";

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

const OPS_STATUSES = [
  "OPEN",
  "ACKED",
  "IN_PROGRESS",
  "RESOLVED",
  "CANCELED",
] as const;

function toOpsStatus(status: string): (typeof OPS_STATUSES)[number] {
  return OPS_STATUSES.includes(status as (typeof OPS_STATUSES)[number])
    ? (status as (typeof OPS_STATUSES)[number])
    : "OPEN";
}

export default async function OpsQueueTicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  await requireRolePage("STAFF");
  const { ticketId } = await params;

  const ticket = await prisma.opsQueueTicket.findUnique({
    where: { id: ticketId },
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
      metadata: true,
      createdAt: true,
      updatedAt: true,
      dueAt: true,
      completedAt: true,
      boardColumn: true,
    },
  });

  if (!ticket) notFound();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-aibeop-subtle">관리자 / 경고 / 운영 큐</div>
        <h1 className="mt-1 text-xl font-semibold text-aibeop-text">운영 큐 상세</h1>
        <p className="mt-1 text-sm text-aibeop-subtle">
          티켓 상태와 담당자 배정을 관리합니다.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={ticket.severity} />
          <StatusBadge status={ticket.status} />
          <OpsQueueSlaBadge
            createdAt={ticket.createdAt}
            severity={ticket.severity}
            status={ticket.status}
            dueAt={ticket.dueAt}
            completedAt={ticket.completedAt}
          />
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-aibeop-muted">
            {ticket.boardColumn}
          </span>
        </div>

        <h2 className="mt-4 text-lg font-semibold text-aibeop-text">{ticket.title}</h2>

        {ticket.description ? (
          <p className="mt-2 text-sm text-aibeop-muted">{ticket.description}</p>
        ) : null}

        <div className="mt-4 grid gap-3 text-sm text-aibeop-muted md:grid-cols-2">
          <div>taxonomy: {ticket.taxonomy}</div>
          <div>bulkVariant: {ticket.bulkVariant}</div>
          <div>
            sourceJob:{" "}
            <Link
              href={`/admin/alerts/bulk-jobs/${ticket.sourceJobId}`}
              className="text-aibeop-subtle underline"
            >
              {ticket.sourceJobId}
            </Link>
          </div>
          <div>생성일: {ticket.createdAt.toLocaleString("ko-KR")}</div>
        </div>
      </div>

      <OpsQueueAssigneeSelect
        ticketId={ticket.id}
        currentAssigneeUserId={ticket.assigneeUserId}
        currentStatus={toOpsStatus(ticket.status)}
      />

      <OpsQueueMoveAuditPanel opsQueueTicketId={ticket.id} />
    </div>
  );
}
