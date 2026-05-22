import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCasePackageShareListClient } from "@/components/admin/case-package/admin-case-package-share-list-client";
import { getSessionUser } from "@/lib/get-session-user";
import { isAdminRole } from "@/lib/auth/roles";
import { isCasePackageAdminUser } from "@/features/case-package/case-package-admin-auth";

export default async function AdminCasePackageSharesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (!isCasePackageAdminUser(user)) {
    redirect("/access-denied");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-aibeop-muted">
        <Link href="/dashboard" className="underline hover:text-aibeop-text">
          대시보드
        </Link>
        <span aria-hidden>·</span>
        <Link
          href={isAdminRole(user.role) ? "/admin" : "/admin/alerts/ops-queue"}
          className="underline hover:text-aibeop-text"
        >
          {isAdminRole(user.role) ? "관리자 홈 (/admin)" : "Ops 허브"}
        </Link>
        <span aria-hidden>·</span>
        <span className="text-aibeop-muted">사건 패키지 공유</span>
      </div>
      <p className="text-sm text-aibeop-muted">
        플랫폼 관리자 또는 운영(STAFF)이 의뢰인–변호사 공유를 모니터링합니다.
      </p>
      <AdminCasePackageShareListClient />
    </div>
  );
}
