/**
 * Product Phase 24-D — Hearing / submission checklist service.
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
import { assembleHearingSubmissionChecklist } from "./hearing-submission-checklist.policy";
import type {
  HearingSubmissionChecklist,
  HearingSubmissionChecklistType,
} from "./hearing-submission-checklist.schema";

export const HEARING_SUBMISSION_CHECKLIST_SERVICE_MARKER_PHASE24D =
  "phase24d-hearing-submission-checklist-service" as const;

const ACTIVE_TASK_STATUSES = new Set(["OPEN", "IN_PROGRESS"]);

export async function buildHearingSubmissionChecklistForCase(
  currentUser: SessionUser,
  caseId: string,
  checklistType: HearingSubmissionChecklistType = "HEARING",
): Promise<HearingSubmissionChecklist> {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReadLitigationCommandCenter(access);

  const caseRow = await prisma.case.findUnique({ where: { id: caseId }, select: { id: true } });
  if (!caseRow) {
    throw new NotFoundError();
  }

  const [deadlines, tasks, approvedDocCount, attachmentCount] = await Promise.all([
    listLitigationDeadlinesForCase(caseId),
    listLitigationTasksForCase(caseId),
    prisma.legalDocument.count({
      where: { caseId, status: { in: ["APPROVED", "LOCKED"] } },
    }),
    prisma.caseAttachment.count({
      where: { caseId, status: "ACTIVE", deletedAt: null },
    }),
  ]);

  return assembleHearingSubmissionChecklist({
    caseId,
    checklistType,
    hasApprovedDocuments: approvedDocCount > 0,
    hasAttachments: attachmentCount > 0,
    hasOpenDeadlines: deadlines.some((d) => d.status === "OPEN"),
    hasOpenTasks: tasks.some((t) => ACTIVE_TASK_STATUSES.has(t.status)),
    hasClientVisibleDeadline: deadlines.some((d) => d.clientVisible && d.status === "OPEN"),
  });
}
