import type { LegalKnowledgeIntakeStatus } from "@prisma/client";
import { LegalKnowledgeIntakeList } from "@/components/admin/gongbuho/legal-knowledge-intake-list";
import { LegalKnowledgeIntakeListFilters } from "@/components/admin/gongbuho/legal-knowledge-intake-list-filters";
import { deriveLegalKnowledgeAdminCapabilities } from "@/features/gongbuho/admin-gongbuho-legal-knowledge-ui";
import { listLegalKnowledgeIntakes } from "@/features/gongbuho/legal-knowledge-pipeline.service";
import { requireStaffOrPlatformAdminPage } from "@/lib/auth/require-staff-or-platform-admin-page";
import Link from "next/link";

type PageProps = {
  searchParams?: Promise<Partial<Record<string, string | string[] | undefined>>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminLegalKnowledgeIntakeListPage({
  searchParams,
}: PageProps) {
  const sessionUser = await requireStaffOrPlatformAdminPage();
  const caps = deriveLegalKnowledgeAdminCapabilities({ role: sessionUser.role });

  const sp = searchParams ? await searchParams : {};
  const statusRaw = firstParam(sp.status)?.trim();
  const status = statusRaw as LegalKnowledgeIntakeStatus | undefined;

  const rows = await listLegalKnowledgeIntakes(status ? { status } : undefined);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-aibeop-text">Legal Knowledge Intake</h1>
          <p className="mt-1 text-sm text-aibeop-muted">
            수요 후보(Intake) · Research Brief · Lawyer Review · 패킷 컴파일 파이프라인 운영
            화면입니다. UGC 원문은 저장·표시하지 않습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/gongbuho/legal-knowledge/dashboard"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
            data-testid="legal-knowledge-intelligence-dashboard-link"
          >
            Intelligence
          </Link>
          {caps.canWriteIntakeOrBrief ? (
            <Link
              href="/admin/gongbuho/legal-knowledge/new"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              data-testid="legal-knowledge-intake-new-link"
            >
              + Intake 등록
            </Link>
          ) : null}
          <Link
            href="/admin/gongbuho"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
          >
            공부호 패킷
          </Link>
        </div>
      </div>

      {caps.staffReadOnlyBanner ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {caps.staffReadOnlyBanner}
        </p>
      ) : null}

      <LegalKnowledgeIntakeListFilters currentStatus={statusRaw ?? ""} />

      <LegalKnowledgeIntakeList
        items={rows.map((r) => ({
          id: r.id,
          status: r.status,
          demandStrength: r.demandStrength,
          querySignature: r.querySignature,
          caseTypeMapping: r.caseTypeMapping,
          updatedAt: r.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
