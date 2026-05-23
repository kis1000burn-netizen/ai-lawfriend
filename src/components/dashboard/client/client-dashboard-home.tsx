import { ClientCaseReadinessCard } from "@/components/dashboard/client/client-case-readiness-card";
import { ClientDashboardEmptyGuide } from "@/components/dashboard/client/client-dashboard-empty-guide";
import { ClientRecentCasesPreview } from "@/components/dashboard/client/client-recent-cases-preview";
import { ClientDashboardPermissionNote } from "@/components/dashboard/client/client-dashboard-permission-note";
import { ClientNextActions } from "@/components/dashboard/client/client-next-actions";
import { ClientTrustPanel } from "@/components/dashboard/client/client-trust-panel";
import { DashboardLivingHeader } from "@/components/dashboard/dashboard-living-header";
import { DashboardSectionHeading } from "@/components/dashboard/dashboard-section-heading";
import { shouldShowClientEmptyGuide } from "@/lib/dashboard/dashboard-empty-state";
import {
  EMPTY_CLIENT_DASHBOARD_METRICS,
  type ClientDashboardMetrics,
} from "@/lib/dashboard/dashboard-metrics";

type Props = {
  metrics?: ClientDashboardMetrics;
};

export function ClientDashboardHome({
  metrics = EMPTY_CLIENT_DASHBOARD_METRICS,
}: Props) {
  const showEmptyGuide = shouldShowClientEmptyGuide(metrics);

  const statusText =
    metrics.totalCases === 0
      ? "오늘 할 일: 사건의 흐름을 차근차근 정리해 보세요."
      : `현재 사건 ${metrics.totalCases}건 중 ${metrics.activeCases}건이 진행 중입니다.`;

  return (
    <div className="grid gap-8 md:gap-10">
      <DashboardLivingHeader
        role="client"
        statusText={statusText}
      />

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
        <ClientCaseReadinessCard readiness={metrics.readiness} />

        <div>
          <DashboardSectionHeading
            eyebrow="Next Actions"
            title="다음에 할 일을 바로 시작하세요."
            description="사건 생성, 인터뷰 이어하기, 첨부자료 정리로 자연스럽게 이동합니다."
          />
          <ClientNextActions guidanceCaseHref={metrics.guidanceCaseHref} />
        </div>
      </section>

      {!showEmptyGuide && (
        <ClientRecentCasesPreview items={metrics.recentCasesPreview} />
      )}

      {showEmptyGuide && <ClientDashboardEmptyGuide />}
      <ClientDashboardPermissionNote />
      <ClientTrustPanel />
    </div>
  );
}
