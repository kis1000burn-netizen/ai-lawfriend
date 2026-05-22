import { isStaffRole } from "@/lib/auth/roles";
import type { ReactNode } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { canManageQuestionSets } from "@/features/question-set/question-set.service";
import AuthStatus from "@/components/auth/auth-status";
import { AdminHeaderAlertBell } from "@/components/admin/alerts/admin-header-alert-bell";
import { AibeopchinLogo } from "@/components/brand/aibeopchin-logo";
import { AppBuildBadge } from "@/components/common/AppBuildBadge";

type Props = {
  children: ReactNode;
};

export default async function ProtectedLayout({ children }: Props) {
  const user = await requireUser();
  const isPlatformAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const canEditQuestionSets = canManageQuestionSets(user.role);

  return (
    <div className="min-h-screen bg-aibeop-bg text-aibeop-text">
      <header className="border-b border-aibeop-line bg-aibeop-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-wrap items-center gap-6">
            <AibeopchinLogo href="/dashboard" compact />
            <nav className="flex flex-wrap gap-4 text-sm text-aibeop-muted">
              <Link href="/dashboard" className="hover:text-aibeop-text">
                대시보드
              </Link>
              <Link href="/cases" className="hover:text-aibeop-text">
                내 사건
              </Link>
              <Link href="/cases/new" className="hover:text-aibeop-text">
                사건 등록
              </Link>
              {user.role === "LAWYER" ? (
                <Link href="/lawyer" className="hover:text-aibeop-text">
                  변호사 포털
                </Link>
              ) : null}
              {isStaffRole(user.role) ? (
                <>
                  <Link href="/admin/alerts/ops-queue" className="hover:text-aibeop-text">
                    Ops 대기열
                  </Link>
                  <Link href="/admin/alerts/ops-dashboard" className="hover:text-aibeop-text">
                    운영 현황
                  </Link>
                  <Link href="/admin/audit-logs" className="hover:text-aibeop-text">
                    감사로그
                  </Link>
                  <Link href="/admin/lawyer-verifications" className="hover:text-aibeop-text">
                    변호사 자격(조회)
                  </Link>
                  <Link href="/admin/case-package-shares" className="hover:text-aibeop-text">
                    사건 패키지 공유
                  </Link>
                  <Link href="/admin/legal-form-sources" className="hover:text-aibeop-text">
                    공식 서식 원천
                  </Link>
                </>
              ) : null}
              {canEditQuestionSets ? (
                <Link href="/admin/question-sets" className="hover:text-aibeop-text">
                  인터뷰 질문셋
                </Link>
              ) : null}
              {canEditQuestionSets ? (
                <Link href="/admin/document-templates" className="hover:text-aibeop-text">
                  문서 템플릿
                </Link>
              ) : null}
              {isStaffRole(user.role) || isPlatformAdmin ? (
                <Link href="/admin/gongbuho" className="hover:text-aibeop-text">
                  공부호 패킷
                </Link>
              ) : null}
              {isPlatformAdmin ? (
                <>
                  <Link
                    href="/admin/users/pending"
                    className="hover:text-aibeop-text"
                    title="플랫폼 관리자(ADMIN / SUPER_ADMIN) 전용"
                  >
                    가입 승인
                  </Link>
                  <Link href="/admin/lawyer-verifications" className="hover:text-aibeop-text">
                    변호사 자격 검증
                  </Link>
                  <Link href="/admin/case-package-shares" className="hover:text-aibeop-text">
                    사건 패키지 공유
                  </Link>
                  <Link href="/admin/audit-logs" className="hover:text-aibeop-text">
                    감사로그
                  </Link>
                  <Link href="/admin/alerts/rules" className="hover:text-aibeop-text">
                    경고 규칙
                  </Link>
                  <Link href="/admin/alerts/history" className="hover:text-aibeop-text">
                    경고 이력
                  </Link>
                  <Link href="/admin/alerts/board" className="hover:text-aibeop-text">
                    Alert Task 보드
                  </Link>
                  <Link href="/admin/alerts/kpi" className="hover:text-aibeop-text">
                    경고 KPI
                  </Link>
                  <Link href="/admin/alerts/escalations" className="hover:text-aibeop-text">
                    에스컬레이션
                  </Link>
                  <Link href="/admin/alerts/bulk-jobs" className="hover:text-aibeop-text">
                    Bulk Jobs
                  </Link>
                  <Link href="/admin/cron" className="hover:text-aibeop-text">
                    Cron 로그
                  </Link>
                  <Link href="/admin/notifications" className="hover:text-aibeop-text">
                    알림함
                  </Link>
                  <Link
                    href="/admin/operations/aibeopchin-7-dashboard"
                    className="hover:text-aibeop-text"
                  >
                    운영 모니터링
                  </Link>
                  <Link href="/admin/system" className="hover:text-aibeop-text">
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

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>

      {isPlatformAdmin ? (
        <footer className="border-t border-aibeop-line bg-aibeop-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <AppBuildBadge />
            <span className="text-xs text-aibeop-muted">
              배포 버전은 상단 배지와 /api/release-meta 에서 확인할 수 있습니다.
            </span>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
