import Link from "next/link";
import { notFound } from "next/navigation";

import { LitigationCommandCenterClient } from "@/components/cases/litigation-command-center-client";
import { getLitigationCommandCenterService } from "@/features/document-intelligence/litigation-command-center.service";
import { canRunLitigationCommandCenterActions } from "@/features/document-intelligence/litigation-command-center.policy";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { prismaRoleToUiRole } from "@/lib/role-map";

type PageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function LitigationCommandCenterPage({ params }: PageProps) {
  const currentUser = await requireSessionUser();
  await redirectLawyerToVerificationUnlessApproved(currentUser);

  const { caseId } = await params;
  const access = await getCaseAccessContext(currentUser, caseId);

  const uiRole = prismaRoleToUiRole(currentUser.role);
  if (!["LAWYER", "ADMIN", "STAFF"].includes(uiRole)) {
    notFound();
  }

  const initialData = await getLitigationCommandCenterService(currentUser, caseId).catch(
    () => null,
  );

  if (!initialData) {
    notFound();
  }

  const readOnly = !canRunLitigationCommandCenterActions(access);

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
      <nav className="text-sm text-aibeop-muted">
        <Link href={`/cases/${caseId}`} className="underline">
          ← 사건 상세
        </Link>
      </nav>
      <LitigationCommandCenterClient
        caseId={caseId}
        initialData={initialData}
        readOnly={readOnly}
      />
    </div>
  );
}
