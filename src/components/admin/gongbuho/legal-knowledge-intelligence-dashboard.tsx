"use client";

import type { LegalKnowledgeIntelligenceDashboard } from "@/features/gongbuho/legal-knowledge-intelligence.service";

type Props = {
  dashboard: LegalKnowledgeIntelligenceDashboard;
};

function pct(value: number | null): string {
  if (value == null) return "—";
  return `${value}%`;
}

const BOTTLENECK_LABELS: Record<string, string> = {
  INTAKE_PRE_BRIEF: "Intake → Brief 전",
  BRIEF_AWAITING_REVIEW: "변호사 검수 대기",
  REVIEW_APPROVED_NO_PACKET: "승인 · 미컴파일",
  PACKET_DRAFT_NOT_APPROVED: "DRAFT · 미승인",
};

export function LegalKnowledgeIntelligenceDashboardView({ dashboard }: Readonly<Props>) {
  const { funnel, demandGap, lawyerReviewSla, complianceMeta } = dashboard;

  return (
    <div className="space-y-8" data-testid="legal-knowledge-intelligence-dashboard">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">전체 Intake</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900" data-testid="lk-intel-total-intakes">
            {funnel.totalIntakes}
          </p>
        </div>
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">PACKET_APPROVED</p>
          <p className="mt-2 text-2xl font-semibold text-violet-950">{funnel.intakesPacketApproved}</p>
          <p className="mt-1 text-xs text-violet-800">
            전환 {pct(funnel.rates.intakeToPacketApprovedPct)}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">활성 파이프라인</p>
          <p className="mt-2 text-2xl font-semibold text-amber-950">{demandGap.activePipelineCount}</p>
        </div>
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">병목 구간</p>
          <p className="mt-2 text-sm font-semibold text-sky-950">
            {BOTTLENECK_LABELS[lawyerReviewSla.bottleneckStage] ?? lawyerReviewSla.bottleneckStage}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Funnel 전환율</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-slate-500">Intake → Brief</dt>
            <dd className="text-lg font-semibold">{pct(funnel.rates.intakeToBriefPct)}</dd>
            <dd className="text-xs text-slate-600">
              {funnel.intakesWithBrief} / {funnel.totalIntakes}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Brief → Approved Review</dt>
            <dd className="text-lg font-semibold">{pct(funnel.rates.briefToApprovedReviewPct)}</dd>
            <dd className="text-xs text-slate-600">
              {funnel.intakesWithApprovedReview} / {funnel.intakesWithBrief}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Approved → Packet Draft</dt>
            <dd className="text-lg font-semibold">{pct(funnel.rates.approvedReviewToPacketDraftPct)}</dd>
            <dd className="text-xs text-slate-600">
              {funnel.reviewsWithPacketDraft} / {funnel.reviewsApproved}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Intake → PACKET_APPROVED</dt>
            <dd className="text-lg font-semibold">{pct(funnel.rates.intakeToPacketApprovedPct)}</dd>
            <dd className="text-xs text-slate-600">
              {funnel.intakesPacketApproved} / {funnel.totalIntakes}
            </dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-900">Backlog — Intake</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {Object.entries(dashboard.backlog.intakeByStatus)
              .filter(([, n]) => n > 0)
              .map(([status, count]) => (
                <li key={status} className="flex justify-between gap-2">
                  <span className="font-mono text-xs">{status}</span>
                  <span className="font-semibold">{count}</span>
                </li>
              ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-900">Backlog — Brief</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {Object.entries(dashboard.backlog.briefByStatus)
              .filter(([, n]) => n > 0)
              .map(([status, count]) => (
                <li key={status} className="flex justify-between gap-2">
                  <span className="font-mono text-xs">{status}</span>
                  <span className="font-semibold">{count}</span>
                </li>
              ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-900">Backlog — Review</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {Object.entries(dashboard.backlog.reviewByStatus)
              .filter(([, n]) => n > 0)
              .map(([status, count]) => (
                <li key={status} className="flex justify-between gap-2">
                  <span className="font-mono text-xs">{status}</span>
                  <span className="font-semibold">{count}</span>
                </li>
              ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">수요 gap (PACKET_APPROVED 대비)</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <dt className="text-xs text-slate-500">Brief 없음</dt>
            <dd className="text-lg font-semibold">{demandGap.withoutBriefCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">검수 대기</dt>
            <dd className="text-lg font-semibold">{demandGap.awaitingLawyerReviewCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">승인·미컴파일</dt>
            <dd className="text-lg font-semibold">{demandGap.approvedNotCompiledCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">DRAFT·미승인</dt>
            <dd className="text-lg font-semibold">{demandGap.packetDraftNotApprovedCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">활성 파이프라인</dt>
            <dd className="text-lg font-semibold">{demandGap.activePipelineCount}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Lawyer Review SLA ({lawyerReviewSla.slaHoursDefault}h)
          </h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">PENDING Review</dt>
              <dd className="font-semibold">{lawyerReviewSla.pendingReviewCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">SLA 초과 Review</dt>
              <dd className="font-semibold text-amber-800">{lawyerReviewSla.overduePendingReviewCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">검수 대기 Brief</dt>
              <dd className="font-semibold">{lawyerReviewSla.briefsAwaitingReviewCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">SLA 초과 Brief</dt>
              <dd className="font-semibold text-amber-800">
                {lawyerReviewSla.overdueBriefsAwaitingReviewCount}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-500">평균 Review 처리(시간)</dt>
              <dd className="font-semibold">
                {lawyerReviewSla.avgHoursReviewDecisionTime ?? "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">UGC·PII 준수 메타</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Intake noRawUgc PASS</dt>
              <dd className="font-semibold text-emerald-800">{complianceMeta.intakeNoRawUgcPass}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Intake noRawUgc FAIL</dt>
              <dd className="font-semibold text-rose-700">{complianceMeta.intakeNoRawUgcFail}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Brief noRawUgc PASS</dt>
              <dd className="font-semibold text-emerald-800">{complianceMeta.briefNoRawUgcPass}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Brief noRawUgc FAIL</dt>
              <dd className="font-semibold text-rose-700">{complianceMeta.briefNoRawUgcFail}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Review attestation PASS</dt>
              <dd className="font-semibold text-emerald-800">{complianceMeta.reviewAttestationPass}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Review attestation FAIL</dt>
              <dd className="font-semibold text-rose-700">{complianceMeta.reviewAttestationFail}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-slate-500">
            Outline·ReviewNotes·원문 snippet은 저장·표시하지 않습니다.
          </p>
        </div>
      </section>

      {dashboard.caseTypeDemand.length > 0 ? (
        <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[640px] w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="border-b border-slate-200 px-3 py-3">caseType</th>
                <th className="border-b border-slate-200 px-3 py-3">Intake</th>
                <th className="border-b border-slate-200 px-3 py-3">PACKET_APPROVED</th>
                <th className="border-b border-slate-200 px-3 py-3">gap</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.caseTypeDemand.map((row) => (
                <tr key={row.caseType} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-3 py-2 font-mono text-xs">{row.caseType}</td>
                  <td className="px-3 py-2">{row.intakeCount}</td>
                  <td className="px-3 py-2">{row.packetApprovedCount}</td>
                  <td className="px-3 py-2 font-medium text-amber-800">
                    {row.intakeCount - row.packetApprovedCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <p className="text-xs text-slate-500">
        생성 시각: {new Date(dashboard.generatedAt).toLocaleString("ko-KR")} · 메타만 표시
      </p>
    </div>
  );
}
