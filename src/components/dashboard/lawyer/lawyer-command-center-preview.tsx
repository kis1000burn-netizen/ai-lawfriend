import Link from "next/link";
import { DashboardPreviewCard } from "@/components/dashboard/dashboard-preview-card";
import { DashboardPreviewEmpty } from "@/components/dashboard/dashboard-preview-empty";
import type { LitigationCommandCenterListSummary } from "@/features/document-intelligence/litigation-command-center-list-summary.schema";

export const LAWYER_COMMAND_CENTER_PREVIEW_MARKER_PHASE14D =
  "phase14d-lawyer-command-center-preview" as const;

type PreviewItem = LitigationCommandCenterListSummary & {
  caseTitle: string;
};

type Props = {
  items: PreviewItem[];
};

function buildPreviewReason(item: PreviewItem): string {
  const parts: string[] = [];
  if (item.isDeadlineImminent && item.nextDeadlineTitle) {
    parts.push(`기일 임박: ${item.nextDeadlineTitle}`);
  }
  if (item.todayTaskCount > 0) {
    parts.push(`오늘 업무 ${item.todayTaskCount}건`);
  }
  if (item.reviewPendingCount > 0) {
    parts.push(`검토 대기 ${item.reviewPendingCount}건`);
  }
  if (item.supplementDraftCount > 0) {
    parts.push(`보완 DRAFT ${item.supplementDraftCount}건`);
  }
  if (item.hasOpponentBriefAnalysis) {
    parts.push(`상대방 서면 분석 ${item.opponentBriefAnalyzedCount}건`);
  }
  return parts.length > 0 ? parts.join(" · ") : "소송 지휘실에서 우선순위를 확인하세요.";
}

export function LawyerCommandCenterPreview({ items }: Props) {
  return (
    <div
      className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 shadow-sm sm:rounded-3xl sm:p-6"
      data-testid="lawyer-command-center-preview"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-indigo-900">Litigation Command Center</p>
          <h3 className="mt-1 text-lg font-black text-slate-900 sm:text-xl">
            우선 확인 사건
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            기일·업무·검토·보완·상대방 서면 상태를 한눈에 보고 지휘실로 바로 이동합니다.
          </p>
        </div>
        <Link
          href="/cases"
          className="text-sm font-bold text-indigo-800 underline hover:text-indigo-950"
        >
          전체 사건 →
        </Link>
      </div>

      {items.length > 0 ? (
        <ul className="mt-5 grid gap-3">
          {items.map((item) => (
            <DashboardPreviewCard
              key={item.caseId}
              title={item.caseTitle}
              href={`/cases/${item.caseId}/litigation-command-center`}
              ctaLabel="소송 지휘실 열기"
              status={item.phaseLabel ?? undefined}
              statusLabel={item.phaseLabel ?? undefined}
              tone="indigo"
              badgeLabel={item.priorityLabel}
              badgeTone={item.isDeadlineImminent ? "amber" : "cyan"}
              reason={buildPreviewReason(item)}
            />
          ))}
        </ul>
      ) : (
        <DashboardPreviewEmpty message="우선 확인할 소송 지휘실 사건이 없습니다. 인터뷰가 완료된 사건에서 기일·업무·검토 항목이 생기면 표시됩니다." />
      )}
    </div>
  );
}
