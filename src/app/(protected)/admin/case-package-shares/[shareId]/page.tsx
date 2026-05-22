import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCasePackageShareDetailClient } from "@/components/admin/case-package/admin-case-package-share-detail-client";
import { getSessionUser } from "@/lib/get-session-user";
import { isCasePackageAdminUser } from "@/features/case-package/case-package-admin-auth";

type PageProps = {
  params: Promise<{ shareId: string }>;
};

export default async function AdminCasePackageShareDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (!isCasePackageAdminUser(user)) {
    redirect("/access-denied");
  }

  const { shareId } = await params;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-aibeop-muted">
        <Link href="/admin/case-package-shares" className="underline hover:text-aibeop-text">
          사건 패키지 공유 목록
        </Link>
      </div>
      <AdminCasePackageShareDetailClient shareId={shareId} />
    </div>
  );
}
