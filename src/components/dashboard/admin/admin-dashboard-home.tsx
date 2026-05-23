import { AdminControlGrid } from "@/components/dashboard/admin/admin-control-grid";
import { AdminDashboardEmptyGuide } from "@/components/dashboard/admin/admin-dashboard-empty-guide";
import { AdminDashboardPermissionNote } from "@/components/dashboard/admin/admin-dashboard-permission-note";
import { AdminOperationsRadar } from "@/components/dashboard/admin/admin-operations-radar";
import { AdminRiskBoard } from "@/components/dashboard/admin/admin-risk-board";
import { AdminStatusDistributionBar } from "@/components/dashboard/admin/admin-status-distribution-bar";
import { DashboardLivingHeader } from "@/components/dashboard/dashboard-living-header";
import { DashboardSectionHeading } from "@/components/dashboard/dashboard-section-heading";
import { shouldShowAdminEmptyGuide } from "@/lib/dashboard/dashboard-empty-state";
import {
  EMPTY_ADMIN_DASHBOARD_METRICS,
  type AdminDashboardMetrics,
} from "@/lib/dashboard/dashboard-metrics";

type Props = {
  metrics?: AdminDashboardMetrics;
};

export function AdminDashboardHome({
  metrics = EMPTY_ADMIN_DASHBOARD_METRICS,
}: Props) {
  const showEmptyGuide = shouldShowAdminEmptyGuide(metrics);

  return (
    <div className="grid gap-8 md:gap-10">
      <DashboardLivingHeader
        role="admin"
        statusText="운영 흐름, 권한, 승인, 운영 확인이 필요한 항목을 한곳에서 봅니다."
      />

      <section>
        <DashboardSectionHeading
          eyebrow="Operations"
          title="운영 상태 요약"
          description="전체 사건과 검토·승인·운영 확인 항목을 한눈에 확인합니다."
        />
        <AdminOperationsRadar metrics={metrics} />
      </section>

      <AdminStatusDistributionBar statusBreakdown={metrics.statusBreakdown} />

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
        <AdminRiskBoard
          attentionNeeded={metrics.attentionNeeded}
          staleCaseCount={metrics.staleCaseCount}
          items={metrics.attentionPreview}
          showPreviewEmpty={!showEmptyGuide}
        />

        <div>
          <DashboardSectionHeading
            eyebrow="Control"
            title="관리 작업 바로가기"
          />
          <AdminControlGrid />
        </div>
      </section>

      {showEmptyGuide && <AdminDashboardEmptyGuide />}
      <AdminDashboardPermissionNote />
    </div>
  );
}
