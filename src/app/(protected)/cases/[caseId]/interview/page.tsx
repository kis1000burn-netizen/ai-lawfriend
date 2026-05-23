/* [FILE-016] `canPerformCaseInterview`·`CASE_STATUS_LABELS` — 인터뷰 POST body는 API에서 `.strict()`(Batch B). */
/* B-G1: `getAllowedCaseActions`·`COMPLETE_INTERVIEW` — 상세 `CaseStatusActions`와 동일 조건으로 전용 화면 완료 CTA. */
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import {
  canPerformCaseInterview,
  getCaseAccessContext,
} from "@/features/cases/case.permissions";
import CaseInterviewClient from "@/components/cases/case-interview-client";
import { CASE_STATUS_LABELS, INTERVIEW_STATUS_LABELS } from "@/lib/definitions";
import { getAllowedCaseActions } from "@/lib/case-action-guard";
import { prismaRoleToUiRole } from "@/lib/role-map";
import { loadLawyerVoiceReviewFlagsByCaseId } from "@/lib/voice/voice-lawyer-review-flags.repository";

type PageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function CaseInterviewPage({ params }: PageProps) {
  const currentUser = await requireSessionUser();
  await redirectLawyerToVerificationUnlessApproved(currentUser);

  const { caseId } = await params;

  const access = await getCaseAccessContext(currentUser, caseId);
  const canEditInterview = canPerformCaseInterview(access);

  const found = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      interviews: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true },
      },
    },
  });

  if (!found) {
    notFound();
  }

  const caseStatusLabel =
    CASE_STATUS_LABELS[found.status as keyof typeof CASE_STATUS_LABELS] ?? found.status;
  const latestInterview = found.interviews[0];
  const interviewStatusLabel = latestInterview
    ? INTERVIEW_STATUS_LABELS[
        latestInterview.status as keyof typeof INTERVIEW_STATUS_LABELS
      ] ?? latestInterview.status
    : null;

  const interviewCompleted = latestInterview?.status === "COMPLETED";
  const showCompleteInterviewCta = getAllowedCaseActions({
    role: prismaRoleToUiRole(currentUser.role),
    caseStatus: found.status,
    facts: {
      interviewCompleted,
      hasDraftDocument: false,
      hasApprovedDocument: false,
      hasLockedDocument: false,
    },
  }).COMPLETE_INTERVIEW;

  const showLawyerVoiceReviewPanel =
    currentUser.role === "LAWYER" ||
    currentUser.role === "ADMIN" ||
    currentUser.role === "STAFF" ||
    currentUser.role === "SUPER_ADMIN";

  const voiceTranscriptRows = showLawyerVoiceReviewPanel
    ? (
        await prisma.voiceTranscript.findMany({
          where: { caseId: found.id },
          orderBy: { createdAt: "desc" },
          select: {
            questionKey: true,
            status: true,
            draftText: true,
            confirmedAt: true,
          },
        })
      ).map((row) => ({
        questionKey: row.questionKey,
        status: row.status,
        draftText: row.draftText,
        confirmedAt: row.confirmedAt,
      }))
    : [];

  const lawyerReviewFlags = showLawyerVoiceReviewPanel
    ? await loadLawyerVoiceReviewFlagsByCaseId(found.id)
    : {};

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-sm text-slate-500">AI 인터뷰</div>
          <h1 className="text-2xl font-semibold">{found.title}</h1>
          <div className="text-sm text-slate-600">
            카테고리: {found.category ?? "미분류"} · 사건 상태: {caseStatusLabel}
            {interviewStatusLabel ? (
              <> · 인터뷰: {interviewStatusLabel}</>
            ) : (
              <> · 인터뷰: 없음</>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/cases/${found.id}/guidance`}
            className="rounded-xl border border-emerald-700 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
          >
            사건 진단 카드
          </Link>
          <Link
            href={`/cases/${found.id}`}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            사건 상세로 돌아가기
          </Link>
        </div>
      </div>

      <CaseInterviewClient
        caseId={found.id}
        caseStatus={found.status}
        canEditInterview={canEditInterview}
        showCompleteInterviewCta={showCompleteInterviewCta}
        showLawyerVoiceReviewPanel={showLawyerVoiceReviewPanel}
        voiceTranscriptRows={voiceTranscriptRows}
        lawyerReviewFlags={lawyerReviewFlags}
      />
    </div>
  );
}
