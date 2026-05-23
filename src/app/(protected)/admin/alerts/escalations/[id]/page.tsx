import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { resolveAlertCaseId } from "@/lib/alerts/deep-link";
import { ReleaseEscalationButton } from "@/components/admin/escalations/release-escalation-button";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEscalationDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const escalation = await prisma.alertEscalation.findUnique({
    where: { id },
    include: {
      alertEvent: {
        include: {
          rule: true,
          assigneeUser: true,
          escalations: { orderBy: { createdAt: "desc" } },
        },
      },
      releasedBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!escalation) {
    notFound();
  }

  const caseId = resolveAlertCaseId(escalation.alertEvent);
  const caseRow = caseId
    ? await prisma.case.findUnique({
        where: { id: caseId },
        select: { id: true, title: true, status: true },
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-aibeop-text">에스컬레이션 상세</h1>
          <p className="mt-1 text-sm text-aibeop-subtle">{escalation.id}</p>
        </div>
        <Link
          href="/admin/alerts/escalations"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-aibeop-subtle"
        >
          목록
        </Link>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <div>
          <div className="text-xs text-aibeop-subtle">상태</div>
          <div className="mt-1 font-medium">{escalation.status}</div>
        </div>
        <div>
          <div className="text-xs text-aibeop-subtle">레벨</div>
          <div className="mt-1 font-medium">{escalation.level}</div>
        </div>
        <div className="md:col-span-2">
          <div className="text-xs text-aibeop-subtle">메시지</div>
          <div className="mt-1 whitespace-pre-wrap text-aibeop-text">{escalation.message}</div>
        </div>
        {escalation.releaseReason ? (
          <div className="md:col-span-2">
            <div className="text-xs text-aibeop-subtle">해제 사유</div>
            <div className="mt-1 text-aibeop-text">{escalation.releaseReason}</div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-aibeop-text">연결 경고</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div>
            <span className="text-aibeop-subtle">제목: </span>
            {escalation.alertEvent.title}
          </div>
          <div>
            <span className="text-aibeop-subtle">규칙: </span>
            {escalation.alertEvent.rule
              ? `${escalation.alertEvent.rule.code} · ${escalation.alertEvent.rule.name}`
              : "-"}
          </div>
          <div>
            <span className="text-aibeop-subtle">사건: </span>
            {caseRow ? (
              <Link href={`/cases/${caseRow.id}`} className="text-blue-700 underline">
                {caseRow.title}
              </Link>
            ) : (
              "-"
            )}
          </div>
        </div>
      </div>

      {escalation.status === "PENDING" ? (
        <ReleaseEscalationButton escalationId={escalation.id} />
      ) : null}
    </div>
  );
}
