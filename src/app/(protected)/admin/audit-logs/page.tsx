import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AuditLogSummaryWidgets from "@/components/admin/audit-log-summary-widgets";
import AuditLogQuickFilters from "@/components/admin/audit-log-quick-filters";
import AuditLogTable from "@/components/admin/audit-log-table";
import AuditLogActionChart from "@/components/admin/audit-log-action-chart";
import AuditLogDailyTrendChart from "@/components/admin/audit-log-daily-trend-chart";
import AuditLogTopActorsWidget from "@/components/admin/audit-log-top-actors-widget";
import AuditLogHourlyChart from "@/components/admin/audit-log-hourly-chart";
import AuditLogAdvancedStatusBanner from "@/components/admin/audit-log-advanced-status-banner";
import { AuditLogAlertQuickActions } from "@/components/admin/audit-log-alert-quick-actions";
import { AuditLogActiveFilters } from "@/components/admin/audit-logs/audit-log-active-filters";
import { AuditLogFilterBar } from "@/components/admin/audit-logs/audit-log-filter-bar";
import { AuditLogPagination } from "@/components/admin/audit-logs/audit-log-pagination";
import { OpsQueueMoveAuditPanel } from "@/components/admin/audit/OpsQueueMoveAuditPanel";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { listAuditLogsService } from "@/features/audit-logs/audit-log.service";
import { auditLogListQuerySchema } from "@/features/audit-logs/audit-log.validators";
import { isPlatformAdmin } from "@/features/cases/case.permissions";
import { parseAuditLogSearchParams } from "@/lib/audit-log/search-params";
import { AUDIT_LOG_USER_APPROVAL_HREF } from "@/lib/admin/audit-log-shortcuts";

type AuditLogsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    actorUserId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    q?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    highlight?: string;
  }>;
};

function buildQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && String(value).length > 0) {
      searchParams.set(key, String(value));
    }
  }

  return searchParams.toString();
}

