import Link from "next/link";
import { forbidden, notFound, redirect } from "next/navigation";
import { ClientSupplementTrackingClient } from "@/components/supplement-requests/client-supplement-tracking-client";
import { SupplementRequestMvpClient } from "@/components/supplement-requests/supplement-request-mvp-client";
import { getCaseDetailService } from "@/features/cases/case.service";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";
import { getSessionUser } from "@/lib/get-session-user";
import { prismaRoleToUiRole } from "@/lib/role-map";

type PageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function CaseSupplementHubPage({ params }: PageProps) {
  const { caseId } = await params;
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  await redirectLawyerToVerificationUnlessApproved(sessionUser);

  let item: Awaited<ReturnType<typeof getCaseDetailService>>;

  try {
    item = await getCaseDetailService(sessionUser, caseId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (error instanceof ForbiddenError) forbidden();
    throw error;
  }

  const role = prismaRoleToUiRole(sessionUser.role);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-aibeop-muted">
        <Link
          href={`/cases/${caseId}`}
          className="font-medium underline hover:text-aibeop-text"
        >
          ← 사건 상세
        </Link>
        <span className="text-aibeop-disabled" aria-hidden>
          |
        </span>
        <Link href="/cases" className="underline hover:text-aibeop-text">
          사건 목록
        </Link>
      </div>

      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-aibeop-subtle">
          {role === "CLIENT" ? "AI법친 15-A" : "AI법친 7.1-B"}
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-aibeop-text">보완 요청</h1>
        <p className="mt-2 text-sm leading-6 text-aibeop-muted">
          {role === "CLIENT"
            ? `${item.title} 사건에서 받은 보완요청을 확인하고 응답·제출 상태를 추적합니다.`
            : `${item.title} 사건에 대한 보완 요청을 확인하고, 역할에 따라 작성·응답·재검토를 진행합니다.`}
        </p>
      </header>

      {role === "CLIENT" ? (
        <ClientSupplementTrackingClient caseId={caseId} caseTitle={item.title} />
      ) : (
        <SupplementRequestMvpClient caseId={caseId} role={role} />
      )}
    </div>
  );
}