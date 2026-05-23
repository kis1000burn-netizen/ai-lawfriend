import Link from "next/link";
import { requireRolePage } from "@/lib/auth/session";
import { OpsQueueKanbanBoard } from "@/components/admin/alerts/ops-queue/OpsQueueKanbanBoard";
import { OpsQueueRebalanceRecommendationCard } from "@/components/admin/alerts/ops-queue/OpsQueueRebalanceRecommendationCard";
import { canApplyRebalance } from "@/lib/auth/ops-queue-permissions";

export default async function OpsQueueBoardPage() {
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
        <Link
          href="/admin/alerts/ops-queue/settings"
          className="text-sm text-aibeop-muted underline hover:text-aibeop-text"
        >
          운영 큐 설정
        </Link>
        <Link
          href="/admin/alerts/ops-dashboard"
          className="text-sm text-aibeop-muted underline hover:text-aibeop-text"
        >
          운영 대시보드
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-aibeop-text">운영 큐 칸반 보드</h1>
        <p className="text-sm text-aibeop-subtle">
          재분배 추천 실행, 상세 슬라이드오버(감사로그·타임라인·알림 탭), 기한 프리셋, 필터·WIP 경고를 포함합니다.
        </p>
      </div>

      <OpsQueueRebalanceRecommendationCard canApply={canApplyRebalance(user.role)} />
      <OpsQueueKanbanBoard currentUserRole={user.role} />
    </div>
  );
}
