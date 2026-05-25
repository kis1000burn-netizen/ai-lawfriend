import { notFound } from "next/navigation";

import { LegalReliabilityLawyerWorkbenchClient } from "@/components/cases/legal-reliability-lawyer-workbench/legal-reliability-lawyer-workbench-client";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { CASE_STATUS_LABELS } from "@/lib/definitions";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { prisma } from "@/lib/prisma";
import { prismaRoleToUiRole } from "@/lib/role-map";
import type { LegalReliabilityLawyerWorkbenchPanelId } from "@/features/legal-reliability-lawyer-workbench/shared/legal-reliability-lawyer-workbench-types.schema";
import { LEGAL_RELIABILITY_LAWYER_WORKBENCH_PANEL_IDS } from "@/features/legal-reliability-lawyer-workbench/shared/legal-reliability-lawyer-workbench-types.schema";

type PageProps = {
  params: Promise<{ caseId: string }>;
  searchParams: Promise<{ panel?: string; drawer?: string }>;
};

function parsePanel(panel: string | undefined): LegalReliabilityLawyerWorkbenchPanelId {
  if (panel && LEGAL_RELIABILITY_LAWYER_WORKBENCH_PANEL_IDS.includes(panel as LegalReliabilityLawyerWorkbenchPanelId)) {
    return panel as LegalReliabilityLawyerWorkbenchPanelId;
  }
  return "overview";
}

export default async function LawyerWorkbenchPage({ params, searchParams }: PageProps) {
  const currentUser = await requireSessionUser();
  await redirectLawyerToVerificationUnlessApproved(currentUser);

  const { caseId } = await params;
  const { panel } = await searchParams;
  const access = await getCaseAccessContext(currentUser, caseId);

  const uiRole = prismaRoleToUiRole(currentUser.role);
  if (!["LAWYER", "ADMIN", "STAFF"].includes(uiRole)) {
    notFound();
  }

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, title: true, status: true },
  });

  if (!caseRecord) {
    notFound();
  }

  const readOnly = !(access.isAdmin || access.isAssignedLawyer);

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
      <LegalReliabilityLawyerWorkbenchClient
        caseId={caseId}
        caseTitle={caseRecord.title}
        caseStatusLabel={CASE_STATUS_LABELS[caseRecord.status]}
        initialPanel={parsePanel(panel)}
        readOnly={readOnly}
      />
    </div>
  );
}
