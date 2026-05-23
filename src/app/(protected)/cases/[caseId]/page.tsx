/* [FILE-011] 서버에서 `serializeCaseDetail`·soft delete RB; CTA·액션은 클라가 DTO·`allowedLifecycleActions` 소비(Batch A). */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";
import { getSessionUser } from "@/lib/get-session-user";
import { assertCaseAccess } from "@/lib/authz";
import { buildPermissionContextForCase } from "@/features/cases/case.permissions";
import { CaseDetailClient } from "@/components/cases/case-detail-client";
import { serializeCaseDetail } from "@/lib/cases/case-detail-serialize";
import { prismaRoleToUiRole } from "@/lib/role-map";
import { canRequestSoftDelete } from "@/features/cases/case.permissions";
import DeleteCaseButton from "@/components/cases/delete-case-button";
import {
  gongbuhoReviewUxViewerKindFromSessionRole,
  loadCaseGongbuhoReviewUxModel,
} from "@/features/gongbuho/case-gongbuho-review-ux";
import { CaseGongbuhoReviewCard } from "@/components/cases/case-gongbuho-review-card";
import { buildVoiceDocumentFinalizeGateUiSnapshotForCase } from "@/lib/voice/voice-document-finalize-gate.service";

export default async function CaseDetailPage({
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

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      interviews: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      legalDocuments: {
        include: {
          generationTrace: true,
          paragraphs: {
            orderBy: [{ sectionKey: "asc" }, { displayOrder: "asc" }],
          },
          versions: {
            orderBy: { versionNo: "desc" },
            take: 5,
          },
        },
        orderBy: { createdAt: "desc" },
      },
      caseTimelineEvents: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });

  if (!caseRecord) {
    notFound();
  }

  const permCtx = await buildPermissionContextForCase(sessionUser, {
    id: caseId,
    ownerUserId: caseRecord.ownerUserId,
    assignedLawyerUserId: caseRecord.assignedLawyerUserId,
    assignedStaffUserId: caseRecord.assignedStaffUserId,
  });
  assertCaseAccess("case.read", permCtx);

  const serialized = serializeCaseDetail(caseRecord);
  const viewerKind = gongbuhoReviewUxViewerKindFromSessionRole(sessionUser.role);
  const gongbuhoReviewModel = await loadCaseGongbuhoReviewUxModel(caseId, viewerKind);
  const uiRole = prismaRoleToUiRole(sessionUser.role);
  const showVoiceDocumentFinalizeGatePanel = ["LAWYER", "ADMIN", "STAFF"].includes(uiRole);
  const voiceDocumentFinalizeGateSnapshot = showVoiceDocumentFinalizeGatePanel
    ? await buildVoiceDocumentFinalizeGateUiSnapshotForCase(caseId)
    : null;
  const showSoftDelete = canRequestSoftDelete(sessionUser, {
    ownerUserId: caseRecord.ownerUserId,
    status: caseRecord.status,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/cases/${caseId}/guidance`}
            className="rounded-xl border border-emerald-700 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
          >
            사건 진단 카드
          </Link>
          <Link
            href={`/cases/${caseId}/interview`}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            AI 인터뷰
          </Link>
          <Link
            href={`/cases/${caseId}/share`}
            className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            변호사에게 공유하기
          </Link>
          <Link
            href={`/cases/${caseId}/edit`}
            className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            수정
          </Link>
          <Link
            href="/cases"
            className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            목록으로
          </Link>
          {showSoftDelete ? <DeleteCaseButton caseId={caseId} /> : null}
        </div>
      </div>

      {gongbuhoReviewModel ? (
        <CaseGongbuhoReviewCard model={gongbuhoReviewModel} />
      ) : null}

      <CaseDetailClient
        caseRecord={serialized}
        currentUser={{
          id: sessionUser.id,
          role: uiRole,
        }}
        voiceDocumentFinalizeGateSnapshot={voiceDocumentFinalizeGateSnapshot}
      />
    </div>
  );
}
