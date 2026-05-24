/**
 * Phase 14-D — Command Center list/dashboard summary service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { prisma } from "@/lib/prisma";
import { prismaRoleToUiRole } from "@/lib/role-map";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { assertCanReadLitigationCommandCenter } from "./litigation-command-center.policy";
import { loadCommandCenterListBatchFacts } from "./litigation-command-center-list-summary.repository";
import {
  buildListSummaryPhaseLabel,
  computeDaysUntilDue,
  computeListSummaryPriority,
} from "./litigation-command-center-list-summary.helpers";
import {
  LITIGATION_COMMAND_CENTER_LIST_SUMMARY_VERSION,
  litigationCommandCenterListSummarySchema,
  litigationCommandCenterListSummariesResponseSchema,
  type LitigationCommandCenterListSummary,
} from "./litigation-command-center-list-summary.schema";

export const PHASE14D_LITIGATION_COMMAND_CENTER_LIST_SUMMARY_SERVICE_MARKER =
  "PHASE14D_LITIGATION_COMMAND_CENTER_LIST_SUMMARY_SERVICE" as const;

function canViewCommandCenterSummaries(role: string): boolean {
  return ["LAWYER", "ADMIN", "STAFF"].includes(role);
}

function buildSummaryForCase(
  caseId: string,
  eligible: boolean,
  facts: Awaited<ReturnType<typeof loadCommandCenterListBatchFacts>>,
): LitigationCommandCenterListSummary {
  if (!eligible) {
    return litigationCommandCenterListSummarySchema.parse({
      caseId,
      version: LITIGATION_COMMAND_CENTER_LIST_SUMMARY_VERSION,
      eligible: false,
      phaseLabel: null,
      todayTaskCount: 0,
      nextDeadlineTitle: null,
      nextDeadlineDueAt: null,
      daysUntilNextDeadline: null,
      isDeadlineImminent: false,
      reviewPendingCount: 0,
      supplementDraftCount: 0,
      supplementSentCount: 0,
      opponentBriefAnalyzedCount: 0,
      opponentBriefFileCount: 0,
      hasOpponentBriefAnalysis: false,
      priorityScore: 0,
      priorityLabel: "—",
    });
  }

  const nextDeadline = facts.nextDeadlines.get(caseId) ?? null;
  const daysUntilNextDeadline = nextDeadline
    ? computeDaysUntilDue(nextDeadline.dueAt)
    : null;
  const isDeadlineImminent =
    daysUntilNextDeadline !== null && daysUntilNextDeadline >= 0 && daysUntilNextDeadline <= 7;

  const opponentBriefAnalyzedCount = facts.opponentBriefAnalyzedCounts.get(caseId) ?? 0;
  const opponentBriefFileCount = facts.opponentBriefFileCounts.get(caseId) ?? 0;

  const phaseLabel = buildListSummaryPhaseLabel({
    hasOpsSync: facts.opsSyncCaseIds.has(caseId),
    opponentBriefAnalyzedCount,
    hasEvidenceMapping: facts.evidenceMappingCaseIds.has(caseId),
    hasLitigationFiles: facts.litigationFileCaseIds.has(caseId),
  });

  const todayTaskCount = facts.taskCounts.get(caseId) ?? 0;
  const reviewPendingCount = facts.reviewPendingCounts.get(caseId) ?? 0;
  const supplementDraftCount = facts.supplementDraftCounts.get(caseId) ?? 0;
  const supplementSentCount = facts.supplementSentCounts.get(caseId) ?? 0;
  const supplementAwaitingReviewCount = facts.supplementRespondedCounts.get(caseId) ?? 0;

  const priority = computeListSummaryPriority({
    todayTaskCount,
    reviewPendingCount,
    supplementDraftCount,
    supplementAwaitingReviewCount,
    daysUntilNextDeadline,
    isDeadlineImminent,
  });

  return litigationCommandCenterListSummarySchema.parse({
    caseId,
    version: LITIGATION_COMMAND_CENTER_LIST_SUMMARY_VERSION,
    eligible: true,
    phaseLabel,
    todayTaskCount,
    nextDeadlineTitle: nextDeadline?.title ?? null,
    nextDeadlineDueAt: nextDeadline?.dueAt.toISOString() ?? null,
    daysUntilNextDeadline,
    isDeadlineImminent,
    reviewPendingCount,
    supplementDraftCount,
    supplementSentCount,
    supplementAwaitingReviewCount,
    opponentBriefAnalyzedCount,
    opponentBriefFileCount,
    hasOpponentBriefAnalysis: opponentBriefAnalyzedCount > 0,
    priorityScore: priority.score,
    priorityLabel: priority.label,
  });
}

export async function getLitigationCommandCenterListSummariesForCases(
  currentUser: SessionUser,
  caseIds: string[],
): Promise<Record<string, LitigationCommandCenterListSummary>> {
  const uiRole = prismaRoleToUiRole(currentUser.role);
  if (!canViewCommandCenterSummaries(uiRole) || caseIds.length === 0) {
    return {};
  }

  const uniqueCaseIds = [...new Set(caseIds)];
  const facts = await loadCommandCenterListBatchFacts(uniqueCaseIds);
  const result: Record<string, LitigationCommandCenterListSummary> = {};

  await Promise.all(
    uniqueCaseIds.map(async (caseId) => {
      const interviewCompleted = facts.interviewCompletedCaseIds.has(caseId);
      if (!interviewCompleted) {
        result[caseId] = buildSummaryForCase(caseId, false, facts);
        return;
      }

      try {
        const access = await getCaseAccessContext(currentUser, caseId);
        assertCanReadLitigationCommandCenter(access);
        result[caseId] = buildSummaryForCase(caseId, true, facts);
      } catch {
        result[caseId] = buildSummaryForCase(caseId, false, facts);
      }
    }),
  );

  return result;
}

export async function getLitigationCommandCenterListSummariesService(
  currentUser: SessionUser,
  caseIds: string[],
) {
  const summaries = Object.values(
    await getLitigationCommandCenterListSummariesForCases(currentUser, caseIds),
  );

  return litigationCommandCenterListSummariesResponseSchema.parse({
    version: LITIGATION_COMMAND_CENTER_LIST_SUMMARY_VERSION,
    summaries,
  });
}

export async function getLitigationCommandCenterDashboardPreview(
  currentUser: SessionUser,
  limit = 5,
): Promise<LitigationCommandCenterListSummary[]> {
  const uiRole = prismaRoleToUiRole(currentUser.role);
  if (!canViewCommandCenterSummaries(uiRole)) {
    return [];
  }

  const { buildAccessibleCaseWhere } = await import("@/features/cases/case.permissions");
  const base = await buildAccessibleCaseWhere(currentUser);

  const cases = await prisma.case.findMany({
    where: {
      AND: [
        base,
        {
          interviews: {
            some: { status: "COMPLETED" },
          },
        },
        { status: { notIn: ["CLOSED", "REJECTED"] } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: Math.max(limit * 3, 15),
    select: { id: true },
  });

  const summariesMap = await getLitigationCommandCenterListSummariesForCases(
    currentUser,
    cases.map((c) => c.id),
  );

  return Object.values(summariesMap)
    .filter((s) => s.eligible)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, limit);
}

export async function getLitigationCommandCenterDashboardPreviewWithTitles(
  currentUser: SessionUser,
  limit = 5,
): Promise<Array<LitigationCommandCenterListSummary & { caseTitle: string }>> {
  const summaries = await getLitigationCommandCenterDashboardPreview(currentUser, limit);
  if (summaries.length === 0) {
    return [];
  }

  const cases = await prisma.case.findMany({
    where: { id: { in: summaries.map((s) => s.caseId) } },
    select: { id: true, title: true },
  });
  const titleMap = new Map(cases.map((c) => [c.id, c.title]));

  return summaries.map((summary) => ({
    ...summary,
    caseTitle: titleMap.get(summary.caseId) ?? "사건",
  }));
}
