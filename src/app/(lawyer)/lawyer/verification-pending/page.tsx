import Link from "next/link";
import { requireLawyer } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { LawyerPendingVerificationDocsClient } from "@/components/lawyer/lawyer-pending-verification-docs-client";

export default async function LawyerVerificationPendingPage() {
  const user = await requireLawyer();

  const profile = await prisma.lawyerProfile.findUnique({
    where: { userId: user.id },
    select: {
      verificationStatus: true,
      registrationNumber: true,
      barAssociation: true,
      submittedAt: true,
      reviewedAt: true,
      rejectionReason: true,
      verificationDocuments: {
        orderBy: { uploadedAt: "desc" },
        select: {
          id: true,
          type: true,
          fileName: true,
          uploadedAt: true,
        },
      },
    },
  });

  const status = profile?.verificationStatus ?? "NOT_SUBMITTED";

  const docRows =
    profile?.verificationDocuments.map((d) => ({
      id: d.id,
      type: d.type,
      fileName: d.fileName,
      uploadedAt: d.uploadedAt.toISOString(),
    })) ?? [];

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-aibeop-line bg-aibeop-card p-8 shadow-soft">
      <h1 className="text-2xl font-bold text-aibeop-text">변호사 자격 확인 중</h1>
      <p className="mt-3 text-sm leading-relaxed text-aibeop-muted">
        계정은 활성화되어 로그인할 수 있습니다. 다만{" "}
        <strong className="text-aibeop-text">등록번호·증빙 검토 및 관리자 승인</strong>이 완료되기
        전에는 사건 검토, 문서 검토, 보완요청 등 변호사 전용 기능을 사용할 수 없습니다.
      </p>
      <dl className="mt-6 space-y-3 rounded-xl border border-aibeop-line bg-aibeop-surface p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-aibeop-muted">이름</dt>
          <dd className="font-medium text-aibeop-text">{user.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-aibeop-muted">이메일</dt>
          <dd className="font-medium text-aibeop-text">{user.email}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-aibeop-muted">심사 상태</dt>
          <dd className="font-semibold text-aibeop-deep">{status}</dd>
        </div>
        {profile?.registrationNumber ? (
          <div className="flex justify-between gap-4">
            <dt className="text-aibeop-muted">등록번호</dt>
            <dd className="text-aibeop-text">{profile.registrationNumber}</dd>
          </div>
        ) : null}
        {profile?.rejectionReason ? (
          <div className="mt-2 border-t border-aibeop-line pt-3">
            <dt className="text-aibeop-muted">안내</dt>
            <dd className="mt-1 text-aibeop-text">{profile.rejectionReason}</dd>
          </div>
        ) : null}
      </dl>

      {status !== "APPROVED" ? (
        <LawyerPendingVerificationDocsClient documents={docRows} />
      ) : null}

      <p className="mt-6 text-xs leading-relaxed text-aibeop-muted">
        증빙은 위에서 추가·보완할 수 있습니다. 그 밖의 문의는 플랫폼 관리자에게 연락해 주세요.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/login"
          className="rounded-xl border border-aibeop-line bg-aibeop-surface px-4 py-2 text-sm font-semibold text-aibeop-deep hover:bg-aibeop-soft"
        >
          로그인 화면으로
        </Link>
      </div>
    </div>
  );
}
