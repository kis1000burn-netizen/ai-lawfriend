/**
 * Product Phase 24-E — Client-facing litigation progress sync service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { listClientVisibleDeadlines } from "@/features/litigation-deadline-reminder/litigation-deadline-reminder.repository";
import { assembleClientLitigationProgressSync } from "./client-litigation-progress-sync.policy";
import type { ClientLitigationProgressSync } from "./client-litigation-progress-sync.schema";

export const CLIENT_LITIGATION_PROGRESS_SYNC_SERVICE_MARKER_PHASE24E =
  "phase24e-client-litigation-progress-sync-service" as const;

export async function syncClientLitigationProgressForCase(
  currentUser: SessionUser,
  caseId: string,
): Promise<ClientLitigationProgressSync> {
  const access = await getCaseAccessContext(currentUser, caseId);
  if (!access.canRead) {
    throw new NotFoundError();
  }

  const caseRow = await prisma.case.findUnique({
    where: { id: caseId },
    select: { status: true },
  });
  if (!caseRow) {
    throw new NotFoundError();
  }

  const deadlines = await listClientVisibleDeadlines(caseId);

  return assembleClientLitigationProgressSync({
    caseId,
    caseStatus: caseRow.status,
    clientVisibleDeadlines: deadlines.map((deadline) => ({
      id: deadline.id,
      title: deadline.title,
      dueAt: deadline.dueAt,
      courtName: deadline.courtName,
      hearingKind: deadline.hearingKind,
    })),
    syncVersion: Date.now(),
  });
}
