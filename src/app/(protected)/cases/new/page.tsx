import CaseForm from "@/components/cases/case-form";
import { CaseIntakeSocialProofCard } from "@/components/cases/case-intake-social-proof-card";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { buildCaseIntakeSocialProof } from "@/lib/cases/case-intake-social-proof";
import { prisma } from "@/lib/prisma";

export default async function NewCasePage() {
  const currentUser = await requireSessionUser();
  await redirectLawyerToVerificationUnlessApproved(currentUser);
  const recentCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [recentIntakeCount, activeCaseCount] = await Promise.all([
    prisma.case.count({
      where: {
        createdAt: { gte: recentCutoff },
        status: { not: "DELETED" },
      },
    }),
    prisma.case.count({
      where: {
        status: { notIn: ["DELETED", "CLOSED", "REJECTED"] },
      },
    }),
  ]);
  const socialProof = buildCaseIntakeSocialProof({
    recentIntakeCount,
    activeCaseCount,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm text-aibeop-subtle">사건 생성</p>
        <h1 className="text-3xl font-bold text-aibeop-text">새 사건 등록</h1>
      </div>

      <CaseIntakeSocialProofCard socialProof={socialProof} />

      <CaseForm mode="create" />
    </div>
  );
}
