import Link from "next/link";
import { DashboardLegacyBridge } from "@/components/dashboard/dashboard-legacy-bridge";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LawyerDashboardHome } from "@/components/dashboard/lawyer/lawyer-dashboard-home";
import { requireApprovedLawyer } from "@/lib/auth/session";
import { fetchLawyerDashboardMetrics } from "@/lib/dashboard/dashboard-metrics";
import { getLitigationCommandCenterDashboardPreviewWithTitles } from "@/features/document-intelligence/litigation-command-center-list-summary.service";

export default async function LawyerPage() {
  const user = await requireApprovedLawyer();
  const [lawyerDashboardMetrics, commandCenterPreview] = await Promise.all([
    fetchLawyerDashboardMetrics(user),
    getLitigationCommandCenterDashboardPreviewWithTitles(user, 5),
  ]);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-10 pb-8">
        <LawyerDashboardHome
          metrics={lawyerDashboardMetrics}
          commandCenterPreview={commandCenterPreview}
        />

        <DashboardLegacyBridge />

        <section
          aria-labelledby="lawyer-legacy-portal-heading"
          className="rounded-2xl border border-aibeop-line bg-aibeop-card p-5 text-aibeop-text shadow-soft ring-1 ring-aibeop-line/70 sm:rounded-[2rem] sm:p-6 md:p-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 id="lawyer-legacy-portal-heading" className="text-xl font-bold text-aibeop-text">
                변호사 포털
              </h2>
              <p className="mt-2 text-sm leading-6 text-aibeop-muted">
                사건 고유번호를 입력해 의뢰인이 공유한 사건 패키지를 조회할 수 있습니다.
              </p>
            </div>

            <Link
              href="/lawyer/case-packages/lookup"
              className="rounded-xl border border-aibeop-line bg-aibeop-surface px-4 py-2 text-sm font-semibold text-aibeop-deep hover:bg-aibeop-soft"
            >
              사건 고유번호 조회
            </Link>
          </div>
          <div className="mt-4 rounded-xl border border-aibeop-line bg-aibeop-accentSoft p-4">
            <p>
              <span className="text-aibeop-muted">이름</span> — {user.name}
            </p>
            <p className="mt-1">
              <span className="text-aibeop-muted">이메일</span> — {user.email}
            </p>
            <p className="mt-1">
              <span className="text-aibeop-muted">권한</span> — {user.role}
            </p>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
