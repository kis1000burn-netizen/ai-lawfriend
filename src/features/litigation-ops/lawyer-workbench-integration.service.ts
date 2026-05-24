/**
 * Product Phase 24-C — Lawyer workbench integration service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { buildAccessibleCaseWhere } from "@/features/cases/case.permissions";
import { assembleCourtFilingPreparationPack } from "./court-filing-preparation-pack.policy";
import {
  assembleLawyerWorkbenchIntegrationResult,
  buildCommandCenterPath,
  isOverdueDeadline,
  isUpcomingDeadline,
} from "./lawyer-workbench-integration.policy";
import type { LawyerWorkbenchIntegrationResult } from "./lawyer-workbench-integration.schema";

export const LAWYER_WORKBENCH_INTEGRATION_SERVICE_MARKER_PHASE24C =
  "phase24c-lawyer-workbench-integration-service" as const;

const ACTIVE_TASK_STATUSES = new Set(["OPEN", "IN_PROGRESS"]);

export async function getLawyerWorkbenchLitigationSnapshot(
  currentUser: SessionUser,
  limit = 20,
): Promise<LawyerWorkbenchIntegrationResult> {
  if (!["LAWYER", "ADMIN", "STAFF", "SUPER_ADMIN"].includes(currentUser.role)) {
    throw new ForbiddenError("변호사 workbench 접근 권한이 없습니다.");
  }

  const where = await buildAccessibleCaseWhere(currentUser);
  const cases = await prisma.case.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      status: true,
      opponentName: true,
      courtName: true,
      description: true,
      category: true,
      litigationDeadlines: {
        where: { status: "OPEN" },
        select: { dueAt: true },
      },
      litigationTasks: {
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
        select: { id: true },
      },
      _count: {
        select: {
          attachments: true,
          legalDocuments: true,
        },
      },
    },
  });

  const snapshots = cases.map((caseRow) => {
    const upcomingDeadlineCount = caseRow.litigationDeadlines.filter((d) =>
      isUpcomingDeadline(d.dueAt),
    ).length;
    const overdueDeadlineCount = caseRow.litigationDeadlines.filter((d) =>
      isOverdueDeadline(d.dueAt),
    ).length;

    const filingPack = assembleCourtFilingPreparationPack({
      caseId: caseRow.id,
      filingType: "GENERIC",
      courtName: caseRow.courtName,
      hasParties: Boolean(caseRow.opponentName),
      hasClaims: Boolean(caseRow.description?.trim() || caseRow.category),
      hasEvidence: caseRow._count.legalDocuments > 0,
      hasDeadlines: caseRow.litigationDeadlines.length > 0,
      hasOpenTasks: caseRow.litigationTasks.length > 0,
      hasAttachments: caseRow._count.attachments > 0,
    });

    return {
      caseId: caseRow.id,
      caseTitle: caseRow.title,
      caseStatus: caseRow.status,
      openTaskCount: caseRow.litigationTasks.length,
      upcomingDeadlineCount,
      overdueDeadlineCount,
      filingReadinessScore: filingPack.readinessScore,
      commandCenterPath: buildCommandCenterPath(caseRow.id),
    };
  });

  return assembleLawyerWorkbenchIntegrationResult({ cases: snapshots });
}
