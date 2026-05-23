import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import type { LawyerVerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { isAdminRole, isStaffRole } from "@/lib/auth/roles";
import { LawyerVerificationReviewActions } from "@/components/admin/lawyer-verification-review-actions";
import { fetchLawyerVerificationDuplicateBadges } from "@/lib/admin/lawyer-verification-duplicates";
import { isLawyerVerificationLegacyExternalOnlyDoc } from "@/lib/lawyer/lawyer-verification-legacy-policy";
import { lawyerVerificationDocumentTypeLabelKo } from "@/lib/lawyer/lawyer-verification-document-types";

const STATUS_LABEL: Record<LawyerVerificationStatus, string> = {
  NOT_SUBMITTED: "미제출",
  PENDING: "심사 대기",
  NEEDS_MORE_INFO: "보완 요청",
  APPROVED: "승인",
  REJECTED: "반려",
  SUSPENDED: "정지",
};

export default async function AdminLawyerVerificationDetailPage({
  params,
}: {
  params: Promise<{ lawyerProfileId: string }>;
}) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");
  if (!isAdminRole(sessionUser.role) && !isStaffRole(sessionUser.role)) {
    redirect("/dashboard");
  }
  const canReviewLawyerVerification = isAdminRole(sessionUser.role);

  const { lawyerProfileId } = await params;

  const profile = await prisma.lawyerProfile.findFirst({
    where: { id: lawyerProfileId, user: { role: "LAWYER" } },
    select: {
      id: true,
      registrationNumber: true,
      barAssociation: true,
      officeName: true,
      officeAddress: true,
      officePhone: true,
      websiteUrl: true,
      specialtiesNote: true,
      verificationStatus: true,
      submittedAt: true,
      reviewedAt: true,
      rejectionReason: true,
      integrityAttestationAcceptedAt: true,
      integrityAttestationVersion: true,
      signupRiskIpFingerprint: true,
      signupRiskUserAgent: true,
      user: {
        select: { id: true, email: true, name: true, phone: true, status: true },
      },
      reviewedBy: { select: { name: true, email: true } },
      verificationDocuments: {
        orderBy: { uploadedAt: "asc" },
        select: {
          id: true,
          type: true,
          fileName: true,
          fileUrl: true,
          storageKey: true,
          migratedAt: true,
          uploadedAt: true,
        },
      },
    },
  });

  if (!profile) notFound();

  const dupMap = await fetchLawyerVerificationDuplicateBadges([
    {
      id: profile.id,
      registrationNumber: profile.registrationNumber,
      barAssociation: profile.barAssociation,
    },
  ]);
  const dup = dupMap.get(profile.id);

  const sameSignupIpCount =
    profile.signupRiskIpFingerprint?.trim()
      ? await prisma.lawyerProfile.count({
          where: {
            signupRiskIpFingerprint: profile.signupRiskIpFingerprint.trim(),
            id: { not: profile.id },
          },
        })
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-aibeop-subtle">
        <Link
          href={canReviewLawyerVerification ? "/admin" : "/dashboard"}
          className="font-medium text-aibeop-subtle underline hover:text-black"
        >
          {canReviewLawyerVerification ? "관리자 콘솔" : "대시보드"}
        </Link>
        <span aria-hidden>·</span>
        <Link
          href="/admin/lawyer-verifications"
          className="font-medium text-aibeop-subtle underline hover:text-black"
        >
          변호사 자격 검증
        </Link>
        <span aria-hidden>·</span>
        <span className="text-aibeop-faint">상세</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-aibeop-text">자격 검토 · {profile.user.name}</h1>
          <p className="mt-1 text-sm text-aibeop-muted">
            현재 심사 상태:{" "}
            <strong className="text-aibeop-text">
              {STATUS_LABEL[profile.verificationStatus]} ({profile.verificationStatus})
            </strong>
          </p>
          {dup ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {dup.hasApprovedConflict ? (
                <span className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 font-medium text-rose-900">
                  동일 등록번호·지방회로 이미 <strong>승인된</strong> 다른 프로필이 있습니다.
                </span>
              ) : null}
              {dup.hasQueueConflict ? (
                <span className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 font-medium text-amber-950">
                  심사 대기·보완 요청 중인 <strong>중복 제출</strong>이 있습니다.
                </span>
              ) : null}
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-aibeop-subtle">
                중복 의심 프로필 {dup.otherCount}건 — 목록에서 동일 키로 조회됩니다.
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-aibeop-subtle">계정</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-aibeop-subtle">이메일</dt>
              <dd className="text-aibeop-text">{profile.user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-aibeop-subtle">전화</dt>
              <dd className="text-aibeop-text">{profile.user.phone ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-aibeop-subtle">User.status</dt>
              <dd className="text-aibeop-text">{profile.user.status}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-aibeop-subtle">변호사 등록·사무소</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-aibeop-subtle">등록번호</dt>
              <dd className="text-aibeop-text">{profile.registrationNumber ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-aibeop-subtle">지방변호사회</dt>
              <dd className="text-aibeop-text">{profile.barAssociation ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-aibeop-subtle">사무소명</dt>
              <dd className="text-aibeop-text">{profile.officeName ?? "—"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-aibeop-subtle">사무실 주소</dt>
              <dd className="text-aibeop-text">{profile.officeAddress ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-aibeop-subtle">사무실 전화</dt>
              <dd className="text-aibeop-text">{profile.officePhone ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-aibeop-subtle">웹사이트</dt>
              <dd className="break-all text-aibeop-text">{profile.websiteUrl ?? "—"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-aibeop-subtle">전문 분야 메모</dt>
              <dd className="text-aibeop-text">{profile.specialtiesNote ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-aibeop-subtle">가입 시 무결 서약 · 접속 패턴(참고)</h2>
        <p className="mt-1 text-xs text-aibeop-subtle">
          IP는 원문을 저장하지 않고 HMAC 지문만 보관합니다. 동일 패턴 건수는 다중 신청 우려 시
          참고용입니다.
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex flex-wrap justify-between gap-4">
            <dt className="text-aibeop-subtle">무결 서약 접수</dt>
            <dd className="text-right text-aibeop-text">
              {profile.integrityAttestationAcceptedAt
                ? new Date(profile.integrityAttestationAcceptedAt).toLocaleString("ko-KR")
                : "—"}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-4">
            <dt className="text-aibeop-subtle">서약 문구 버전</dt>
            <dd className="break-all text-aibeop-text">
              {profile.integrityAttestationVersion ?? "—"}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-4">
            <dt className="text-aibeop-subtle">가입 접속 지문(IP)</dt>
            <dd className="break-all font-mono text-xs text-aibeop-text">
              {profile.signupRiskIpFingerprint
                ? `${profile.signupRiskIpFingerprint.slice(0, 12)}… (전체 ${profile.signupRiskIpFingerprint.length}자)`
                : "—"}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-4">
            <dt className="text-aibeop-subtle">동일 접속 지문 프로필</dt>
            <dd className="text-aibeop-text">
              {profile.signupRiskIpFingerprint?.trim()
                ? `${sameSignupIpCount}건 (본 프로필 제외)`
                : "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-aibeop-subtle">User-Agent 앞부분</dt>
            <dd className="break-all text-xs text-aibeop-text">{profile.signupRiskUserAgent ?? "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-aibeop-subtle">제출 증빙</h2>
        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-aibeop-muted">
          <span>
            <span className="mr-1 rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-950">
              Legacy
            </span>
            외부 fileUrl만
          </span>
          <span>
            <span className="mr-1 rounded bg-slate-200 px-1.5 py-0.5 font-semibold text-aibeop-subtle">
              Private
            </span>
            storageKey·신규 업로드
          </span>
          <span>
            <span className="mr-1 rounded bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-950">
              Migrated
            </span>
            P4 이관 완료(migratedAt)
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-aibeop-muted">
          「열기」는 <strong className="text-aibeop-subtle">관리자 세션</strong>이 있는 경우에만 동작하며, 요청 시{" "}
          <strong className="text-aibeop-subtle">LAWYER_VERIFICATION_DOCUMENT_ACCESS</strong> 감사로그가
          남습니다. 링크만 타인에게 넘겨도 외부인은 볼 수 없습니다. 민감 자료는 DB에 공개 URL을 두지 않고{" "}
          <strong className="text-aibeop-subtle">storageKey + 짧은 만료 signed URL</strong>로 보관하는 것이
          기준입니다. <strong className="text-aibeop-subtle">fileUrl</strong>만 있는 행은{" "}
          <strong className="text-aibeop-subtle">Legacy</strong>로 표시되며(P4 이관 스크립트 대상), 이관 후에도
          <strong className="text-aibeop-subtle"> fileUrl</strong> 컬럼은 바로 삭제하지 않습니다.
        </p>
        {profile.verificationDocuments.length === 0 ? (
          <p className="mt-2 text-sm text-aibeop-subtle">등록된 파일이 없습니다.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {profile.verificationDocuments.map((doc) => {
              const legacyOnly = isLawyerVerificationLegacyExternalOnlyDoc(doc);
              const hasStorage = !!doc.storageKey?.trim();
              return (
              <li
                key={doc.id}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 py-2 last:border-0"
              >
                <div>
                  <span className="font-medium text-aibeop-text">{doc.fileName}</span>
                  <span className="ml-2 text-xs text-aibeop-subtle">
                    ({lawyerVerificationDocumentTypeLabelKo(doc.type)}){" "}
                    <span className="text-aibeop-faint">[{doc.type}]</span>
                  </span>
                  {legacyOnly ? (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-950">
                      Legacy
                    </span>
                  ) : null}
                  {hasStorage ? (
                    <span className="ml-2 text-xs text-aibeop-subtle">
                      {doc.migratedAt ? (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-950">
                          Migrated
                        </span>
                      ) : (
                        <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-aibeop-subtle">
                          Private
                        </span>
                      )}
                    </span>
                  ) : null}
                  {hasStorage && doc.fileUrl?.trim() ? (
                    <span className="ml-2 text-xs text-aibeop-faint">(+ legacy fileUrl 필드 보존)</span>
                  ) : null}
                  <div className="text-xs text-aibeop-faint">
                    {new Date(doc.uploadedAt).toLocaleString("ko-KR")}
                  </div>
                </div>
                <a
                  href={`/api/admin/lawyer-verifications/${profile.id}/documents/${doc.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-indigo-600 hover:underline"
                >
                  열기(감사 로그)
                </a>
              </li>
            );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-aibeop-subtle">
        <h2 className="text-sm font-semibold text-aibeop-subtle">최근 심사 기록</h2>
        <dl className="mt-2 space-y-1">
          <div>
            <span className="text-aibeop-subtle">reviewedAt</span> —{" "}
            {profile.reviewedAt ? new Date(profile.reviewedAt).toLocaleString("ko-KR") : "—"}
          </div>
          <div>
            <span className="text-aibeop-subtle">reviewedBy</span> —{" "}
            {profile.reviewedBy
              ? `${profile.reviewedBy.name} (${profile.reviewedBy.email})`
              : "—"}
          </div>
          <div className="mt-2">
            <span className="text-aibeop-subtle">rejectionReason / 안내</span>
            <p className="mt-1 whitespace-pre-wrap text-aibeop-text">
              {profile.rejectionReason ?? "—"}
            </p>
          </div>
        </dl>
      </div>

      {canReviewLawyerVerification ? (
        <LawyerVerificationReviewActions lawyerProfileId={profile.id} />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-aibeop-subtle">
          심사 처리(승인·보완 요청·반려·정지)는 플랫폼 관리자(ADMIN / SUPER_ADMIN)만 가능합니다.
          STAFF 계정으로는 조회 및 증빙 열람만 이용할 수 있습니다.
        </div>
      )}
    </div>
  );
}
