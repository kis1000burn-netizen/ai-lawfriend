import Link from "next/link";
import { forbidden, redirect } from "next/navigation";
import { Suspense } from "react";
import { ClientPortalPwaRestoreRedirect } from "@/components/client-portal/client-portal-pwa-restore-redirect";
import { ClientPortalCasesListClient } from "@/components/client-portal/client-portal-cases-list-client";
import { ClientPortalNotificationCenter } from "@/components/client-portal/client-portal-notification-center";
import { getSessionUser } from "@/lib/get-session-user";
import { prismaRoleToUiRole } from "@/lib/role-map";

export default async function ClientPortalCasesPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");

  const role = prismaRoleToUiRole(sessionUser.role);
  if (role !== "CLIENT") forbidden();

  return (
    <div className="space-y-4 px-4 py-6">
      <Suspense fallback={null}>
        <ClientPortalPwaRestoreRedirect />
      </Suspense>
      <ClientPortalNotificationCenter />
      <ClientPortalCasesListClient />
    </div>
  );
}
