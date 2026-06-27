import { AdminCasePackageShareDetailClient } from "@/components/admin/case-package/admin-case-package-share-detail-client";

type AdminCasePackageShareDetailPageProps = {
  params: Promise<{
    shareId: string;
  }>;
};

export default async function AdminCasePackageShareDetailPage({
  params,
}: AdminCasePackageShareDetailPageProps) {
  const { shareId } = await params;

  return <AdminCasePackageShareDetailClient shareId={shareId} />;
}
