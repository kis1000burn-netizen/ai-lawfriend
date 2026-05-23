import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { resolveAlertCaseId } from "@/lib/alerts/deep-link";
import { EscalationListTable } from "@/components/admin/escalations/escalation-list-table";
import type { AlertEscalationLevel, AlertEscalationStatus } from "@prisma/client";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    level?: string;
    q?: string;
  }>;
};

function mapLevel(raw: string | undefined): AlertEscalationLevel | undefined {
  switch (raw) {
    case "0":
      return "NONE";
    case "1":
      return "LEVEL_1";
    case "2":
      return "LEVEL_2";
    case "3":
      return "LEVEL_3";
    default:
      return undefined;
  }
}

export default async function AdminEscalationsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;

  const status = sp.status || "ALL";
  const level = sp.level || "ALL";
  const q = (sp.q || "").trim();
  const levelFilter = level !== "ALL" ? mapLevel(level) : undefined;

  const escalations = await prisma.alertEscalation.findMany({
    where: {
      ...(status !== "ALL" ? { status: status as AlertEscalationStatus } : {}),
      ...(levelFilter ? { level: levelFilter } : {}),
      ...(q
        ? {
            OR: [
              { message: { contains: q, mode: "insensitive" } },
              {
                alertEvent: {
                  title: { contains: q, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      alertEvent: {
        include: {
          rule: { select: { code: true, name: true, severity: true } },
          assigneeUser: { select: { id: true, name: true } },
        },
      },
      releasedBy: { select: { id: true, name: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  const caseIds = escalations
    .map((row) => resolveAlertCaseId(row.alertEvent))
    .filter((id): id is string => Boolean(id));

  const cases =
    caseIds.length > 0
      ? await prisma.case.findMany({
          where: { id: { in: [...new Set(caseIds)] } },
          select: { id: true, title: true },
        })
      : [];

  const caseTitleById = new Map(cases.map((c) => [c.id, c.title]));

  const tableRows = escalations.map((row) => {
    const cid = resolveAlertCaseId(row.alertEvent);
    const caseTitle = cid ? caseTitleById.get(cid) : undefined;
    const caseCell = caseTitle ?? (cid ? cid : "-");
    const ruleText = row.alertEvent.rule
      ? `${row.alertEvent.rule.code} · ${row.alertEvent.rule.name}`
      : "-";

    const clearedLine =
      row.status !== "PENDING" && row.clearedAt
        ? `${new Date(row.clearedAt).toLocaleString("ko-KR")} / ${row.releasedBy?.name ?? "-"}`
        : row.status !== "PENDING"
          ? "-"
          : null;

    return {
      id: row.id,
      status: row.status,
      level: row.level,
      alertTitle: row.alertEvent.title,
      message: row.message,
      caseCell,
      ruleText,
      assigneeName: row.alertEvent.assigneeUser?.name ?? "미배정",
      createdAt: new Date(row.createdAt).toLocaleString("ko-KR"),
      clearedLine,
      pending: row.status === "PENDING",
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-aibeop-text">에스컬레이션 이력</h1>
        <p className="mt-1 text-sm text-aibeop-subtle">
          PENDING·SENT·CLEARED 상태와 수동 해제(정리) 이력을 확인합니다.
        </p>
      </div>

      <form
        className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        method="get"
      >
        <select
          name="status"
          defaultValue={status}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="ALL">전체 상태</option>
          <option value="PENDING">PENDING</option>
          <option value="SENT">SENT</option>
          <option value="CLEARED">CLEARED</option>
        </select>
        <select
          name="level"
          defaultValue={level}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="ALL">전체 레벨</option>
          <option value="0">L0</option>
          <option value="1">L1</option>
          <option value="2">L2</option>
          <option value="3">L3</option>
        </select>
        <input
          name="q"
          defaultValue={q}
          placeholder="검색"
          className="min-w-[200px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          적용
        </button>
        <Link
          href="/admin/alerts/board"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-aibeop-subtle"
        >
          보드로
        </Link>
      </form>

      <EscalationListTable rows={tableRows} />
    </div>
  );
}
