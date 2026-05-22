import { requireApprovedLawyer } from "@/lib/auth/session";
import { LawyerCasePackageDetailClient } from "@/components/lawyer/case-package/lawyer-case-package-detail-client";

type LawyerCasePackageDetailPageProps = {
  params: Promise<{
    shareId: string;
  }>;
};

export default async function LawyerCasePackageDetailPage({
  params,
}: LawyerCasePackageDetailPageProps) {
  await requireApprovedLawyer();
  const { shareId } = await params;

  return <LawyerCasePackageDetailClient shareId={shareId} />;
}
