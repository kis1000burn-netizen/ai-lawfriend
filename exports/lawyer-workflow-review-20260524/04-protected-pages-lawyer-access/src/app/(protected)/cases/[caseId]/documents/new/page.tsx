import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import DocumentDraftClient from "@/components/cases/document-draft-client";
import { buildVoiceDocumentFinalizeGateUiSnapshotForCase } from "@/lib/voice/voice-document-finalize-gate.service";
import { prismaRoleToUiRole } from "@/lib/role-map";

type PageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function CaseDocumentDraftPage({ params }: PageProps) {
  const currentUser = await requireSessionUser();
  await redirectLawyerToVerificationUnlessApproved(currentUser);
  const { caseId } = await params;

  await getCaseAccessContext(currentUser, caseId);

  const found = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, title: true },
  });

  if (!found) {
    notFound();
  }

  const uiRole = prismaRoleToUiRole(currentUser.role);
  const voiceDocumentFinalizeGateSnapshot = ["LAWYER", "ADMIN", "STAFF"].includes(uiRole)
    ? await buildVoiceDocumentFinalizeGateUiSnapshotForCase(caseId)
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-2">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-sm text-aibeop-subtle">문서 초안 생성</div>
          <h1 className="text-2xl font-semibold text-aibeop-text">사건 문서 초안 생성</h1>
          <p className="text-sm text-aibeop-muted">
            인터뷰 요약을 바탕으로 사실관계 정리서, 진술서 초안, 상담 전 질문 목록 등을 생성합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/cases/${caseId}`}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
          >
            사건 상세로 돌아가기
          </Link>
        </div>
      </div>

      <DocumentDraftClient
        caseId={caseId}
        voiceDocumentFinalizeGateSnapshot={voiceDocumentFinalizeGateSnapshot}
      />
    </div>
  );
}
