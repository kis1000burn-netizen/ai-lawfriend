import Link from "next/link";
import { notFound } from "next/navigation";
import { JeonseDamageLawyerReviewButton } from "@/components/jeonse-damage/jeonse-damage-lawyer-review-button";
import { JeonseDamageStatusForm } from "@/components/jeonse-damage/jeonse-damage-status-form";
import { createJeonseDamageAccessLog } from "@/features/jeonse-damage/jeonse-damage-access-log";
import {
  JEONSE_DAMAGE_TYPE_LABEL,
  JEONSE_REPORTER_TYPE_LABEL,
} from "@/features/jeonse-damage/jeonse-damage.schema";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "전세사기·보증금 반환 피해 서류 상세 | AI법친 관리자",
};

type PageProps = Readonly<{
  params: Promise<{
    reportId: string;
  }>;
}>;

function empty(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || "미기재";
}

function formatAmount(value?: number | null) {
  if (value === null || value === undefined) return "미기재";
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(value?: Date | null) {
  if (!value) return "미기재";
  return value.toLocaleDateString("ko-KR");
}

function yesNo(value: boolean) {
  return value ? "예" : "아니오";
}

function InfoRow({
  label,
  value,
}: Readonly<{
  label: string;
  value: React.ReactNode;
}>) {
  return (
    <div className="grid gap-1 border-b border-slate-800 py-3 md:grid-cols-[180px_1fr]">
      <div className="text-sm font-semibold text-aibeop-faint">{label}</div>
      <div className="text-sm leading-6 text-slate-100">{value}</div>
    </div>
  );
}

export default async function AdminJeonseDamageReportDetailPage({
  params,
}: PageProps) {
  await requireAdmin();
  const { reportId } = await params;

  const report = await prisma.jeonseDamageReport.findUnique({
    where: { id: reportId },
    include: {
      statusHistories: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      accessLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      attachments: {
        orderBy: { createdAt: "desc" },
      },
      lawyerReviewRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!report) {
    notFound();
  }

  await createJeonseDamageAccessLog({
    reportId,
    action: "DETAIL_VIEW",
  });

  const damageLabels = report.damageTypes
    .map(
      (type) =>
        JEONSE_DAMAGE_TYPE_LABEL[
          type as keyof typeof JEONSE_DAMAGE_TYPE_LABEL
        ] ?? type,
    )
    .join(", ");

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Link
            href="/admin/jeonse-damage-reports"
            className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
          >
            ← 목록으로 돌아가기
          </Link>
          <p className="mt-4 text-sm font-semibold text-cyan-300">AI법친 관리자</p>
          <h1 className="mt-1 text-3xl font-bold">
            전세사기·보증금 반환 피해 서류 상세
          </h1>
          <p className="mt-2 text-sm text-aibeop-faint">접수번호: {report.id}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-4 text-xl font-bold">1. 접수 정보</h2>
              <InfoRow label="현재 상태" value={report.status} />
              <InfoRow label="접수일" value={report.createdAt.toLocaleString("ko-KR")} />
              <InfoRow
                label="최근 수정일"
                value={report.updatedAt.toLocaleString("ko-KR")}
              />
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-4 text-xl font-bold">2. 작성자·임차인 정보</h2>
              <InfoRow
                label="작성자 유형"
                value={
                  JEONSE_REPORTER_TYPE_LABEL[report.reporterType] ??
                  report.reporterType
                }
              />
              <InfoRow label="작성자 성명" value={report.reporterName} />
              <InfoRow label="작성자 연락처" value={report.reporterPhone} />
              <InfoRow label="작성자 이메일" value={empty(report.reporterEmail)} />
              <InfoRow label="임차인 성명" value={empty(report.tenantName)} />
              <InfoRow label="임차인 연락처" value={empty(report.tenantPhone)} />
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-4 text-xl font-bold">3. 임차주택·대항력 관련</h2>
              <InfoRow label="임차주택 주소" value={report.propertyAddress} />
              <InfoRow label="주택 유형" value={empty(report.propertyType)} />
              <InfoRow label="전입신고" value={yesNo(report.hasMoveInReport)} />
              <InfoRow label="전입신고일" value={formatDate(report.moveInDate)} />
              <InfoRow label="확정일자" value={yesNo(report.hasFixedDate)} />
              <InfoRow label="확정일자일" value={formatDate(report.fixedDate)} />
              <InfoRow label="실제 점유" value={yesNo(report.hasPossession)} />
              <InfoRow label="임차권등기" value={yesNo(report.hasLeaseRegistration)} />
              <InfoRow label="전세권 설정" value={yesNo(report.hasJeonseRight)} />
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-4 text-xl font-bold">4. 계약·임대인·중개 정보</h2>
              <InfoRow label="계약 시작일" value={formatDate(report.leaseStartDate)} />
              <InfoRow label="계약 종료일" value={formatDate(report.leaseEndDate)} />
              <InfoRow label="임대차보증금" value={formatAmount(report.depositAmount)} />
              <InfoRow label="월 차임" value={formatAmount(report.monthlyRentAmount)} />
              <InfoRow label="임대인" value={empty(report.landlordName)} />
              <InfoRow label="임대인 연락처" value={empty(report.landlordPhone)} />
              <InfoRow label="중개사" value={empty(report.brokerName)} />
              <InfoRow label="중개사무소" value={empty(report.brokerOfficeName)} />
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-4 text-xl font-bold">5. 피해 내용</h2>
              <InfoRow label="피해 유형" value={damageLabels || "미기재"} />
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-aibeop-faint">
                  보증금 반환 요구 이력
                </h3>
                <div className="whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-7 text-slate-100">
                  {empty(report.returnRequestHistory)}
                </div>
              </div>
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-aibeop-faint">
                  피해 사실 상세
                </h3>
                <div className="whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-7 text-slate-100">
                  {report.damageSummary}
                </div>
              </div>
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-aibeop-faint">
                  증거자료 목록
                </h3>
                <div className="whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-7 text-slate-100">
                  {empty(report.evidenceSummary)}
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-cyan-300/20 bg-slate-900/90 p-6">
            <JeonseDamageStatusForm reportId={report.id} currentStatus={report.status} />
            <a
              href={`/api/admin/jeonse-damage-reports/${report.id}/pdf`}
              className="mt-3 inline-flex w-full justify-center rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-aibeop-text hover:bg-cyan-200"
            >
              PDF 다운로드
            </a>
            <JeonseDamageLawyerReviewButton reportId={report.id} />

            <h2 className="text-xl font-bold">생성된 요약서</h2>
            <div className="mb-4 mt-4 rounded-2xl border border-amber-300/30 bg-amber-950/30 p-4 text-xs leading-6 text-amber-100">
              본 문서는 서류 정리 보조 초안입니다. AI법친은 피해자 결정 여부,
              승소 가능성, 보증금 회수 가능성을 판단하지 않습니다.
            </div>
            <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
              {report.generatedSummary}
            </pre>
            <h2 className="mt-6 text-xl font-bold">제출자료 체크리스트</h2>
            <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
              {report.generatedChecklist}
            </pre>
          </aside>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="mb-4 text-xl font-bold">6. 첨부파일</h2>
          {report.attachments.length === 0 ? (
            <p className="text-sm text-aibeop-faint">첨부파일이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {report.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <p className="font-semibold text-slate-100">
                        {attachment.originalName}
                      </p>
                      <p className="mt-1 text-xs text-aibeop-faint">
                        {attachment.attachmentType} ·{" "}
                        {(attachment.sizeBytes / 1024).toFixed(1)}KB ·{" "}
                        {attachment.createdAt.toLocaleString("ko-KR")}
                      </p>
                      {attachment.memo ? (
                        <p className="mt-2 text-sm text-aibeop-disabled">{attachment.memo}</p>
                      ) : null}
                    </div>
                    <a
                      href={`/api/admin/jeonse-damage-reports/${report.id}/attachments/${attachment.id}/download`}
                      className="rounded-xl border border-cyan-300/40 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/10"
                    >
                      다운로드
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="mb-4 text-xl font-bold">7. 상태 변경 이력</h2>
          {report.statusHistories.length === 0 ? (
            <p className="text-sm text-aibeop-faint">아직 상태 변경 이력이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {report.statusHistories.map((history) => (
                <div
                  key={history.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                >
                  <p className="text-sm font-semibold text-cyan-100">
                    {history.fromStatus ?? "최초"} → {history.toStatus}
                  </p>
                  <p className="mt-1 text-xs text-aibeop-faint">
                    {history.createdAt.toLocaleString("ko-KR")} ·{" "}
                    {history.actorName ?? "관리자"}
                  </p>
                  {history.reason ? (
                    <p className="mt-2 text-sm text-aibeop-disabled">{history.reason}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="mb-4 text-xl font-bold">8. 개인정보 열람·처리 감사로그</h2>
          {report.accessLogs.length === 0 ? (
            <p className="text-sm text-aibeop-faint">아직 감사로그가 없습니다.</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-950 text-left text-aibeop-faint">
                  <tr>
                    <th className="p-3">일시</th>
                    <th className="p-3">행위</th>
                    <th className="p-3">담당자</th>
                    <th className="p-3">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {report.accessLogs.map((log) => (
                    <tr key={log.id} className="border-t border-slate-800">
                      <td className="p-3">{log.createdAt.toLocaleString("ko-KR")}</td>
                      <td className="p-3">{log.action}</td>
                      <td className="p-3">
                        {log.actorName ?? "관리자"} / {log.actorRole ?? "ADMIN"}
                      </td>
                      <td className="p-3">{log.ipAddress ?? "미기록"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="mb-4 text-xl font-bold">9. 변호사 검토 요청 이력</h2>
          {report.lawyerReviewRequests.length === 0 ? (
            <p className="text-sm text-aibeop-faint">변호사 검토 요청 이력이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {report.lawyerReviewRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                >
                  <p className="font-semibold text-purple-100">{request.status}</p>
                  <p className="mt-1 text-xs text-aibeop-faint">
                    {request.createdAt.toLocaleString("ko-KR")}
                  </p>
                  <p className="mt-2 text-sm text-aibeop-disabled">
                    배정 변호사: {request.assignedLawyerName ?? "미배정"}
                  </p>
                  <p className="mt-1 text-sm text-aibeop-disabled">
                    자동 배정: {request.autoAssigned ? "예" : "아니오"}
                  </p>
                  {request.assignmentReason ? (
                    <p className="mt-1 text-sm text-aibeop-faint">
                      배정 사유: {request.assignmentReason}
                    </p>
                  ) : null}
                  {request.memo ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-aibeop-disabled">
                      {request.memo}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
