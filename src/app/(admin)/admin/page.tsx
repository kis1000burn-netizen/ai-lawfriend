import Link from "next/link";
import { AdminDashboardHome } from "@/components/dashboard/admin/admin-dashboard-home";
import { DashboardLegacyBridge } from "@/components/dashboard/dashboard-legacy-bridge";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AlertKpiWidget } from "@/components/admin/alerts/alert-kpi-widget";
import { requireAdmin } from "@/lib/auth/session";
import { AUDIT_LOG_USER_APPROVAL_HREF } from "@/lib/admin/audit-log-shortcuts";
import { fetchAdminDashboardMetrics } from "@/lib/dashboard/dashboard-metrics";

const PRISMA_ROLE_LABEL: Record<string, string> = {
  ADMIN: "운영 관리자",
  SUPER_ADMIN: "최상위 관리자",
};

export default async function AdminPage() {
  const user = await requireAdmin();
  const adminDashboardMetrics = await fetchAdminDashboardMetrics(user);
  const roleLabel = PRISMA_ROLE_LABEL[user.role] ?? user.role;

  return (
    <DashboardShell>
      <div className="flex flex-col gap-10 pb-8">
        <AdminDashboardHome metrics={adminDashboardMetrics} />

        <DashboardLegacyBridge />

        <section
          aria-labelledby="admin-legacy-console-heading"
          className="space-y-5 rounded-2xl border border-aibeop-line bg-aibeop-card p-5 text-aibeop-text shadow-soft ring-1 ring-aibeop-line/70 sm:space-y-6 sm:rounded-[2rem] sm:p-6 md:p-8"
        >
          <h2 id="admin-legacy-console-heading" className="text-2xl font-bold">
            관리자 콘솔
          </h2>
          <p className="text-sm text-aibeop-muted">
            일반 업무 화면은{" "}
            <Link href="/dashboard" className="font-medium text-aibeop-text underline">
              대시보드
            </Link>
            와 동일 메뉴를 쓰며, 아래는 운영·설정으로 바로 가는 링크입니다.
          </p>
          <p className="rounded-xl border border-aibeop-line bg-aibeop-accentSoft px-3 py-2 text-xs leading-relaxed text-aibeop-deep">
            <strong className="font-semibold">가입 승인</strong> — 신규 가입은 PENDING이며,{" "}
            <Link href="/admin/users/pending" className="font-medium underline">
              가입 승인 대기
            </Link>
            는 <strong className="font-semibold">플랫폼 관리자(ADMIN / SUPER_ADMIN)</strong>만 들어갈 수
            있습니다. 변호사·스태프 메뉴에는 없습니다. 처리 직후 기록은{" "}
            <Link href={AUDIT_LOG_USER_APPROVAL_HREF} className="font-medium underline">
              승인·반려 감사로그
            </Link>
            에서 확인하고, 목록에서 행을 열면 운영 메모가 상단에 강조됩니다. 역할 열은{" "}
            <strong className="font-semibold">가입 시 요청한 역할</strong>이며, 승인만으로 다른 역할로
            바꾸지는 않습니다. 운영 메모는{" "}
            <strong className="font-semibold">감사로그(metadata)에만</strong> 남습니다.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/users/pending"
              className="flex flex-col gap-1 rounded-xl border border-aibeop-line bg-aibeop-surface p-4 text-sm font-medium hover:bg-aibeop-soft"
              title="PENDING 계정 승인·반려"
            >
              <span>가입 승인 대기</span>
              <span className="text-xs font-normal text-aibeop-muted">
                행 메모 → 감사로그만 · 처리 후 아래 링크로 기록 확인
              </span>
            </Link>
            <Link
              href={AUDIT_LOG_USER_APPROVAL_HREF}
              className="flex flex-col gap-1 rounded-xl border border-aibeop-line bg-aibeop-surface p-4 text-sm font-medium hover:bg-aibeop-soft"
              title="액션 USER_APPROVAL_* 행만"
            >
              <span>승인·반려 감사로그</span>
              <span className="text-xs font-normal text-aibeop-muted">
                가입 처리 이력·운영 메모(userApprovalNote) 확인
              </span>
            </Link>
            <Link
              href="/admin/audit-logs"
              className="flex flex-col gap-1 rounded-xl border border-aibeop-line bg-aibeop-surface p-4 text-sm font-medium hover:bg-aibeop-soft"
            >
              <span>감사로그 전체</span>
              <span className="text-xs font-normal text-aibeop-muted">
                기간·액션·엔티티 조합 검색
              </span>
            </Link>
            <Link
              href="/admin/question-sets"
              className="rounded-xl border border-aibeop-line bg-aibeop-surface p-4 text-sm font-medium hover:bg-aibeop-soft"
            >
              인터뷰 질문셋
            </Link>
            <Link
              href="/admin/document-templates"
              className="rounded-xl border border-aibeop-line bg-aibeop-surface p-4 text-sm font-medium hover:bg-aibeop-soft"
            >
              문서 템플릿
            </Link>
            <Link
              href="/admin/system"
              className="rounded-xl border border-aibeop-line bg-aibeop-surface p-4 text-sm font-medium hover:bg-aibeop-soft"
            >
              시스템 점검
            </Link>
          </div>

          <AlertKpiWidget />
          <div className="rounded-xl border border-aibeop-line bg-aibeop-accentSoft p-4 text-sm">
            <p>
              <span className="text-aibeop-muted">이름</span> — {user.name}
            </p>
            <p className="mt-1">
              <span className="text-aibeop-muted">이메일</span> — {user.email}
            </p>
            <p className="mt-1">
              <span className="text-aibeop-muted">역할</span> — {roleLabel}{" "}
              <span className="text-xs text-aibeop-muted/80">({user.role})</span>
            </p>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
