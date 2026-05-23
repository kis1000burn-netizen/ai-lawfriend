import Link from "next/link";
import { redirect } from "next/navigation";
import { LegalKnowledgeIntakeCreatePanel } from "@/components/admin/gongbuho/legal-knowledge-intake-create-panel";
import { deriveLegalKnowledgeAdminCapabilities } from "@/features/gongbuho/admin-gongbuho-legal-knowledge-ui";
import { requireStaffOrPlatformAdminPage } from "@/lib/auth/require-staff-or-platform-admin-page";

export default async function AdminLegalKnowledgeIntakeNewPage() {
  const sessionUser = await requireStaffOrPlatformAdminPage();
  const caps = deriveLegalKnowledgeAdminCapabilities({ role: sessionUser.role });

  if (!caps.canWriteIntakeOrBrief) {
    redirect("/admin/gongbuho/legal-knowledge");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Intake 등록</h1>
          <p className="mt-1 text-sm text-slate-600">
            Legal Knowledge 수요 후보를 관리자 UI에서 직접 생성합니다.
          </p>
        </div>
        <Link
          href="/admin/gongbuho/legal-knowledge"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          ← Intake 목록
        </Link>
      </div>

      <LegalKnowledgeIntakeCreatePanel viewerCanWrite={caps.canWriteIntakeOrBrief} />
    </div>
  );
}
