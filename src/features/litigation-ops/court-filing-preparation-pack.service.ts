/**
 * Product Phase 24-B — Court filing preparation pack service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { assertCanReadLitigationCommandCenter } from "@/features/document-intelligence/litigation-command-center.policy";
import {
  listLitigationDeadlinesForCase,
  listLitigationTasksForCase,
} from "@/features/document-intelligence/litigation-command-center.repository";
import { assembleCourtFilingPreparationPack } from "./court-filing-preparation-pack.policy";
import type {
  CourtFilingPackType,
  CourtFilingPreparationPack,
} from "./court-filing-preparation-pack.schema";

export const COURT_FILING_PREPARATION_PACK_SERVICE_MARKER_PHASE24B =
  "phase24b-court-filing-preparation-pack-service" as const;

const ACTIVE_TASK_STATUSES = new Set(["OPEN", "IN_PROGRESS"]);

export async function buildCourtFilingPreparationPackForCase(
  currentUser: SessionUser,
  caseId: string,
  filingType: CourtFilingPackType = "GENERIC",
): Promise<CourtFilingPreparationPack> {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReadLitigationCommandCenter(access);

  const [caseRow, deadlines, tasks, attachmentCount, documentCount] = await Promise.all([
    prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        opponentName: true,
        courtName: true,
        description: true,
        category: true,
      },
    }),
    listLitigationDeadlinesForCase(caseId),
    listLitigationTasksForCase(caseId),
    prisma.caseAttachment.count({
      where: { caseId, status: "ACTIVE", deletedAt: null },
    }),
    prisma.legalDocument.count({ where: { caseId } }),
  ]);

  if (!caseRow) {
    throw new NotFoundError();
  }

  return assembleCourtFilingPreparationPack({
    caseId,
    filingType,
    courtName: caseRow.courtName,
    hasParties: Boolean(caseRow.opponentName),
    hasClaims: Boolean(caseRow.description?.trim() || caseRow.category),
    hasEvidence: documentCount > 0,
    hasDeadlines: deadlines.some((d) => d.status === "OPEN"),
    hasOpenTasks: tasks.some((t) => ACTIVE_TASK_STATUSES.has(t.status)),
    hasAttachments: attachmentCount > 0,
  });
}
