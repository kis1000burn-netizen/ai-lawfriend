import Link from "next/link";
import { getSessionUser } from "@/lib/get-session-user";
import { getPostLoginHrefForSessionRole } from "@/lib/landing/post-login-href";

/** 미들웨어·권한 불일치 시 안내(로그인된 사용자 전제). */
export default async function AccessDeniedPage() {
  const user = await getSessionUser();
  const workspaceHref = user ? getPostLoginHrefForSessionRole(user.role) : "/login";

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">접근 권한이 없습니다</h1>
      <p className="text-sm leading-relaxed text-neutral-600">
        요청한 주소에는 현재 역할로 들어갈 수 없습니다. 변호사 전용(`/lawyer`), 운영·관리자 전용(`/admin`)
        또는 의뢰인 업무(`/dashboard`) 경로가 서로 다릅니다.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href={workspaceHref}
          className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          내 작업실로 이동
        </Link>
        <Link
          href="/login"
          className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
        >
          다른 계정으로 로그인
        </Link>
      </div>
    </main>
  );
}
