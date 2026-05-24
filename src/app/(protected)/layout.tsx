import { isStaffRole } from "@/lib/auth/roles";
import type { ReactNode } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { canManageQuestionSets } from "@/features/question-set/question-set.service";
import AuthStatus from "@/components/auth/auth-status";
import { AdminHeaderAlertBell } from "@/components/admin/alerts/admin-header-alert-bell";
import { AibeopchinLogo } from "@/components/brand/aibeopchin-logo";
import { AppBuildBadge } from "@/components/common/AppBuildBadge";
import { ProtectedPageWayfinding } from "@/components/layout/protected-page-wayfinding";
import { getPostLoginHref, getRoleLabelKo } from "@/lib/landing/post-login-href";

type Props = {
  children: ReactNode;
};

export default async function ProtectedLayout({ children }: Props) {
  const user = await requireUser();
  const isPlatformAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const canEditQuestionSets = canManageQuestionSets(user.role);
  const workspaceHomeHref = getPostLoginHref(user.role);
  const workspaceHomeLabel = `${getRoleLabelKo(user.role)} 작업 홈`;

  return (
    <div className="min-h-screen bg-aibeop-bg text-aibeop-text">
      <header className="border-b border-aibeop-line bg-aibeop-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-wrap items-center gap-6">
            <AibeopchinLogo href={workspaceHomeHref} compact />
            <nav className="flex flex-wrap gap-4 text-sm font-bold text-aibeop-subtle">
              <Link href="/dashboard" className="hover:text-aibeop-deep">
                대시보드
              </Link>
              <Link href="/cases" className="hover:text-aibeop-deep">
                내 사건
              </Link>
              <Link href="/cases/new" className="hover:text-aibeop-deep">
                사건 등록
              </Link>
              {user.role === "LAWYER" ? (
                <Link href="/lawyer" className="hover:text-aibeop-deep">
                  변호사 포털
                </Link>
              ) : null}
              {isStaffRole(user.role) ? (
                <>
                  <Link href="/admin/alerts/ops-queue" className="hover:text-aibeop-deep">
                    Ops 대기열
                  </Link>
                  <Link href="/admin/alerts/ops-dashboard" className="hover:text-aibeop-deep">
                    운영 현황
                  </Link>
                  <Link href="/admin/audit-logs" className="hover:text-aibeop-deep">
                    감사로그
                  </Link>
                  <Link href="/admin/lawyer-verifications" className="hover:text-aibeop-deep">
                    변호사 자격(조회)
                  </Link>
                  <Link href="/admin/case-package-shares" className="hover:text-aibeop-deep">
                    사건 패키지 공유
                  </Link>
                  <Link href="/admin/legal-form-sources" className="hover:text-aibeop-deep">
                    공식 서식 원천
                  </Link>
                </>
              ) : null}
              {canEditQuestionSets ? (
                <Link href="/admin/question-sets" className="hover:text-aibeop-deep">
                  인터뷰 질문셋
                </Link>
              ) : null}
              {canEditQuestionSets ? (
                <Link href="/admin/document-templates" className="hover:text-aibeop-deep">
                  문서 템플릿
                </Link>
              ) : null}
              {isStaffRole(user.role) || isPlatformAdmin ? (
                <>
                  <Link href="/admin/gongbuho" className="hover:text-aibeop-deep">
                    공부호 패킷
                  </Link>
                  <Link
                    href="/admin/gongbuho/legal-knowledge"
                    className="hover:text-aibeop-deep"
                  >
                    Legal Knowledge
                  </Link>
                  <Link href="/admin/cmb" className="hover:text-aibeop-deep">
                    CMB Preview
                  </Link>
                </>
              ) : null}
              {isPlatformAdmin ? (
                <>
                  <Link
                    href="/admin/users/pending"
                    className="hover:text-aibeop-deep"
                    title="플랫폼 관리자(ADMIN / SUPER_ADMIN) 전용"
                  >
                    가입 승인
                  </Link>
                  <Link href="/admin/lawyer-verifications" className="hover:text-aibeop-deep">
                    변호사 자격 검증
                  </Link>
                  <Link href="/admin/case-package-shares" className="hover:text-aibeop-deep">
                    사건 패키지 공유
                  </Link>
                  <Link href="/admin/audit-logs" className="hover:text-aibeop-deep">
                    감사로그
                  </Link>
                  <Link href="/admin/alerts/rules" className="hover:text-aibeop-deep">
                    경고 규칙
                  </Link>
                  <Link href="/admin/alerts/history" className="hover:text-aibeop-deep">
                    경고 이력
                  </Link>
                  <Link href="/admin/alerts/board" className="hover:text-aibeop-deep">
                    Alert Task 보드
                  </Link>
                  <Link href="/admin/alerts/kpi" className="hover:text-aibeop-deep">
                    경고 KPI
                  </Link>
                  <Link href="/admin/alerts/escalations" className="hover:text-aibeop-deep">
                    에스컬레이션
                  </Link>
                  <Link href="/admin/alerts/bulk-jobs" className="hover:text-aibeop-deep">
                    Bulk Jobs
                  </Link>
                  <Link href="/admin/cron" className="hover:text-aibeop-deep">
                    Cron 로그
                  </Link>
                  <Link href="/admin/notifications" className="hover:text-aibeop-deep">
                    알림함
                  </Link>
                  <Link
                    href="/admin/operations/retry-jobs"
                    className="hover:text-aibeop-deep"
                  >
                    Retry Queue
                  </Link>
                  <Link
                    href="/admin/operations/monitoring"
                    className="hover:text-aibeop-deep"
                  >
                    Ops Console
                  </Link>
                  <Link
                    href="/admin/operations/data-governance"
                    className="hover:text-aibeop-deep"
                  >
                    Data Governance
                  </Link>
                  <Link
                    href="/admin/operations/aibeopchin-7-dashboard"
                    className="hover:text-aibeop-deep"
                  >
                    운영 모니터링
                  </Link>
                  <Link href="/admin/tenants" className="hover:text-aibeop-deep">
                    Tenant / Plan
                  </Link>
                  <Link href="/admin/system" className="hover:text-aibeop-deep">
                    시스템 점검
                  </Link>
                </>
              ) : null}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {isPlatformAdmin ? <AdminHeaderAlertBell /> : null}
            <AuthStatus user={user} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <ProtectedPageWayfinding
          homeHref={workspaceHomeHref}
          homeLabel={workspaceHomeLabel}
          scope="protected"
        />
        {children}
      </main>

      {isPlatformAdmin ? (
        <footer className="border-t border-aibeop-line bg-aibeop-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <AppBuildBadge />
            <span className="text-xs font-semibold text-aibeop-subtle">
              배포 버전은 상단 배지와 /api/release-meta 에서 확인할 수 있습니다.
            </span>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
