import Link from "next/link";
import { OpsQueueWipSettingsCard } from "@/components/admin/alerts/ops-queue/OpsQueueWipSettingsCard";
import { requireRolePage } from "@/lib/auth/session";
import { canManageWipSettings } from "@/lib/auth/ops-queue-permissions";

export default async function OpsQueueSettingsPage() {
  const user = await requireRolePage("STAFF");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/alerts/ops-queue"
          className="text-sm text-aibeop-muted underline hover:text-aibeop-text"
        >
          ← 운영 큐 목록
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-aibeop-text">운영 큐 설정</h1>
        <p className="text-sm text-aibeop-subtle">
          WIP limit 등 운영 큐 관련 관리자 설정을 관리합니다.
        </p>
      </div>

      <OpsQueueWipSettingsCard canManageWip={canManageWipSettings(user.role)} />
    </div>
  );
}
