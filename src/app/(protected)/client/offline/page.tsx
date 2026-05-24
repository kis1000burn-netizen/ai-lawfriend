import Link from "next/link";
import { forbidden, redirect } from "next/navigation";
import { CLIENT_PORTAL_PWA_APP_NAME } from "@/features/client-portal/client-portal-pwa.policy";
import { CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS, CLIENT_PORTAL_MOBILE_TOUCH_TARGET_CLASS } from "@/features/client-portal/client-portal-mobile-a11y.policy";
import { ClientPortalOfflineRetryButton } from "@/components/client-portal/client-portal-offline-retry-button";
import { getSessionUser } from "@/lib/get-session-user";
import { prismaRoleToUiRole } from "@/lib/role-map";

export default async function ClientPortalOfflinePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");

  const role = prismaRoleToUiRole(sessionUser.role);
  if (role !== "CLIENT") forbidden();

  return (
    <main className="px-4 py-10" data-testid="client-portal-offline-page">
      <section
        className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
        aria-labelledby="client-portal-offline-title"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
          Product Phase 21-E · Offline
        </p>
        <h1 id="client-portal-offline-title" className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">
          오프라인 상태입니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          {CLIENT_PORTAL_PWA_APP_NAME}은 사건 본문·첨부·대화 내용을 오프라인에 저장하지 않습니다.
          네트워크 연결 후 다시 시도해 주세요.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/client/cases?source=pwa"
            aria-label="사건 포털 목록으로 이동"
            className={[
              "rounded-xl bg-indigo-900 px-4 py-3 text-sm font-semibold text-white sm:min-h-11 sm:text-base",
              CLIENT_PORTAL_MOBILE_TOUCH_TARGET_CLASS,
              CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
            ].join(" ")}
          >
            사건 포털로 이동
          </Link>
          <ClientPortalOfflineRetryButton />
        </div>
      </section>
    </main>
  );
}
