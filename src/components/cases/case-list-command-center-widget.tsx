import Link from "next/link";
import type { LitigationCommandCenterListSummary } from "@/features/document-intelligence/litigation-command-center-list-summary.schema";

export const CASE_LIST_COMMAND_CENTER_WIDGET_MARKER_PHASE14D =
  "phase14d-case-list-command-center-widget" as const;

type Props = {
  caseId: string;
  caseTitle: string;
  summary: LitigationCommandCenterListSummary | null | undefined;
};

function StatPill({
  label,
  value,
  tone = "slate",
  testId,
}: {
  label: string;
  value: string | number;
  tone?: "rose" | "amber" | "indigo" | "slate" | "purple";
  testId?: string;
}) {
  const toneClass =
    tone === "rose"
      ? "bg-rose-50 text-rose-900 ring-rose-200"
      : tone === "amber"
        ? "bg-amber-50 text-amber-950 ring-amber-200"
        : tone === "indigo"
          ? "bg-indigo-50 text-indigo-950 ring-indigo-200"
          : tone === "purple"
            ? "bg-purple-50 text-purple-900 ring-purple-200"
            : "bg-slate-50 text-slate-700 ring-slate-200";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${toneClass}`}
      data-testid={testId}
    >
      {label ? `${label} ${value}` : value}
    </span>
  );
}

export function CaseListCommandCenterWidget({ caseId, caseTitle, summary }: Props) {
  if (!summary?.eligible) {
    return (
      <span className="text-xs text-slate-400" data-testid={`lcc-list-widget-${caseId}-inactive`}>
        인터뷰 후 이용
      </span>
    );
  }

  const deadlineLabel =
    summary.daysUntilNextDeadline !== null && summary.daysUntilNextDeadline !== undefined
      ? summary.isDeadlineImminent
        ? `D-${summary.daysUntilNextDeadline}`
        : summary.nextDeadlineTitle
          ? `D-${summary.daysUntilNextDeadline}`
          : null
      : null;

  return (
    <div
      className="space-y-2"
      data-testid={`lcc-list-widget-${caseId}`}
      aria-label={`${caseTitle} 소송 지휘실 요약`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {summary.phaseLabel ? (
          <StatPill label="" value={summary.phaseLabel} tone="indigo" testId={`lcc-list-phase-${caseId}`} />
        ) : null}
        {summary.priorityLabel && summary.priorityLabel !== "정상" ? (
          <StatPill
            label=""
            value={summary.priorityLabel}
            tone={summary.isDeadlineImminent ? "rose" : "amber"}
            testId={`lcc-list-priority-${caseId}`}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1">
        {summary.todayTaskCount > 0 ? (
          <StatPill
            label="업무"
            value={`${summary.todayTaskCount}건`}
            tone="indigo"
            testId={`lcc-list-tasks-${caseId}`}
          />
        ) : null}
        {summary.reviewPendingCount > 0 ? (
          <StatPill
            label="검토"
            value={`${summary.reviewPendingCount}건`}
            tone="amber"
            testId={`lcc-list-review-${caseId}`}
          />
        ) : null}
        {summary.supplementDraftCount > 0 ? (
          <StatPill
            label="보완 DRAFT"
            value={`${summary.supplementDraftCount}`}
            tone="purple"
            testId={`lcc-list-supplement-draft-${caseId}`}
          />
        ) : null}
        {summary.supplementSentCount > 0 ? (
          <StatPill
            label="보완 SENT"
            value={`${summary.supplementSentCount}`}
            tone="slate"
            testId={`lcc-list-supplement-sent-${caseId}`}
          />
        ) : null}
        {summary.hasOpponentBriefAnalysis ? (
          <StatPill
            label="상대방 서면"
            value={`${summary.opponentBriefAnalyzedCount}/${summary.opponentBriefFileCount}`}
            tone="slate"
            testId={`lcc-list-opponent-brief-${caseId}`}
          />
        ) : summary.opponentBriefFileCount > 0 ? (
          <StatPill label="서면" value="분석 대기" tone="slate" />
        ) : null}
        {deadlineLabel && summary.nextDeadlineTitle ? (
          <StatPill
            label={summary.nextDeadlineTitle.slice(0, 12)}
            value={deadlineLabel}
            tone={summary.isDeadlineImminent ? "rose" : "slate"}
            testId={`lcc-list-deadline-${caseId}`}
          />
        ) : null}
      </div>

      <Link
        href={`/cases/${caseId}/litigation-command-center`}
        className="inline-flex rounded-lg bg-indigo-900 px-2.5 py-1 text-xs font-semibold text-white"
        data-testid={`lcc-list-open-${caseId}`}
      >
        소송 지휘실 열기
      </Link>
    </div>
  );
}
