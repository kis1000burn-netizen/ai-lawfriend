import Link from "next/link";
import { notFound } from "next/navigation";
import { CmbConfigPreviewPanel } from "@/components/admin/cmb/cmb-config-preview-panel";
import { CmbPublishLockPanel } from "@/components/admin/cmb/cmb-publish-lock-panel";
import { buildCmbAdminCasePreview } from "@/cmb/admin/cmb-admin-preview";
import { buildCmbPublishLockPanel } from "@/cmb/publish/cmb-publish-lock.service";
import { requireStaffOrPlatformAdminPage } from "@/lib/auth/require-staff-or-platform-admin-page";

type Props = {
  params: Promise<{ caseType: string }>;
};

export default async function AdminCmbCaseTypePreviewPage({ params }: Props) {
  const user = await requireStaffOrPlatformAdminPage();
  const { caseType } = await params;
  const decoded = decodeURIComponent(caseType);
  const preview = buildCmbAdminCasePreview(decoded);

  if (!preview) {
    notFound();
  }

  const publishPanel = await buildCmbPublishLockPanel(decoded, user);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/cmb"
        className="inline-flex rounded-xl border border-aibeop-line bg-aibeop-surface px-4 py-2 text-sm font-semibold text-aibeop-deep hover:bg-aibeop-soft"
      >
        ← CMB 목록
      </Link>

      <CmbPublishLockPanel panel={publishPanel} />

      <CmbConfigPreviewPanel preview={preview} />
    </div>
  );
}
