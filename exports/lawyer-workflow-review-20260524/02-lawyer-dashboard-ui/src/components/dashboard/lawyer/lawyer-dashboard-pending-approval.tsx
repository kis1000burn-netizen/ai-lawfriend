import { DashboardRestrictedState } from "@/components/dashboard/dashboard-restricted-state";

type Props = {
  isPending?: boolean;
};

export function LawyerDashboardPendingApproval({ isPending = false }: Props) {
  if (!isPending) {
    return null;
  }

  return (
    <DashboardRestrictedState
      title="변호사 계정 승인이 필요합니다."
      description="관리자 승인이 완료되면 사건 검토, 문서 초안 확인, 보완 요청 기능을 사용할 수 있습니다."
      actionHref="/dashboard"
      actionLabel="기본 작업 공간으로 이동"
      secondaryHref="/guide"
      secondaryLabel="승인 절차 보기"
    />
  );
}
