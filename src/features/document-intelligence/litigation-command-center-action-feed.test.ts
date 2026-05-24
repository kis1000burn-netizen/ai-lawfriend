import { describe, expect, it } from "vitest";
import {
  defaultMessageForAuditAction,
  mapAuditLogToCommandCenterFeedItem,
} from "./litigation-command-center-action-feed";
import {
  applyOptimisticDeadlinePatch,
  applyOptimisticSupplementReviewStarted,
  applyOptimisticSupplementSent,
  applyOptimisticTaskStatus,
} from "./litigation-command-center-optimistic";
import { litigationCommandCenterResponseSchema } from "./litigation-command-center.schema";

const baseResponse = litigationCommandCenterResponseSchema.parse({
  caseId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
  caseTitle: "테스트",
  caseStatus: "REVIEW_PENDING",
  caseStatusLabel: "검토 대기",
  version: "15-G.1",
  narrative: { phaseLabel: "단계", headline: "헤드", detailLines: [] },
  riskSignalCount: 0,
  todayTasks: [
    {
      id: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      title: "업무1",
      taskKind: "GENERAL",
      status: "OPEN",
      sourceItemId: "s1",
      isConfirmed: true,
    },
  ],
  deadlines: [
    {
      id: "clxxxxxxxxxxxxxxxxxxxxxxxy",
      title: "기일1",
      status: "OPEN",
      sourceItemId: "s2",
      isConfirmed: true,
    },
  ],
  opponentBriefs: [],
  evidenceMapping: null,
  reviewPendingItems: [],
  reviewPendingCount: 0,
  confirmedRebuttalCount: 0,
  confirmedEvidenceGapCount: 0,
  clientConfirmationCount: 0,
  operations: {
    caseId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
    deadlineCount: 0,
    taskCount: 0,
    supplementDraftCount: 0,
    draftContextCount: 0,
    linkedReviewDecisionCount: 0,
  },
  supplements: [
    {
      id: "clxxxxxxxxxxxxxxxxxxxxxxxz",
      title: "보완1",
      status: "DRAFT",
      isDraft: true,
      awaitingClient: false,
      awaitingReview: false,
      needsMoreInfo: false,
    },
  ],
  draftContexts: [],
  evidenceMappingPendingItems: [],
  recentActionFeed: [],
  clientSubmissionPendingCount: 0,
  caseUnreadMessageCount: 0,
  clientSubmissions: [],
  conversationMessages: [],
  readOnly: false,
  actionsEnabled: true,
});

describe("litigation-command-center-action-feed (Phase 14-C)", () => {
  it("maps audit log row to feed item", () => {
    const item = mapAuditLogToCommandCenterFeedItem({
      id: "audit1",
      action: "LITIGATION_CMD_CENTER_TASK_STATUS_UPDATED",
      message: "소송 지휘실 — 업무 상태 변경",
      entityId: "task1",
      createdAt: new Date("2026-05-24T10:00:00.000Z"),
    });
    expect(item?.source).toBe("AUDIT");
    expect(item?.outcome).toBe("SUCCESS");
    expect(item?.auditAction).toBe("LITIGATION_CMD_CENTER_TASK_STATUS_UPDATED");
  });

  it("provides default messages aligned with audit module", () => {
    expect(defaultMessageForAuditAction("LITIGATION_CMD_CENTER_SUPPLEMENT_SENT")).toContain(
      "보완요청",
    );
    expect(
      defaultMessageForAuditAction("LITIGATION_CMD_CENTER_SUPPLEMENT_REVIEW_STARTED"),
    ).toContain("재검토");
    expect(defaultMessageForAuditAction("CASE_CONVERSATION_MESSAGE_ADOPTED")).toContain(
      "CLIENT_STATEMENT",
    );
    expect(defaultMessageForAuditAction("CASE_CONVERSATION_ATTACHMENT_ADOPTED")).toContain(
      "증거 후보",
    );
  });
});

describe("litigation-command-center-optimistic (Phase 14-C)", () => {
  it("removes completed tasks from todayTasks", () => {
    const next = applyOptimisticTaskStatus(baseResponse, "clxxxxxxxxxxxxxxxxxxxxxxxxx", "COMPLETED");
    expect(next.todayTasks).toHaveLength(0);
  });

  it("patches deadline status and memo", () => {
    const next = applyOptimisticDeadlinePatch(baseResponse, "clxxxxxxxxxxxxxxxxxxxxxxxy", {
      status: "COMPLETED",
      memo: "변론기일 완료",
    });
    expect(next.deadlines[0]?.status).toBe("COMPLETED");
    expect(next.deadlines[0]?.description).toBe("변론기일 완료");
  });

  it("marks supplement as sent", () => {
    const next = applyOptimisticSupplementSent(baseResponse, "clxxxxxxxxxxxxxxxxxxxxxxxz");
    expect(next.supplements[0]?.isDraft).toBe(false);
    expect(next.supplements[0]?.status).toBe("SENT");
  });

  it("marks supplement as under review", () => {
    const responded = {
      ...baseResponse,
      supplements: [
        {
          ...baseResponse.supplements[0]!,
          status: "CLIENT_RESPONDED",
          isDraft: false,
          awaitingClient: false,
          awaitingReview: true,
          needsMoreInfo: false,
        },
      ],
    };
    const next = applyOptimisticSupplementReviewStarted(responded, "clxxxxxxxxxxxxxxxxxxxxxxxz");
    expect(next.supplements[0]?.status).toBe("UNDER_REVIEW");
    expect(next.supplements[0]?.awaitingReview).toBe(false);
  });
});
