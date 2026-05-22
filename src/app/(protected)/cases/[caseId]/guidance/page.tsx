import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";
import { getSessionUser } from "@/lib/get-session-user";
import { assertCaseAccess } from "@/lib/authz";
import { buildPermissionContextForCase } from "@/features/cases/case.permissions";
import { buildGuidanceCardForCaseView } from "@/features/case-guidance/build-case-guidance-view";
import { CASE_INTERVIEW_ANSWERS_MAP_NOTE_TYPE } from "@/features/case-interview/case-interview.repository";
import { mergedInterviewAnswersRecordForPreview } from "@/features/case-interview/interview-answers-for-ui";
import { CaseGuidanceCardClient } from "@/components/cases/case-guidance-card-client";

export default async function CaseGuidancePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login");
  }

  await redirectLawyerToVerificationUnlessApproved(sessionUser);

  const [caseRecord, answersMemoRow] = await Promise.all([
    prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        status: true,
        ownerUserId: true,
        assignedLawyerUserId: true,
        assignedStaffUserId: true,
        interviews: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { status: true, answersJson: true },
        },
      },
    }),
    prisma.caseTimelineMemo.findFirst({
      where: {
        caseId,
        noteType: CASE_INTERVIEW_ANSWERS_MAP_NOTE_TYPE,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      select: { content: true },
    }),
  ]);

  if (!caseRecord) {
    notFound();
  }

  const permCtx = await buildPermissionContextForCase(sessionUser, caseRecord);
  assertCaseAccess("case.read", permCtx);

  const latest = caseRecord.interviews[0];
  const interviewCompleted = latest?.status === "COMPLETED";
  const answersMerged = mergedInterviewAnswersRecordForPreview(
    answersMemoRow?.content,
    latest?.answersJson,
  );

  const model = buildGuidanceCardForCaseView({
    category: caseRecord.category,
    description: caseRecord.description,
    title: caseRecord.title,
    interviewCompleted,
    interviewAnswers: answersMerged,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">사건 ID · {caseId}</p>
          <p className="text-lg font-semibold text-slate-900">{caseRecord.title}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/cases/${caseId}`}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            사건 상세
          </Link>
          <Link
            href={`/cases/${caseId}/interview`}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            AI 인터뷰
          </Link>
        </div>
      </div>

      <CaseGuidanceCardClient model={model} />
    </div>
  );
}
