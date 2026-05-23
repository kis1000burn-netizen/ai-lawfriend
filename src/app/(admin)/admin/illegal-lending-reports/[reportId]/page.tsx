import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import {
  DAMAGE_TYPE_LABEL,
  REPORTER_TYPE_LABEL,
} from "@/features/illegal-lending/illegal-lending.schema";
import { IllegalLendingReportCopyButton } from "@/components/illegal-lending/illegal-lending-report-copy-button";
import { IllegalLendingLawyerReviewButton } from "@/components/illegal-lending/illegal-lending-lawyer-review-button";
import { IllegalLendingReportStatusForm } from "@/components/illegal-lending/illegal-lending-report-status-form";

export const metadata = {
  title: "불법사금융 신고서 상세 | AI법친 관리자",
};

type PageProps = {
  params: Promise<{
    reportId: string;
  }>;
};

function formatAmount(value: number | null) {
  if (value === null || value === undefined) return "미기재";
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(value: Date | null) {
  if (!value) return "미기재";
  return value.toLocaleDateString("ko-KR");
}

function empty(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "미기재";
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-slate-800 py-3 md:grid-cols-[180px_1fr]">
      <div className="text-sm font-semibold text-aibeop-faint">{label}</div>
      <div className="text-sm leading-6 text-slate-100">{value}</div>
    </div>
  );
}

