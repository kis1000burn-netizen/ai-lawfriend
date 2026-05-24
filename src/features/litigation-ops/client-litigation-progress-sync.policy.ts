/**
 * Product Phase 24-E — Client litigation progress sync policy SSOT.
 */
import { formatClientDeadlineDisplayLine } from "@/features/litigation-deadline-reminder/litigation-deadline-reminder.schema";
import type { ClientLitigationProgressSync } from "./client-litigation-progress-sync.schema";
import { CLIENT_LITIGATION_PROGRESS_SYNC_VERSION } from "./client-litigation-progress-sync.schema";

export const CLIENT_LITIGATION_PROGRESS_SYNC_POLICY_MARKER_PHASE24E =
  "phase24e-client-litigation-progress-sync-policy" as const;

export const CLIENT_LITIGATION_PROGRESS_SYNC_DISCLAIMER =
  "소송 진행 안내는 의뢰인에게 공개 허용된 기일·진행 정보만 포함합니다. 내부 전략·변호사 메모는 포함되지 않습니다." as const;

export function buildClientLitigationMilestones(caseStatus: string) {
  const events: ClientLitigationProgressSync["events"] = [
    {
      eventId: "m1",
      label: "사건 접수",
      clientVisible: true,
      kind: "MILESTONE",
    },
    {
      eventId: "m2",
      label:
        caseStatus === "IN_INTERVIEW" || caseStatus === "INTERVIEW_DONE"
          ? "인터뷰·자료 수집 진행"
          : "자료 수집",
      clientVisible: true,
      kind: "MILESTONE",
    },
    {
      eventId: "m3",
      label:
        caseStatus === "DRAFTING" || caseStatus === "REVIEW_PENDING"
          ? "서면·절차 준비 중"
          : "서면·절차 준비",
      clientVisible: true,
      kind: "MILESTONE",
    },
  ];
  return events;
}

export function assembleClientLitigationProgressSync(input: {
  caseId: string;
  caseStatus: string;
  clientVisibleDeadlines: Array<{
    id: string;
    title: string;
    dueAt: Date | null;
    courtName?: string | null;
    hearingKind?: string | null;
  }>;
  syncVersion?: number;
  generatedAt?: string;
}): ClientLitigationProgressSync {
  const events = buildClientLitigationMilestones(input.caseStatus);

  for (const deadline of input.clientVisibleDeadlines) {
    events.push({
      eventId: `dl-${deadline.id}`,
      label: deadline.title,
      occurredAt: deadline.dueAt?.toISOString(),
      clientVisible: true,
      kind: "DEADLINE",
    });
  }

  return {
    packVersion: CLIENT_LITIGATION_PROGRESS_SYNC_VERSION,
    caseId: input.caseId,
    caseStatus: input.caseStatus as ClientLitigationProgressSync["caseStatus"],
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    syncVersion: input.syncVersion ?? 1,
    events,
    upcomingDeadlines: input.clientVisibleDeadlines.map((deadline) => ({
      deadlineId: deadline.id,
      title: deadline.title,
      dueAt: deadline.dueAt?.toISOString() ?? null,
      displayLine: formatClientDeadlineDisplayLine({
        title: deadline.title,
        dueAt: deadline.dueAt,
        courtName: deadline.courtName,
        hearingKind: deadline.hearingKind,
      }),
    })),
    disclaimer: CLIENT_LITIGATION_PROGRESS_SYNC_DISCLAIMER,
  };
}
