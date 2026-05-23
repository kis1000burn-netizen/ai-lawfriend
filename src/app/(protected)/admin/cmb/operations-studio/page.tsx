import Link from "next/link";
import { CmbOperationsStudioDashboardView } from "@/components/admin/cmb/cmb-operations-studio-dashboard";
import { getCmbOperationsStudioDashboard } from "@/cmb/ops/cmb-operations-studio.service";
import { requireStaffOrPlatformAdminPage } from "@/lib/auth/require-staff-or-platform-admin-page";

export default async function AdminCmbOperationsStudioPage() {
  await requireStaffOrPlatformAdminPage();
  const dashboard = await getCmbOperationsStudioDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-aibeop-text">CMB Operations Studio</h1>
          <p className="mt-2 text-sm leading-6 text-aibeop-muted">
            Phase 6-H — revision backlog · publish event · status queue · caseType 커버리지(본문 configJson
            미노출).
          </p>
        </div>
        <Link
          href="/admin/cmb"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          CMB Preview
        </Link>
      </div>

      <CmbOperationsStudioDashboardView dashboard={dashboard} />
    </div>
  );
}
