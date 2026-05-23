import { requireRolePage } from "@/lib/auth/session";
import { OpsDashboardOverview } from "@/components/admin/alerts/ops-dashboard/OpsDashboardOverview";

export default async function OpsDashboardPage() {
  await requireRolePage("STAFF");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-aibeop-text">운영 대시보드</h1>
        <p className="mt-1 text-sm text-aibeop-subtle">
          WIP 경고, 워크로드, 재분배 추천, 최근 이력을 통합한 운영 현황 화면입니다.
        </p>
      </div>

      <OpsDashboardOverview />
    </div>
  );
}
