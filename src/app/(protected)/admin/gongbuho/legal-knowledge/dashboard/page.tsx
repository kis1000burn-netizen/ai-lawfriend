import Link from "next/link";
import { LegalKnowledgeIntelligenceDashboardView } from "@/components/admin/gongbuho/legal-knowledge-intelligence-dashboard";
import { deriveLegalKnowledgeAdminCapabilities } from "@/features/gongbuho/admin-gongbuho-legal-knowledge-ui";
import { getLegalKnowledgeIntelligenceDashboard } from "@/features/gongbuho/legal-knowledge-intelligence.service";
import { requireStaffOrPlatformAdminPage } from "@/lib/auth/require-staff-or-platform-admin-page";

export default async function AdminLegalKnowledgeIntelligenceDashboardPage() {
  const sessionUser = await requireStaffOrPlatformAdminPage();
  const caps = deriveLegalKnowledgeAdminCapabilities({ role: sessionUser.role });
  const dashboard = await getLegalKnowledgeIntelligenceDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Legal Knowledge Intelligence</h1>
          <p className="mt-1 text-sm text-slate-600">
            Phase 4-I — Intake·Brief·Review·Packet backlog·전환율·수요 gap·SLA·준수 메타(본문 없음).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/gongbuho/legal-knowledge"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Intake 목록
          </Link>
          {caps.canWriteIntakeOrBrief ? (
            <Link
              href="/admin/gongbuho/legal-knowledge/new"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              + Intake 등록
            </Link>
          ) : null}
        </div>
      </div>

      {caps.staffReadOnlyBanner ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {caps.staffReadOnlyBanner}
        </p>
      ) : null}

      <LegalKnowledgeIntelligenceDashboardView dashboard={dashboard} />
    </div>
  );
}
