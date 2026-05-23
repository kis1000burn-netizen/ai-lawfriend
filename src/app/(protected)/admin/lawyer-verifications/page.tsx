import Link from "next/link";
import { redirect } from "next/navigation";
import type { LawyerVerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { isAdminRole, isStaffRole } from "@/lib/auth/roles";
import { resolveLawyerVerificationListStatuses } from "@/lib/admin/lawyer-verification-filters";
import { fetchLawyerVerificationDuplicateBadges } from "@/lib/admin/lawyer-verification-duplicates";

type DocBucketFilter = "legacy" | "private" | "migrated";

function verificationDocBucketWhere(
  bucket: DocBucketFilter | undefined,
):
  | { verificationDocuments: { some: Record<string, unknown> } }
  | undefined {
  if (!bucket) return undefined;
  if (bucket === "legacy") {
    return {
      verificationDocuments: {
        some: { storageKey: null, NOT: { fileUrl: null } },
      },
    };
  }
  if (bucket === "private") {
    return {
      verificationDocuments: {
        some: { storageKey: { not: null }, migratedAt: null },
      },
    };
  }
  return {
    verificationDocuments: {
      some: { migratedAt: { not: null } },
    },
  };
}

/** 가입 증빙 클레임 실패 등 증빙 0건 프로필(운영 정리 큐). */
function verificationDocumentsMissingWhere(
  gap: boolean,
): { verificationDocuments: { none: Record<string, never> } } | undefined {
  if (!gap) return undefined;
  return { verificationDocuments: { none: {} } };
}

const STATUS_LABEL: Record<LawyerVerificationStatus, string> = {
  NOT_SUBMITTED: "미제출",
  PENDING: "심사 대기",
  NEEDS_MORE_INFO: "보완 요청",
  APPROVED: "승인",
  REJECTED: "반려",
  SUSPENDED: "정지",
};

export default async function AdminLawyerVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; docBucket?: string; docGap?: string }>;
}) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");
  if (!isAdminRole(sessionUser.role) && !isStaffRole(sessionUser.role)) {
    redirect("/dashboard");
  }
  const canReviewLawyerVerification = isAdminRole(sessionUser.role);

  const { status: statusParam, docBucket: docBucketRaw, docGap: docGapRaw } = await searchParams;
  const docGapActive = docGapRaw === "1";
  const statusFilter = resolveLawyerVerificationListStatuses(statusParam);
  const docBucket =
    docBucketRaw === "legacy" || docBucketRaw === "private" || docBucketRaw === "migrated"
      ? docBucketRaw
      : undefined;
  const effectiveDocBucket = docGapActive ? undefined : docBucket;

  const [items, counts] = await Promise.all([
    prisma.lawyerProfile.findMany({
      where: {
        user: { role: "LAWYER" },
        verificationStatus: { in: statusFilter },
        ...verificationDocBucketWhere(effectiveDocBucket),
        ...verificationDocumentsMissingWhere(docGapActive),
      },
      orderBy: [{ submittedAt: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        registrationNumber: true,
        barAssociation: true,
        officeName: true,
        verificationStatus: true,
        submittedAt: true,
        user: {
          select: { email: true, name: true, phone: true, status: true },
        },
        _count: {
          select: {
            verificationDocuments: {
              where: {
                storageKey: null,
                NOT: { fileUrl: null },
              },
            },
          },
        },
      },
    }),
    prisma.lawyerProfile.groupBy({
      by: ["verificationStatus"],
      where: { user: { role: "LAWYER" } },
      _count: { _all: true },
    }),
  ]);

  const ids = items.map((r) => r.id);
  const [migratedGroups, privateNewGroups] =
    ids.length === 0
      ? [[], []]
      : await Promise.all([
          prisma.lawyerVerificationDocument.groupBy({
            by: ["lawyerProfileId"],
            where: { lawyerProfileId: { in: ids }, migratedAt: { not: null } },
            _count: { _all: true },
          }),
          prisma.lawyerVerificationDocument.groupBy({
            by: ["lawyerProfileId"],
            where: {
              lawyerProfileId: { in: ids },
              storageKey: { not: null },
              migratedAt: null,
            },
            _count: { _all: true },
          }),
        ]);

  const migratedCountByProfile = new Map(migratedGroups.map((g) => [g.lawyerProfileId, g._count._all]));
  const privateNewCountByProfile = new Map(
    privateNewGroups.map((g) => [g.lawyerProfileId, g._count._all]),
  );

  const dupMap = await fetchLawyerVerificationDuplicateBadges(
    items.map(({ id, registrationNumber, barAssociation }) => ({
      id,
      registrationNumber,
      barAssociation,
    })),
  );

  function buildListHref(override: {
    status?: LawyerVerificationStatus | null;
    docBucket?: DocBucketFilter | null;
    docGap?: boolean;
  } = {}) {
    const p = new URLSearchParams();
    const nextStatus = "status" in override ? override.status : statusParam;
    if (nextStatus && nextStatus !== "" && nextStatus !== "QUEUE") {
      p.set("status", nextStatus as string);
    }
    const nextGap = "docGap" in override ? override.docGap! : docGapActive;
    const nextBucket =
      "docBucket" in override ? override.docBucket : nextGap ? undefined : docBucket;
    if (nextBucket) p.set("docBucket", nextBucket);
    if (nextGap) p.set("docGap", "1");
    const q = p.toString();
    return `/admin/lawyer-verifications${q ? `?${q}` : ""}`;
  }

  function filterLink(label: string, status: LawyerVerificationStatus | null) {
    const href =
      status === null ? buildListHref({ status: null }) : buildListHref({ status });
    const active =
      status === null
        ? !statusParam || statusParam === "" || statusParam === "QUEUE"
        : statusParam === status;
    return (
      <Link
        href={href}
        className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
          active
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-aibeop-subtle hover:bg-slate-50"
        }`}
      >
        {label}
      </Link>
    );
  }

  function docBucketFilterLink(label: string, bucket: DocBucketFilter | null) {
    const href =
      bucket === null
        ? buildListHref({ docBucket: null })
        : buildListHref({ docBucket: bucket, docGap: false });
    const active = bucket === null ? docBucket === undefined : docBucket === bucket;
    return (
      <Link
        href={href}
        className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
          active
            ? "border-indigo-900 bg-indigo-900 text-white"
            : "border-slate-200 bg-white text-aibeop-subtle hover:bg-slate-50"
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-aibeop-subtle">
        <Link
          href={isAdminRole(sessionUser.role) ? "/admin" : "/dashboard"}
          className="font-medium text-aibeop-subtle underline hover:text-black"
        >
          {isAdminRole(sessionUser.role) ? "관리자 콘솔" : "대시보드"}
        </Link>
        <span aria-hidden>·</span>
        <span className="text-aibeop-faint">변호사 자격 검증</span>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-aibeop-text">변호사 자격 검증</h1>
        <p className="mt-1 text-sm text-aibeop-muted">
          등록번호·지방변호사회·사무소 정보와 제출 증빙을 확인합니다.
          {canReviewLawyerVerification ? (
            <>
              {" "}
              <strong className="font-semibold text-aibeop-text">승인·보완·반려·정지</strong>는
              플랫폼 관리자(ADMIN / SUPER_ADMIN)만 처리할 수 있습니다.
            </>
          ) : (
            <>
              {" "}
              운영(STAFF)은 <strong className="font-semibold text-aibeop-text">조회</strong>만
              가능합니다.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterLink("승인 큐", null)}
        {filterLink("PENDING만", "PENDING")}
        {filterLink("보완 요청만", "NEEDS_MORE_INFO")}
        {filterLink("승인됨", "APPROVED")}
        {filterLink("반려", "REJECTED")}
        {filterLink("정지", "SUSPENDED")}
      </div>

      {counts.length > 0 ? (
        <p className="text-xs text-aibeop-subtle">
          상태별 건수(전체 변호사 프로필):{" "}
          {counts
            .map((c) => `${STATUS_LABEL[c.verificationStatus]} ${c._count._all}`)
            .join(" · ")}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {docBucketFilterLink("증빙: 전체", null)}
        {docBucketFilterLink("Legacy", "legacy")}
        {docBucketFilterLink("Private(신규)", "private")}
        {docBucketFilterLink("Migrated", "migrated")}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={buildListHref({ docGap: false })}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
            !docGapActive
              ? "border-rose-900 bg-rose-900 text-white"
              : "border-slate-200 bg-white text-aibeop-subtle hover:bg-slate-50"
          }`}
        >
          증빙누락 큐 끄기
        </Link>
        <Link
          href={buildListHref({ docGap: true, docBucket: null })}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
            docGapActive
              ? "border-rose-900 bg-rose-900 text-white"
              : "border-slate-200 bg-white text-aibeop-subtle hover:bg-slate-50"
          }`}
          title="등록된 LawyerVerificationDocument 행이 하나도 없음(가입 클레임 실패 등)"
        >
          증빙 0건 후보만
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-aibeop-muted">
            <tr>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">변호사</th>
              <th className="px-3 py-2">등록·중복</th>
              <th className="px-3 py-2">지방회</th>
              <th className="px-3 py-2">사무소</th>
              <th className="px-3 py-2">증빙</th>
              <th className="px-3 py-2">제출일</th>
              <th className="px-3 py-2"> </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-aibeop-subtle">
                  표시할 항목이 없습니다. 필터를 바꿔 보세요.
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const dup = dupMap.get(row.id);
                const legacyN = row._count.verificationDocuments;
                const privateN = privateNewCountByProfile.get(row.id) ?? 0;
                const migratedN = migratedCountByProfile.get(row.id) ?? 0;
                const hasDocSignal = legacyN > 0 || privateN > 0 || migratedN > 0;
                return (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                  <td className="px-3 py-2 font-medium text-aibeop-subtle">
                    {STATUS_LABEL[row.verificationStatus]}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-aibeop-text">{row.user.name}</div>
                    <div className="text-xs text-aibeop-subtle">{row.user.email}</div>
                    <div className="text-xs text-aibeop-faint">계정 {row.user.status}</div>
                  </td>
                  <td className="px-3 py-2 text-aibeop-subtle">
                    <div>{row.registrationNumber ?? "—"}</div>
                    {dup ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {dup.hasApprovedConflict ? (
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-900">
                            승인 충돌
                          </span>
                        ) : null}
                        {dup.hasQueueConflict ? (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-950">
                            대기 중복
                          </span>
                        ) : null}
                        {!dup.hasApprovedConflict && !dup.hasQueueConflict ? (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-aibeop-muted">
                            동일 등록·회 {dup.otherCount}건
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-aibeop-subtle">{row.barAssociation ?? "—"}</td>
                  <td className="px-3 py-2 text-aibeop-subtle">{row.officeName ?? "—"}</td>
                  <td className="px-3 py-2 text-aibeop-subtle">
                    <div className="flex flex-wrap gap-1">
                      {legacyN > 0 ? (
                        <span
                          className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-950"
                          title="fileUrl만 있고 storageKey 없음(P4 이관 대상)."
                        >
                          Legacy {legacyN}
                        </span>
                      ) : null}
                      {privateN > 0 ? (
                        <span
                          className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-aibeop-subtle"
                          title="storageKey 있음·아직 migratedAt 없음(신규 private 업로드)."
                        >
                          Private {privateN}
                        </span>
                      ) : null}
                      {migratedN > 0 ? (
                        <span
                          className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-950"
                          title="P4 이관으로 migratedAt 이 설정된 증빙."
                        >
                          Migrated {migratedN}
                        </span>
                      ) : null}
                      {!hasDocSignal ? <span className="text-aibeop-faint">—</span> : null}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-aibeop-muted">
                    {row.submittedAt
                      ? new Date(row.submittedAt).toLocaleString("ko-KR")
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/lawyer-verifications/${row.id}`}
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      검토
                    </Link>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
