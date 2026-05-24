import Link from "next/link";
import { ClientDashboardHome } from "@/components/dashboard/client/client-dashboard-home";
import { DashboardLegacyBridge } from "@/components/dashboard/dashboard-legacy-bridge";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { getDashboardCasesService } from "@/features/cases/case.service";
import {
  formatDate,
  isSupplementHubCaseStatus,
  statusLabel,
  supplementHubHref,
  supplementHubLinkTitle,
} from "@/features/cases/case.utils";
import {
  buildAccessibleCaseWhere,
  isPlatformAdmin,
} from "@/features/cases/case.permissions";
import { prismaRoleToUiRole } from "@/lib/role-map";
import { getClientReadinessBadgeLabel } from "@/lib/dashboard/client-readiness-badge";
import {
  buildClientCaseReadiness,
  countInterviewAnswerEntries,
} from "@/lib/dashboard/client-case-readiness";
import {
  formatDashboardDateTime,
  getDashboardCaseHref,
  getDashboardCaseStatusLabel,
  getDashboardCaseTitle,
  getDashboardReviewCtaLabel,
} from "@/lib/dashboard/dashboard-display";
import {
  fetchClientDashboardMetrics,
  type ClientCasePreviewItem,
} from "@/lib/dashboard/dashboard-metrics";
import { findLatestInterviewAnswersMapMemoByCaseIds } from "@/features/case-interview/case-interview-memo-batch.repository";
import { prisma } from "@/lib/prisma";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";

