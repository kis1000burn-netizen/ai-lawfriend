"use client";

import { useMemo, useState } from "react";
import type {
  LegalReliabilityActionOperationDashboardFilter,
  LegalReliabilityActionOperationDashboardSummary,
} from "@/features/legal-reliability-action-operations/legal-reliability-action-operation-dashboard.schema";
import { filterDashboardRows } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation-dashboard.policy";

const FILTER_OPTIONS: Array<{ id: LegalReliabilityActionOperationDashboardFilter; label: string }> =
  [
    { id: "ALL", label: "전체" },
    { id: "NEEDS_ATTENTION", label: "즉시 확인" },
    { id: "OVERDUE", label: "기한 초과" },
    { id: "DUE_SOON", label: "마감 임박" },
    { id: "CLIENT_RESPONDED", label: "의뢰인 응답" },
    { id: "EVIDENCE_UNDER_REVIEW", label: "증거 검토" },
    { id: "LAWYER_REVIEW_REQUIRED", label: "변호사 검토" },
    { id: "COMPLETED", label: "완료" },
  ];

const BUCKET_LABELS: Record<string, string> = {
  NEEDS_ASSIGNMENT: "담당자 배정 필요",
  READY_TO_SEND: "발송 준비",
  WAITING_CLIENT: "의뢰인 응답 대기",
  CLIENT_RESPONSE_ARRIVED: "의뢰인 응답 도착",
  EVIDENCE_UNDER_REVIEW: "증거 검토 대기",
  LAWYER_REVIEW_REQUIRED: "변호사 검토 필요",
  NEEDS_MORE_INFO: "추가 요청 필요",
  REOPENED: "재개됨",
  DEFERRED: "보류",
  COMPLETED: "완료",
  CANCELED: "취소",
};

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-700">
      {children}
    </span>
  );
}

export function LegalReliabilityActionOperationsDashboardPanel({
  summary,
}: {
  summary: LegalReliabilityActionOperationDashboardSummary;
}) {
  const [filter, setFilter] = useState<LegalReliabilityActionOperationDashboardFilter>("ALL");

  const visibleRows = useMemo(
    () => filterDashboardRows(summary.rows, filter),
    [summary.rows, filter],
  );

  return (
    <section
      id="lcc-section-action-operations-dashboard"
      data-testid="lcc-section-action-operations-dashboard"
      className="rounded-2xl border border-slate-200 p-4 space-y-4"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Legal Reliability Action Execution
        </h2>
        <p className="text-sm text-slate-500">
          승인된 Legal Reliability Action의 실행 상태, 기한, 응답, 검토 대기, downstream 가능 여부를
          집계합니다. 대시보드는 가시성 전용이며 자동 완료·발송·제출을 수행하지 않습니다.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`rounded-full border px-3 py-1 text-xs ${
              filter === option.id
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
            data-testid={`lcc-action-operations-dashboard-filter-${option.id}`}
            onClick={() => setFilter(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard label="전체 액션" value={summary.total} />
        <SummaryCard
          label="즉시 확인"
          value={summary.attention.needsImmediateAttentionCount}
        />
        <SummaryCard label="기한 초과/긴급" value={summary.attention.overdueOrUrgentCount} />
        <SummaryCard
          label="변호사 검토 대기"
          value={summary.attention.waitingLawyerReviewCount}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <SummaryCard label="의뢰인 응답" value={summary.response.clientRespondedCount} />
        <SummaryCard
          label="업로드 파일"
          value={summary.response.uploadedFileCount}
        />
        <SummaryCard
          label="증거 검토 대기"
          value={summary.response.evidenceUnderReviewCount}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SummaryCard
          label="Court-ready 가능"
          value={summary.downstream.courtReadyAllowedCount}
        />
        <SummaryCard
          label="미검토 증거 차단"
          value={summary.downstream.blockedByUnreviewedEvidenceCount}
        />
        <SummaryCard
          label="미완료 차단"
          value={summary.downstream.blockedByNoLawyerCompletionCount}
        />
      </div>

      <div className="space-y-2">
        {visibleRows.slice(0, 10).map((row) => (
          <div
            key={row.id}
            className="rounded-xl border border-slate-200 p-3 text-sm flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
            data-testid={`lcc-action-operations-dashboard-row-${row.id}`}
          >
            <div>
              <div className="font-medium text-slate-900">
                {BUCKET_LABELS[row.bucket] ?? row.bucket}
              </div>
              <div className="text-xs text-slate-500">
                상태 {row.status} · SLA {row.slaStatus ?? "NO_DUE_DATE"} · 우선순위{" "}
                {row.priority ?? "MEDIUM"}
              </div>
              <div className="text-xs text-slate-500">
                제출 {row.clientSubmissionCount}건 · 파일 {row.uploadedFileCount}개 · 증거상태{" "}
                {row.evidenceIntakeStatus ?? "NONE"}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge>{row.bucket}</Badge>
              <Badge>score {row.attentionScore}</Badge>
              {row.downstreamReadiness.courtReadyAllowed ? (
                <Badge>downstream 가능</Badge>
              ) : (
                <Badge>downstream 차단</Badge>
              )}
            </div>
          </div>
        ))}

        {visibleRows.length === 0 ? (
          <p className="text-sm text-slate-500">선택한 필터에 해당하는 운영 항목이 없습니다.</p>
        ) : null}
      </div>
    </section>
  );
}
