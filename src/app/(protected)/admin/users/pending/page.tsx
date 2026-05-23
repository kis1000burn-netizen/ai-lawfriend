import Link from "next/link";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { isAdminRole } from "@/lib/auth/roles";
import { PendingUsersTable } from "@/components/admin/pending-users-table";
import { AUDIT_LOG_USER_APPROVAL_HREF } from "@/lib/admin/audit-log-shortcuts";

const ROLE_QUERY_VALUES: UserRole[] = [
  "USER",
  "LAWYER",
  "STAFF",
  "ADMIN",
  "SUPER_ADMIN",
];

const ROLE_FILTER_LABEL: Partial<Record<UserRole, string>> = {
  USER: "의뢰인",
  LAWYER: "변호사",
  STAFF: "스태프",
  ADMIN: "관리자",
  SUPER_ADMIN: "최상위 관리자",
};

function parseRoleFilter(raw: string | undefined): UserRole | undefined {
  if (!raw?.trim()) return undefined;
  const u = raw.trim().toUpperCase();
  return ROLE_QUERY_VALUES.find((r) => r === u);
}

export default async function AdminPendingUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!isAdminRole(sessionUser.role)) {
    redirect("/dashboard");
  }

  const { role: roleParam } = await searchParams;
  const roleFilter = parseRoleFilter(roleParam);

  const rows = await prisma.user.findMany({
    where: {
      status: "PENDING",
      ...(roleFilter ? { role: roleFilter } : {}),
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-aibeop-subtle">
        <Link href="/admin" className="font-medium text-aibeop-subtle underline hover:text-black">
          관리자 콘솔
        </Link>
        <span aria-hidden>·</span>
        <span className="text-aibeop-faint">가입 승인 대기</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">가입 승인 대기</h1>
          <p className="mt-1 text-sm text-aibeop-subtle">
            신규 가입(PENDING) 계정을 승인하면 ACTIVE로 전환되어 로그인할 수 있습니다. 반려 시
            계정은 정지(SUSPENDED)됩니다. 처리 후 목록이 자동으로 갱신됩니다.
          </p>
          <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-aibeop-subtle">
            이 화면은 <strong className="font-semibold">플랫폼 관리자(ADMIN / SUPER_ADMIN)</strong>
            만 접근할 수 있습니다. 변호사·스태프 계정 메뉴에는 표시되지 않습니다.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-aibeop-muted">
            <strong className="text-aibeop-subtle">역할 열</strong>은 가입 시점의{" "}
            <strong className="text-aibeop-subtle">요청 역할</strong>(USER·LAWYER·STAFF 등)입니다. 이
            화면의 승인은 <strong className="text-aibeop-subtle">ACTIVE</strong> 전환만 수행하며, 다른
            역할로 바꾸거나 권한을 덧씌우지는 않습니다(필요 시 별도 정책·DB 작업).
          </p>
          <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-xs leading-relaxed text-amber-950">
            <strong className="font-semibold">운영 메모</strong> — 표의{" "}
            <strong className="font-semibold">각 행 아래 메모란</strong>에 선택적으로 적을 수 있습니다
            (최대 500자). 승인은 버튼 한 번으로 바로 반영됩니다. 반려는 확인 창에서{" "}
            <strong className="font-semibold">취소</strong>하면 계정 상태가 바뀌지 않습니다. 처리 직후
            화면 상단에 <strong className="font-semibold">토스트형 안내</strong>가 잠시 뜨고, 같은 말로{" "}
            <Link href={AUDIT_LOG_USER_APPROVAL_HREF} className="font-medium underline">
              감사로그
            </Link>
            로 이어집니다. 메모는{" "}
            <strong className="font-semibold">가입 사용자 프로필·DB User 레코드에는 저장되지 않으며</strong>,{" "}
            <span className="whitespace-nowrap">USER_APPROVAL_APPROVE</span> /{" "}
            <span className="whitespace-nowrap">USER_APPROVAL_REJECT</span> 행 메시지와 metadata(
            <span className="whitespace-nowrap">userApprovalNote</span>)에만 남습니다. 목록·상세 모달·JSON으로
            확인할 수 있습니다.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-aibeop-muted">
            <strong className="text-aibeop-subtle">역할 필터</strong> 칩은{" "}
            <strong className="text-aibeop-subtle">의뢰인·변호사·스태프</strong> 가입 요청만 빠르게
            좁힙니다. <strong className="text-aibeop-subtle">ADMIN</strong>·
            <strong className="text-aibeop-subtle">SUPER_ADMIN</strong> 요청은 칩에 없으므로 반드시{" "}
            <strong className="text-aibeop-subtle">전체</strong> 목록에서 찾습니다. (알림·자동 역할 변경은 이
            화면 범위 밖입니다.)
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <Link
            href={AUDIT_LOG_USER_APPROVAL_HREF}
            className="text-sm font-medium text-aibeop-subtle underline"
            title="액션 필터 USER_APPROVAL"
          >
            승인·반려 기록 보기
          </Link>
          <Link
            href="/admin/audit-logs"
            className="text-sm font-medium text-aibeop-muted underline"
          >
            감사로그 전체
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-aibeop-subtle">역할 필터(가입 요청 역할)</span>
        <Link
          href="/admin/users/pending"
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            !roleFilter
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-aibeop-subtle hover:bg-slate-50"
          }`}
          title="모든 가입 요청 역할(ADMIN·SUPER_ADMIN 포함)"
        >
          전체
        </Link>
        {(["USER", "LAWYER", "STAFF"] as const).map((r) => (
          <Link
            key={r}
            href={`/admin/users/pending?role=${r}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              roleFilter === r
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-aibeop-subtle hover:bg-slate-50"
            }`}
            title={`가입 요청 역할이 ${ROLE_FILTER_LABEL[r]} 인 PENDING 만`}
          >
            {ROLE_FILTER_LABEL[r]}
          </Link>
        ))}
      </div>

      <PendingUsersTable
        users={rows.map((r) => ({
          id: r.id,
          email: r.email,
          name: r.name,
          phone: r.phone,
          role: r.role,
          createdAt: r.createdAt.toISOString(),
        }))}
        activeRoleFilter={roleFilter ?? null}
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-6 text-sm text-aibeop-muted">
        <span className="text-xs font-medium uppercase tracking-wide text-aibeop-faint">
          이동
        </span>
        <Link href="/admin" className="font-medium text-aibeop-subtle underline hover:text-black">
          관리자 콘솔
        </Link>
        <Link
          href={AUDIT_LOG_USER_APPROVAL_HREF}
          className="font-medium text-aibeop-subtle underline hover:text-black"
        >
          승인·반려 감사로그
        </Link>
        <Link
          href="/admin/audit-logs"
          className="font-medium text-aibeop-muted underline hover:text-black"
        >
          감사로그 전체
        </Link>
        <Link href="/dashboard" className="font-medium text-aibeop-subtle underline hover:text-black">
          업무 대시보드
        </Link>
      </div>
    </div>
  );
}
