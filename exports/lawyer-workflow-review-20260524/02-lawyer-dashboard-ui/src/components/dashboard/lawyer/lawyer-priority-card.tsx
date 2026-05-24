import { DashboardActionCard } from "@/components/dashboard/dashboard-action-card";

export function LawyerPriorityCard() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <DashboardActionCard
        label="Review"
        title="검토 대기 사건 보기"
        description="인터뷰가 완료된 사건을 확인하고 쟁점과 자료를 검토합니다."
        href="/cases"
        ctaLabel="사건 목록 열기 →"
      />
      <DashboardActionCard
        label="Draft"
        title="문서 초안 검토"
        description="사건 목록에서 문서·초안을 열어 필요한 문단을 보완합니다."
        href="/cases"
        ctaLabel="문서·초안 보러 가기 →"
      />
      <DashboardActionCard
        label="Request"
        title="보완 요청 관리"
        description="의뢰인에게 필요한 자료나 진술 보완을 요청합니다."
        href="/cases"
        ctaLabel="보완·사건 열기 →"
      />
      <DashboardActionCard
        label="Timeline"
        title="최근 사건 흐름"
        description="변호사 포털과 사건 목록에서 최근 변경을 확인합니다."
        href="/lawyer"
        ctaLabel="포털로 돌아가기 →"
      />
    </div>
  );
}