export default async function AdminIllegalLendingReportDetailPage({ params }: PageProps) {
  const admin = await requireAdmin();

  const { reportId } = await params;
  const report = await prisma.illegalLendingReport.findUnique({
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
      lawyerAssignmentHistories: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!report) {
    notFound();
  }

  await prisma.illegalLendingReportAccessLog.create({
    data: {
      reportId,
      action: "DETAIL_VIEW",
      actorId: admin.id,
      actorName: admin.name ?? admin.email ?? "관리자",
      actorRole: admin.role,
    },
  });

  const damageLabels = report.damageTypes
    .map((type) => DAMAGE_TYPE_LABEL[type as keyof typeof DAMAGE_TYPE_LABEL] ?? type)
    .join(", ");

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Link
              href="/admin/illegal-lending-reports"
              className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
            >
              ← 목록으로 돌아가기
            </Link>
            <p className="mt-4 text-sm font-semibold text-cyan-300">AI법친 관리자</p>
            <h1 className="mt-1 text-3xl font-bold">불법사금융 피해 신고서 상세</h1>
            <p className="mt-2 text-sm text-aibeop-faint">접수번호: {report.id}</p>
          </div>
          <div className="w-full max-w-sm space-y-3">
            <IllegalLendingReportStatusForm reportId={report.id} currentStatus={report.status} />
            <a
              href={`/api/admin/illegal-lending-reports/${report.id}/print`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full justify-center rounded-xl border border-cyan-300/50 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10"
            >
              PDF 저장용 출력 화면 열기
            </a>
            <a
              href={`/api/admin/illegal-lending-reports/${report.id}/pdf`}
              className="inline-flex w-full justify-center rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-aibeop-text hover:bg-cyan-200"
            >
              실제 PDF 다운로드
            </a>
            <IllegalLendingLawyerReviewButton reportId={report.id} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-4 text-xl font-bold">1. 접수 정보</h2>
              <InfoRow
                label="현재 상태"
                value={
                  <span className="rounded-full border border-cyan-300/30 px-3 py-1 text-xs font-semibold text-cyan-100">
                    {report.status}
                  </span>
                }
              />
              <InfoRow label="접수일" value={report.createdAt.toLocaleString("ko-KR")} />
              <InfoRow label="최근 수정일" value={report.updatedAt.toLocaleString("ko-KR")} />
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-4 text-xl font-bold">2. 신고인·피해자 정보</h2>
              <InfoRow
                label="신고인 유형"
                value={REPORTER_TYPE_LABEL[report.reporterType] ?? report.reporterType}
              />
              <InfoRow label="신고인 성명" value={report.reporterName} />
              <InfoRow label="신고인 연락처" value={report.reporterPhone} />
              <InfoRow label="신고인 이메일" value={empty(report.reporterEmail)} />
              <InfoRow label="피해자 성명" value={empty(report.victimName)} />
              <InfoRow label="피해자 연락처" value={empty(report.victimPhone)} />
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-4 text-xl font-bold">3. 채권자·불법사금융업자 정보</h2>
              <InfoRow label="성명 또는 명칭" value={empty(report.creditorName)} />
              <InfoRow label="연락처" value={empty(report.creditorPhone)} />
              <InfoRow label="상호 또는 업체명" value={empty(report.creditorBusinessName)} />
              <InfoRow label="입금계좌 또는 관련 계좌" value={empty(report.creditorAccount)} />
              <InfoRow label="기타 식별정보" value={empty(report.creditorMemo)} />
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-4 text-xl font-bold">4. 대출·상환 정보</h2>
              <InfoRow label="거래일" value={formatDate(report.loanDate)} />
              <InfoRow label="약정 원금" value={formatAmount(report.principalAmount)} />
              <InfoRow label="실제 수령액" value={formatAmount(report.receivedAmount)} />
              <InfoRow label="이미 변제한 금액" value={formatAmount(report.repaidAmount)} />
              <InfoRow label="현재 요구받는 금액" value={formatAmount(report.demandedAmount)} />
              <InfoRow label="이자율·상환조건" value={empty(report.interestRateMemo)} />
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-4 text-xl font-bold">5. 피해 내용</h2>
              <InfoRow label="피해 유형" value={damageLabels || "미기재"} />
              <InfoRow label="불법추심 방식" value={empty(report.collectionMethods)} />
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-aibeop-faint">피해 사실 상세</h3>
                <div className="whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-7 text-slate-100">
                  {report.damageSummary}
                </div>
              </div>
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-aibeop-faint">요청사항</h3>
                <div className="whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-7 text-slate-100">
                  {empty(report.requestedHelp)}
                </div>
              </div>
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-aibeop-faint">증거자료 목록</h3>
                <div className="whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-7 text-slate-100">
                  {empty(report.evidenceSummary)}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-4 text-xl font-bold">6. 상태 변경 이력</h2>
              {report.statusHistories.length === 0 ? (
                <p className="text-sm text-aibeop-faint">아직 상태 변경 이력이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {report.statusHistories.map((history) => (
                    <div
                      key={history.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-aibeop-faint">
                          {history.createdAt.toLocaleString("ko-KR")}
                        </span>
                        <span className="text-aibeop-subtle">·</span>
                        <span className="font-semibold text-cyan-100">
                          {history.fromStatus ?? "최초"} → {history.toStatus}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-aibeop-disabled">
                        담당자: {history.actorName ?? "관리자"} / {history.actorRole ?? "ADMIN"}
                      </p>
                      {history.reason ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-aibeop-disabled">
                          사유: {history.reason}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-4 text-xl font-bold">7. 개인정보 열람·처리 감사로그</h2>
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

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-4 text-xl font-bold">8. 첨부파일</h2>
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
                            {attachment.attachmentType} · {(attachment.sizeBytes / 1024).toFixed(1)}KB · {" "}
                            {attachment.createdAt.toLocaleString("ko-KR")}
                          </p>
                          {attachment.memo ? (
                            <p className="mt-2 text-sm text-aibeop-disabled">{attachment.memo}</p>
                          ) : null}
                        </div>
                        <a
                          href={`/api/admin/illegal-lending-reports/${report.id}/attachments/${attachment.id}/download`}
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

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
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
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold text-fuchsia-100">
                          {request.status}
                        </span>
                        <span className="text-aibeop-subtle">·</span>
                        <span className="text-aibeop-faint">
                          {request.createdAt.toLocaleString("ko-KR")}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-aibeop-disabled">
                        요청자: {request.requestedByName ?? "관리자"} / {request.requestedByRole ?? "ADMIN"}
                      </p>
                      <p className="mt-1 text-sm text-aibeop-disabled">
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

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-4 text-xl font-bold">10. 변호사 자동 배정 이력</h2>

              {report.lawyerAssignmentHistories.length === 0 ? (
                <p className="text-sm text-aibeop-faint">자동 배정 이력이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {report.lawyerAssignmentHistories.map((history) => (
                    <div
                      key={history.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <p className="font-semibold text-purple-100">
                        {history.lawyerName ?? "미지정 변호사"}
                      </p>

                      <p className="mt-1 text-xs text-aibeop-faint">
                        {history.createdAt.toLocaleString("ko-KR")}
                      </p>

                      {history.reason ? (
                        <p className="mt-2 text-sm leading-6 text-aibeop-disabled">
                          {history.reason}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-cyan-300/20 bg-slate-900/90 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">생성된 신고서 초안</h2>
              <IllegalLendingReportCopyButton text={report.generatedReport} />
            </div>
            <div className="mb-4 rounded-2xl border border-amber-300/30 bg-amber-950/30 p-4 text-xs leading-6 text-amber-100">
              이 문서는 신고서 작성 보조 초안입니다. AI법친은 변호사 또는 수사기관이 아니며,
              법률대리·수임·최종 법률판단을 제공하지 않습니다.
            </div>
            <pre className="max-h-[900px] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
              {report.generatedReport}
            </pre>
          </aside>
        </div>
      </div>
    </main>
  );
}