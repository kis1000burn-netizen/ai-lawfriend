import Link from "next/link";
import { CmbConfigList } from "@/components/admin/cmb/cmb-config-list";
import { CmbVerifySummaryPanel } from "@/components/admin/cmb/cmb-verify-summary-panel";
import { CmbBaselineSyncButton } from "@/components/admin/cmb/cmb-baseline-sync-button";
import {
  buildCmbAdminGlobalVerifySummary,
  listCmbAdminListItems,
} from "@/cmb/admin/cmb-admin-preview";
import { requireStaffOrPlatformAdminPage } from "@/lib/auth/require-staff-or-platform-admin-page";

export default async function AdminCmbPage() {
  const user = await requireStaffOrPlatformAdminPage();

  const items = listCmbAdminListItems();
  const verifySummary = buildCmbAdminGlobalVerifySummary();
  const canSync = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-aibeop-text">CMB Layer Preview</h1>
          <p className="mt-2 text-sm leading-6 text-aibeop-muted">
            사건 유형(CaseType)별 CMB 구성 — 질문셋 · 문서템플릿 · 공부호 · Voice gate · UI block을{" "}
            <strong>preview</strong> 확인합니다. Phase 6-F Publish/Lock은 revision 상세에서
            전이합니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/cmb/operations-studio"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            data-testid="cmb-operations-studio-link"
          >
            Operations Studio
          </Link>
          <CmbBaselineSyncButton canSync={canSync} />
        </div>
      </div>

      <CmbVerifySummaryPanel summary={verifySummary} />

      <CmbConfigList items={items} />

      <p className="text-xs text-aibeop-muted">
        문서:{" "}
        <code className="font-mono">docs/cmb/AIBEOPCHIN_CMB_ADMIN_POLICY.md</code> · 배포 전:{" "}
        <code className="font-mono">npm run verify:aibeopchin-cmb</code>
      </p>
    </div>
  );
}
