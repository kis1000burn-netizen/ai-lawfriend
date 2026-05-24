/**
 * Product Phase 23-D — Evidence / Timeline / Issue pack service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { assembleEvidenceTimelineIssuePack } from "./evidence-timeline-issue-pack.policy";
import type { EvidenceTimelineIssuePack } from "./evidence-timeline-issue-pack.schema";

export const EVIDENCE_TIMELINE_ISSUE_PACK_SERVICE_MARKER_PHASE23D =
  "phase23d-evidence-timeline-issue-pack-service" as const;

export async function buildEvidenceTimelineIssuePackForCase(
  currentUser: SessionUser,
  caseId: string,
): Promise<EvidenceTimelineIssuePack> {
  const access = await getCaseAccessContext(currentUser, caseId);
  if (!access.canRead) {
    throw new NotFoundError();
  }

  const includeStaffMemos = access.isAdmin || access.isAssignedLawyer;

  const [attachments, timelineMemos, caseRecord] = await Promise.all([
    prisma.caseAttachment.findMany({
      where: { caseId, status: "ACTIVE", deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.caseTimelineMemo.findMany({
      where: {
        caseId,
        deletedAt: null,
        ...(includeStaffMemos ? {} : { memoType: "USER_NOTE" }),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.case.findUnique({
      where: { id: caseId },
      select: { description: true, category: true },
    }),
  ]);

  if (!caseRecord) {
    throw new NotFoundError();
  }

  const issueCandidates = [
    caseRecord.category?.trim(),
    caseRecord.description?.trim().slice(0, 120),
  ].filter((value): value is string => Boolean(value));

  return assembleEvidenceTimelineIssuePack({
    caseId,
    evidenceItems: attachments.map((attachment) => ({
      evidenceId: attachment.id,
      filename: attachment.originalName,
      category: String(attachment.category),
      mappedIssueIds: [],
      lawyerReviewRequired: true,
    })),
    timelineItems: timelineMemos.map((memo) => ({
      timelineMemoId: memo.id,
      occurredAt: memo.createdAt.toISOString(),
      summary: memo.content.slice(0, 500),
      memoType: memo.memoType,
    })),
    issueCandidates: issueCandidates.length > 0 ? issueCandidates : ["사건 쟁점 검토 필요"],
  });
}