export default async function DashboardPage() {
  const currentUser = await requireSessionUser();
  await redirectLawyerToVerificationUnlessApproved(currentUser);

  const recentCases = await getDashboardCasesService(currentUser);
  const accessibleWhere = await buildAccessibleCaseWhere(currentUser);
  const [clientDashboardMetricsBase, casesForReadiness] = await Promise.all([
    fetchClientDashboardMetrics(currentUser),
    prisma.case.findMany({
      where: accessibleWhere,
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        opponentName: true,
        status: true,
        updatedAt: true,
        _count: {
          select: {
            attachments: {
              where: { status: "ACTIVE", deletedAt: null },
            },
          },
        },
        interviews: { select: { answersJson: true } },
      },
    }),
  ]);

  const interviewMemoByCaseId = await findLatestInterviewAnswersMapMemoByCaseIds(
    casesForReadiness.map((c) => c.id),
  );

  const sourceCase =
    casesForReadiness.find(
      (c) => c.status !== "CLOSED" && c.status !== "REJECTED",
    ) ??
    casesForReadiness[0] ??
    null;

  const readiness = buildClientCaseReadiness(
    sourceCase
      ? {
          id: sourceCase.id,
          title: sourceCase.title,
          caseType: sourceCase.category,
          status: sourceCase.status,
          description: sourceCase.description,
          interviewAnswerCount: countInterviewAnswerEntries(
            sourceCase.interviews,
            interviewMemoByCaseId.get(sourceCase.id) ?? null,
          ),
          attachmentCount: sourceCase._count.attachments,
          opponentName: sourceCase.opponentName,
        }
      : null,
  );

  const recentCasesPreview: ClientCasePreviewItem[] = casesForReadiness
    .slice(0, 5)
    .map((item) => {
      const caseReadiness = buildClientCaseReadiness({
        id: item.id,
        title: item.title,
        caseType: item.category,
        status: item.status,
        description: item.description,
        interviewAnswerCount: countInterviewAnswerEntries(
          item.interviews,
          interviewMemoByCaseId.get(item.id) ?? null,
        ),
        attachmentCount: item._count.attachments,
        opponentName: item.opponentName,
      });

      return {
        id: item.id,
        title: getDashboardCaseTitle(item.title),
        status: item.status,
        statusLabel: getDashboardCaseStatusLabel(item.status),
        updatedAtLabel: formatDashboardDateTime(item.updatedAt),
        href: getDashboardCaseHref(item.id),
        label: getDashboardReviewCtaLabel(),
        readinessPercent: caseReadiness.percent,
        readinessLabel: getClientReadinessBadgeLabel(caseReadiness.percent),
      };
    });

  const clientDashboardMetrics = {
    ...clientDashboardMetricsBase,
    guidanceCaseHref: sourceCase ? `/cases/${sourceCase.id}/guidance` : null,
    readiness,
    recentCasesPreview,
  };

  const uiRole = prismaRoleToUiRole(currentUser.role);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-10 pb-8">
        <ClientDashboardHome metrics={clientDashboardMetrics} />

        <DashboardLegacyBridge />

        <section
          aria-labelledby="dashboard-legacy-hub-heading"
          className="mx-auto w-full max-w-6xl space-y-6 rounded-2xl border border-aibeop-line bg-aibeop-card p-5 text-aibeop-text shadow-soft ring-1 ring-aibeop-line/70 sm:space-y-8 sm:rounded-[2rem] sm:p-6 md:p-8"
        >
          <h2 id="dashboard-legacy-hub-heading" className="sr-only">
            사건 진입 허브
          </h2>

          <section className="rounded-3xl border border-aibeop-line bg-aibeop-surface p-8 shadow-soft">
            <p className="text-sm font-bold text-aibeop-deep">AI법친 대시보드 · 사건 진입 허브</p>
            <h3 className="mt-2 text-3xl font-bold text-aibeop-text">
              안녕하세요, {currentUser.name ?? currentUser.email}님
            </h3>
            <p className="mt-2 text-sm font-semibold text-aibeop-text">
              사건 목록·생성으로 이동하고, 아래에서 최근 등록된 사건을 확인할 수 있습니다. 상태별
              필터는{" "}
              <Link href="/cases" className="font-bold text-aibeop-deep underline">
                사건 목록
              </Link>
              에서 사용합니다.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/cases"
                className="rounded-xl bg-aibeop-green px-5 py-3 text-sm font-semibold text-white"
              >
                사건 목록 보기
              </Link>
              <Link
                href="/cases/new"
                className="aibeop-btn-primary"
              >
                새 사건 등록
              </Link>
              {sourceCase ? (
                <Link
                  href={`/cases/${sourceCase.id}/guidance`}
                  className="rounded-xl border border-emerald-600 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-950"
                >
                  사건 진단 카드
                </Link>
              ) : null}
              {isPlatformAdmin(currentUser.role) ? (
                <Link
                  href="/admin/audit-logs"
                  className="rounded-xl border border-aibeop-line bg-aibeop-surface px-5 py-3 text-sm font-semibold text-aibeop-deep"
                >
                  감사로그 조회
                </Link>
              ) : null}
            </div>

            {["LAWYER", "STAFF", "ADMIN", "SUPER_ADMIN"].includes(currentUser.role) ? (
              <p className="mt-6 border-t border-aibeop-line pt-6 text-sm font-semibold leading-relaxed text-aibeop-text">
                <span className="font-bold text-aibeop-deep">의뢰인 연결</span>{" "}— 이메일 초대·수락
                전용 화면은 아직 없습니다. 현재는 의뢰인이 가입·승인된 뒤{" "}
                <span className="font-bold text-aibeop-deep">
                  본인 명의로 사건을 등록해 소유자(owner)
                </span>
                {" "}로 연결되거나, 운영 절차로 소유자를 맞추는 방식을 전제로 합니다. 플랫폼 관리자가 쓰는
                사건 <span className="font-bold text-aibeop-deep">담당 변호사 배정</span> API는{" "}
                <span className="font-bold text-aibeop-deep">변호사 계정만</span> 대상이며, 의뢰인을 그
                배정 대상에 넣지는 않습니다. (다중 초대·재발송·소유자 이전 UI는 고도화 범위)
              </p>
            ) : (
              <p className="mt-6 border-t border-aibeop-line pt-6 text-sm font-semibold leading-relaxed text-aibeop-text">
                배정된 사건은 아래 「최근 내 사건」과{" "}
                <Link href="/cases" className="font-bold text-aibeop-deep underline">
                  사건 목록
                </Link>
                에서 이어서 확인할 수 있습니다.
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-aibeop-line bg-aibeop-surface p-8 shadow-soft">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-aibeop-text">최근 내 사건</h3>
                <p className="mt-1 text-sm font-semibold text-aibeop-text">
                  등록일 최신 순으로 최대 5건입니다.
                </p>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-aibeop-text">
                  「{statusLabel("INTAKE_PENDING")}」은 사건 수정 → AI 인터뷰 → 사건 상세 「진행 액션」
                  순이 일반적입니다. 「{statusLabel("REVIEW_PENDING")}」은 사건 상세에서 문서·문단을 다루는
                  단계이며, 의뢰인은 담당 측 검토를 기다리는 경우가 많습니다. 표의{" "}
                  <span className="font-bold text-aibeop-deep">보완 안내</span> 열은 같은 내용을 한 페이지
                  (<span className="whitespace-nowrap">/supplement</span>)로 묶어 둔 링크이며, 접수·검토
                  단계별 섹션으로 스크롤됩니다. 행 위에 마우스를
                  올리면 역할에 맞는 다음 단계 힌트가 보입니다.
                </p>
                {uiRole === "CLIENT" ? (
                  <p className="mt-1 text-xs font-semibold text-aibeop-text">
                    의뢰인: 접수 보완 중에는 본인이 수정·인터뷰를 진행하는 경우가 많습니다.
                  </p>
                ) : (
                  <p className="mt-1 text-xs font-semibold text-aibeop-text">
                    담당(관리자·변호사·스태프): 대리 입력하거나 이 표의 보완 안내 링크를 의뢰인과 공유할 수
                    있습니다.
                  </p>
                )}
              </div>
              <Link
                href="/cases"
                className="text-sm font-bold text-aibeop-deep underline sm:shrink-0"
              >
                전체 보기
              </Link>
            </div>

            {recentCases.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-aibeop-line bg-aibeop-accentSoft p-8 text-center">
                <p className="font-bold text-aibeop-deep">아직 등록된 사건이 없습니다.</p>
                <p className="mt-2 text-sm font-semibold text-aibeop-text">
                  새 사건을 등록하거나 사건 목록에서 전체를 확인하세요.
                </p>
                <p className="mt-2 text-xs font-semibold text-aibeop-deep">
                  접수 보완·검토 대기 사건이 생기면 아래 목록(또는 사건 목록)에서 보완 안내 링크가
                  표시됩니다.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/cases/new"
                    className="aibeop-btn-primary px-5 py-2.5"
                  >
                    새 사건 등록
                  </Link>
                  <Link
                    href="/cases"
                    className="rounded-xl border border-aibeop-line bg-aibeop-surface px-5 py-2.5 text-sm font-semibold text-aibeop-deep"
                  >
                    사건 목록
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-aibeop-line">
                <table className="min-w-full divide-y">
                  <thead className="bg-aibeop-accentSoft">
                    <tr className="text-left text-sm font-bold text-aibeop-deep">
                      <th scope="col" className="px-4 py-3">
                        사건명
                      </th>
                      <th scope="col" className="px-4 py-3">
                        상태
                      </th>
                      <th scope="col" className="px-4 py-3">
                        등록일
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3"
                        title="접수 보완·검토 대기일 때만 링크(/supplement). 마우스를 올리면 역할별 다음 단계 힌트"
                      >
                        보완 안내
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-aibeop-surface">
                    {recentCases.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <Link
                            href={`/cases/${item.id}`}
                            className="font-medium text-aibeop-text underline"
                          >
                            {item.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-aibeop-deep">
                          <span className="inline-flex rounded-full bg-aibeop-pale px-2.5 py-0.5 text-xs font-medium text-aibeop-deep">
                            {statusLabel(item.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-aibeop-text">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {isSupplementHubCaseStatus(item.status) ? (
                            <Link
                              href={supplementHubHref(item.id, item.status, uiRole)}
                              className="font-medium text-aibeop-deep underline"
                              title={supplementHubLinkTitle(item.status, uiRole)}
                            >
                              보완 안내
                            </Link>
                          ) : (
                            <span className="text-aibeop-line" title="이 상태에서는 허브 링크 없음">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </div>
    </DashboardShell>
  );
}
