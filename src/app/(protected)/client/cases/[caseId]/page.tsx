import Link from "next/link";
import { forbidden, notFound, redirect } from "next/navigation";
import { ClientPortalClient } from "@/components/client-portal/client-portal-client";
import { resolveClientPortalMobileDeepLink } from "@/features/client-portal/client-portal-mobile.policy";
import { getCaseDetailService } from "@/features/cases/case.service";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getSessionUser } from "@/lib/get-session-user";
import { prismaRoleToUiRole } from "@/lib/role-map";

type PageProps = {
  params: Promise<{ caseId: string }>;
  searchParams: Promise<{ tab?: string; share?: string }>;
};

export default async function ClientPortalCasePage({ params, searchParams }: PageProps) {
  const { caseId } = await params;
  const query = await searchParams;
  const deepLink = resolveClientPortalMobileDeepLink({
    tab: query.tab,
    share: query.share,
  });

  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");

  const role = prismaRoleToUiRole(sessionUser.role);
  if (role !== "CLIENT") forbidden();

  try {
    await getCaseDetailService(sessionUser, caseId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (error instanceof ForbiddenError) forbidden();
    throw error;
  }

  return (
    <div className="space-y-4 px-4 py-6">
      <div className="text-sm text-aibeop-muted md:hidden">
        <Link href="/client/cases" className="underline hover:text-aibeop-text">
          ← 내 사건 포털
        </Link>
      </div>
      <ClientPortalClient
        caseId={caseId}
        initialTab={deepLink.tab}
        initialShareId={deepLink.shareId}
      />
    </div>
  );
}
