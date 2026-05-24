import { DashboardStatePanel } from "@/components/dashboard/dashboard-state-panel";

export function LawyerDashboardEmptyGuide() {
  return (
    <DashboardStatePanel
      variant="info"
      title="현재 검토 대기 사건이 없습니다."
      description="인터뷰가 완료되거나 문서 초안이 준비된 사건이 생기면 이 공간에 검토 큐로 표시됩니다."
      action={{
        href: "/cases",
        label: "전체 사건 보기",
      }}
    />
  );
}