export default async function AuditLogsPage({ searchParams }: AuditLogsPageProps) {
  const currentUser = await requireSessionUser();

  if (!isPlatformAdmin(currentUser.role)) {
    redirect("/dashboard");
  }

  const resolved = await searchParams;
  const urlParsed = parseAuditLogSearchParams(resolved);

  const highlight = urlParsed.highlight?.trim() ?? "";

  const query = auditLogListQuerySchema.parse({
    page: urlParsed.page,
    pageSize: urlParsed.pageSize,
    actorUserId: urlParsed.actorUserId,
    action: urlParsed.action,
    entityType: urlParsed.entityType,
    entityId: urlParsed.entityId,
    q: urlParsed.q,
    search: urlParsed.search,
    dateFrom: urlParsed.dateFrom,
    dateTo: urlParsed.dateTo,
  });

  const result = await listAuditLogsService(currentUser, query);

  const {
    actorUserId,
    action,
    entityType,
    entityId,
    search,
    dateFrom,
    dateTo,
    pageSize,
  } = query;

  const commonQuery = {
    actorUserId,
    action,
    entityType,
    entityId,
    search,
    dateFrom,
    dateTo,
    ...(highlight ? { highlight } : {}),
    ...(urlParsed.q ? { q: urlParsed.q } : {}),
  };

  return (
    <main className="mx-auto max-w-[1600px] space-y-6 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-aibeop-subtle">관리자 전용 감사 대시보드</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-aibeop-text">
              감사로그 운영 센터
            </h1>
            <p className="mt-2 text-aibeop-muted">
              주요 행위 이력을 조회하고, 기간별 분석과 사용자 활동 패턴을 한 화면에서 확인할 수
              있습니다. 가입 <strong className="font-medium text-aibeop-subtle">승인·반려</strong>만 보려면{" "}
              <Link href={AUDIT_LOG_USER_APPROVAL_HREF} className="font-medium text-aibeop-text underline">
                USER_APPROVAL 액션으로 좁힌 보기
              </Link>
              를 쓰거나, 아래 상세 검색의 액션 칸에 <span className="font-mono text-sm">USER_APPROVAL</span>을
              입력하세요. 목록에서 행을 열면 가입 승인·반려 건의{" "}
              <span className="font-mono text-sm">userApprovalNote</span>가 상세 모달 상단에 따로
              표시됩니다.
            </p>
            <div className="mt-4">
              <AuditLogAlertQuickActions />
            </div>
          </div>

          <Link
            href={`/api/admin/audit-logs/export?${buildQueryString(commonQuery)}`}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm"
          >
            Excel 내보내기
          </Link>
        </div>
      </section>

      <AuditLogAdvancedStatusBanner currentUser={currentUser} />

      {highlight ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
          강조 대상 로그 ID:{" "}
          <span className="font-mono font-semibold">{highlight}</span>
          <span className="mt-1.5 block text-xs font-normal leading-relaxed text-amber-900/85">
            이 값은 통합 검색·목록 API 필터로 쓰이지 않습니다. 아래 목록에 해당 행이 있을 때만
            표시를 강조하고 스크롤합니다.
          </span>
        </div>
      ) : null}

      <AuditLogActiveFilters
        q={urlParsed.q}
        search={urlParsed.search}
        actorUserId={urlParsed.actorUserId}
        entityType={urlParsed.entityType}
        entityId={urlParsed.entityId}
        action={urlParsed.action}
        highlight={urlParsed.highlight}
        dateFrom={urlParsed.dateFrom}
        dateTo={urlParsed.dateTo}
      />

      <Suspense
        fallback={
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-aibeop-subtle shadow-sm">
            필터 영역을 불러오는 중...
          </div>
        }
      >
        <AuditLogFilterBar />
      </Suspense>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_420px]">
        <section className="space-y-6">
          <AuditLogSummaryWidgets
            currentUser={currentUser}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />

          <AuditLogQuickFilters
            currentQuery={{
              pageSize,
              actorUserId,
              action,
              entityType,
              entityId,
              search,
              dateFrom,
              dateTo,
            }}
          />

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-aibeop-text">상세 검색</h2>
                <p className="mt-1 text-sm text-aibeop-subtle">
                  액션, 엔티티, 행위자, 기간 조건을 조합해 세부 조회할 수 있습니다.
                </p>
              </div>
            </div>

            <form method="get" className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {highlight ? <input type="hidden" name="highlight" value={highlight} /> : null}
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="통합 검색"
                className="rounded-xl border px-4 py-3"
              />
              <input
                type="text"
                name="action"
                defaultValue={action}
                placeholder="액션 예: CASE_UPDATE"
                className="rounded-xl border px-4 py-3"
              />
              <input
                type="text"
                name="entityType"
                defaultValue={entityType}
                placeholder="엔티티 예: CASE"
                className="rounded-xl border px-4 py-3"
              />
              <input
                type="text"
                name="entityId"
                defaultValue={entityId}
                placeholder="엔티티 ID"
                className="rounded-xl border px-4 py-3"
              />
              <input
                type="text"
                name="actorUserId"
                defaultValue={actorUserId}
                placeholder="행위자 User ID"
                className="rounded-xl border px-4 py-3"
              />
              <input
                type="date"
                name="dateFrom"
                defaultValue={dateFrom}
                className="rounded-xl border px-4 py-3"
              />
              <input
                type="date"
                name="dateTo"
                defaultValue={dateTo}
                className="rounded-xl border px-4 py-3"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                검색
              </button>
            </form>
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-aibeop-text">감사로그 목록</h2>
                <p className="mt-1 text-sm text-aibeop-subtle">
                  actor / action / entity 기준 drill-down과 상세 모달을 지원합니다.{" "}
                  <span className="text-aibeop-muted">
                    <span className="font-mono text-xs">USER_APPROVAL_*</span> 행은 목록에서{" "}
                    <strong className="font-medium text-aibeop-subtle">왼쪽 색띠·뱃지 색</strong>으로 구분되고,
                    운영 메모가 있으면 메시지 열에 <strong className="font-medium text-aibeop-subtle">요약</strong>
                    이 붙습니다(전체는 상세 모달).
                  </span>
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-aibeop-muted">
                총 <span className="font-semibold text-aibeop-text">{result.pagination.total}</span>건
              </div>
            </div>

            <Suspense
              fallback={
                <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-aibeop-subtle">
                  페이지 정보를 불러오는 중...
                </div>
              }
            >
              <div className="mb-4">
                <AuditLogPagination
                  page={result.pagination.page}
                  pageSize={result.pagination.pageSize}
                  totalPages={result.pagination.totalPages}
                  total={result.pagination.total}
                />
              </div>
            </Suspense>

            <AuditLogTable
              items={result.items}
              highlightId={highlight || undefined}
              currentQuery={{
                pageSize,
                actorUserId,
                action,
                entityType,
                entityId,
                search,
                dateFrom,
                dateTo,
                highlight,
              }}
            />
          </section>

          <Suspense
            fallback={
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-aibeop-subtle">
                페이지 정보를 불러오는 중...
              </div>
            }
          >
            <AuditLogPagination
              page={result.pagination.page}
              pageSize={result.pagination.pageSize}
              totalPages={result.pagination.totalPages}
              total={result.pagination.total}
            />
          </Suspense>
        </section>

        <aside className="space-y-6 self-start xl:sticky xl:top-6">
          <AuditLogActionChart
            currentUser={currentUser}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />

          <AuditLogDailyTrendChart
            currentUser={currentUser}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />

          <AuditLogTopActorsWidget
            currentUser={currentUser}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />

          <AuditLogHourlyChart
            currentUser={currentUser}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        </aside>
      </div>

      <OpsQueueMoveAuditPanel />
    </main>
  );
}
