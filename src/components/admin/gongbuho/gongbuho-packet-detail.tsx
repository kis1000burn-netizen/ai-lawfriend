import Link from "next/link";
import type { GongbuhoPacketJsonAdminCounts } from "@/features/gongbuho/admin-gongbuho-ui-model";
import type { GongbuhoQuestionFlowPreviewResult } from "@/features/gongbuho/admin-gongbuho-question-flow-preview";
import { deriveGongbuhoQuestionSetProjectPanelUi } from "@/features/gongbuho/admin-gongbuho-question-set-project-ui";
import type { GongbuhoPacketStatus } from "@prisma/client";
import { gongbuhoPacketStatusBadgeClass } from "@/features/gongbuho/admin-gongbuho-ui-model";
import { GongbuhoPacketLifecyclePanel } from "@/components/admin/gongbuho/gongbuho-packet-lifecycle-panel";
import { GongbuhoQuestionFlowPreviewPanel } from "@/components/admin/gongbuho/gongbuho-question-flow-preview-panel";
import { GongbuhoQuestionSetProjectPanel } from "@/components/admin/gongbuho/gongbuho-question-set-project-panel";

export type GongbuhoPacketDetailProps = {
  packet: {
    id: string;
    code: string;
    version: string;
    name: string;
    domain: string;
    caseType: string | null;
    status: GongbuhoPacketStatus;
    createdAt: string;
    updatedAt: string;
    createdByUserId: string | null;
    approvedAt: string | null;
    approvedByUserId: string | null;
  };
  packetJsonPreview: string;
  counts: GongbuhoPacketJsonAdminCounts;
  viewerCanMutateLifecycle: boolean;
  questionFlowPreview: GongbuhoQuestionFlowPreviewResult;
  linkedQuestionSetId: string | null;
  viewerCanProjectQuestionSet: boolean;
};

export function GongbuhoPacketDetail({
  packet,
  packetJsonPreview,
  counts,
  viewerCanMutateLifecycle,
  questionFlowPreview,
  linkedQuestionSetId,
  viewerCanProjectQuestionSet,
}: Readonly<GongbuhoPacketDetailProps>) {
  const projectUi = deriveGongbuhoQuestionSetProjectPanelUi({
    status: packet.status,
    viewerCanProjectQuestionSet,
    linkedQuestionSetId,
    previewFlowOk: questionFlowPreview.ok,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">공부호 패킷 상세</h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${gongbuhoPacketStatusBadgeClass(packet.status)}`}
            >
              {packet.status}
            </span>
          </div>
          <p className="mt-1 font-mono text-sm text-slate-600">
            {packet.code} · v{packet.version}{" "}
            <span className="font-sans text-slate-500">({packet.id})</span>
          </p>
          <p className="mt-2 text-sm text-slate-800">{packet.name}</p>
        </div>
        <Link
          href="/admin/gongbuho"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          ← 목록
        </Link>
      </div>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <dl className="space-y-2 text-sm">
          <dt className="text-xs font-medium text-slate-500">도메인</dt>
          <dd>{packet.domain}</dd>
          <dt className="text-xs font-medium text-slate-500">사건 유형(caseType)</dt>
          <dd className="font-mono text-xs">{packet.caseType ?? "—"}</dd>
          <dt className="text-xs font-medium text-slate-500">생성</dt>
          <dd className="text-xs text-slate-700">{new Date(packet.createdAt).toLocaleString("ko-KR")}</dd>
          <dt className="text-xs font-medium text-slate-500">마지막 수정</dt>
          <dd className="text-xs text-slate-700">{new Date(packet.updatedAt).toLocaleString("ko-KR")}</dd>
        </dl>

        <dl className="space-y-2 text-sm">
          <dt className="text-xs font-medium text-slate-500">승인 일시</dt>
          <dd className="text-xs text-slate-700">
            {packet.approvedAt ? new Date(packet.approvedAt).toLocaleString("ko-KR") : "—"}
          </dd>
          <dt className="text-xs font-medium text-slate-500">승인자 userId</dt>
          <dd className="break-all font-mono text-[11px] text-slate-700">
            {packet.approvedByUserId ?? "—"}
          </dd>
          <dt className="text-xs font-medium text-slate-500">작성자 userId</dt>
          <dd className="break-all font-mono text-[11px] text-slate-700">
            {packet.createdByUserId ?? "—"}
          </dd>
        </dl>
      </section>

      <GongbuhoPacketLifecyclePanel
        packetId={packet.id}
        status={packet.status}
        viewerCanMutateLifecycle={viewerCanMutateLifecycle}
      />

      <section className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-5">
        <h2 className="text-sm font-semibold text-indigo-950">패킷 구조 요약</h2>
        <ul className="mt-3 grid gap-2 text-sm text-indigo-950 sm:grid-cols-2 lg:grid-cols-3">
          <li>questionFlow 항목: {counts.questionFlowCount}개</li>
          <li>outputContract.summary: {counts.outputContractSummaryCount}개</li>
          <li>validationRules: {counts.validationRulesCount}개</li>
          <li>forbiddenRules: {counts.forbiddenRulesCount}개</li>
          <li>expertReviewPoints: {counts.expertReviewPointsCount}개</li>
        </ul>
      </section>

      <GongbuhoQuestionFlowPreviewPanel preview={questionFlowPreview} />

      <GongbuhoQuestionSetProjectPanel packetId={packet.id} ui={projectUi} />

      <section>
        <h2 className="text-sm font-semibold text-slate-900">packetJson 미리보기</h2>
        <p className="mt-1 text-xs text-slate-600">
          목록 API·화면에서는 packetJson 이 내려가지 않습니다. 상세에서만 검토합니다.
        </p>
        <pre className="mt-3 max-h-[min(75vh,720px)] overflow-auto whitespace-pre-wrap break-all rounded-xl border bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-100">
          {packetJsonPreview}
        </pre>
      </section>

      <p className="text-xs text-slate-500">
        승인·보관·질문셋 초안(Project) 저장은 ADMIN·SUPER_ADMIN 전용 API를 호출합니다(Phase 4-B·
        4-C). 미리보기는 STAFF 이상에게 동일 화면에 표시합니다. 패킷 삭제 기능은 라이프사이클에 포함하지 않습니다.
      </p>
    </div>
  );
}
