import Link from "next/link";
import { notFound } from "next/navigation";

import { LawyerIntelligenceReviewConsole } from "@/components/cases/lawyer-intelligence-review-console";
import {
  getCaseIntelligenceReviewSnapshot,
} from "@/features/ai-core/case-intelligence-review.service";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { prisma } from "@/lib/prisma";
import { prismaRoleToUiRole } from "@/lib/role-map";

type PageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function CaseIntelligenceReviewPage({ params }: PageProps) {
  const currentUser = await requireSessionUser();
  await redirectLawyerToVerificationUnlessApproved(currentUser);

  const { caseId } = await params;
  const access = await getCaseAccessContext(currentUser, caseId);

  const uiRole = prismaRoleToUiRole(currentUser.role);
  if (!["LAWYER", "ADMIN", "STAFF"].includes(uiRole)) {
    notFound();
  }

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, title: true },
  });

  if (!caseRecord) {
    notFound();
  }

  const snapshot = await getCaseIntelligenceReviewSnapshot(currentUser, caseId).catch(() => null);
  const readOnly = !(access.isAdmin || access.isAssignedLawyer);

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
      <nav className="text-sm text-aibeop-muted">
        <Link href={`/cases/${caseId}`} className="underline">
          ← 사건 상세
        </Link>
      </nav>
      <LawyerIntelligenceReviewConsole
        caseId={caseId}
        caseTitle={caseRecord.title}
        initialSnapshot={snapshot}
        readOnly={readOnly}
      />
    </div>
  );
}
