import { describe, expect, it } from "vitest";
import { buildLitigationCommandCenterNarrative, computeDaysUntilDue } from "./litigation-command-center.summary";
import { litigationCommandCenterResponseSchema } from "./litigation-command-center.schema";
import { emptyLegalReliabilityActionOperationDashboardSummary } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation-dashboard.fixture";
import {
  assertCanReadLitigationCommandCenter,
  canRunLitigationCommandCenterActions,
} from "./litigation-command-center.policy";
import type { CaseAccessContext } from "@/features/cases/case.permissions";
import { ForbiddenError } from "@/lib/errors";

function baseAccess(overrides: Partial<CaseAccessContext>): CaseAccessContext {
  return {
    caseId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
    ownerUserId: "clxxxxxxxxxxxxxxxxxxxxxxxxy",
    status: "REVIEW_PENDING",
    title: "테스트 사건",
    isOwner: false,
    isAdmin: false,
    isAssignedLawyer: false,
    isAssignedStaff: false,
    canRead: true,
    canWriteCase: false,
    canManageStaffFeatures: false,
    ...overrides,
  };
}

describe("litigation-command-center.summary (Phase 14-A)", () => {
  it("builds narrative with confirmed counts and next deadline", () => {
    const narrative = buildLitigationCommandCenterNarrative({
      caseStatus: "REVIEW_PENDING",
      opponentBriefs: [
        {
          fileId: "f1",
          fileName: "답변서.pdf",
          analysisStatus: "AI_ANALYZED",
          admissionsCount: 1,
          denialsCount: 2,
          defensesCount: 1,
          rebuttalIssuesCount: 3,
          confirmedRebuttalCount: 2,
          isAiCandidate: true,
        },
      ],
      hasEvidenceMapping: true,
      hasOpsSync: false,
      hasLitigationFiles: true,
      confirmedRebuttalCount: 3,
      confirmedEvidenceGapCount: 2,
      clientConfirmationCount: 1,
      reviewPendingCount: 4,
      deadlines: [
        {
          id: "d1",
          title: "준비서면 제출기한",
          status: "OPEN",
          sourceItemId: "item-1",
          clientVisible: false,
          dueAt: "2026-06-03T00:00:00.000Z",
          isConfirmed: true,
          notificationScheduledCount: 0,
          notificationSentCount: 0,
          kakaoPendingCount: 0,
          daysUntilDue: 10,
        },
      ],
    });

    expect(narrative.phaseLabel).toContain("상대방");
    expect(narrative.headline).toContain("반박 쟁점 3건");
    expect(narrative.nextDeadlineText).toContain("준비서면 제출기한");
  });

  it("computes days until due from midnight boundaries", () => {
    const due = new Date();
    due.setDate(due.getDate() + 3);
    expect(computeDaysUntilDue(due)).toBe(3);
  });
});

describe("litigation-command-center.policy (Phase 14-A)", () => {
  it("blocks read without canRead", () => {
    expect(() =>
      assertCanReadLitigationCommandCenter(baseAccess({ canRead: false })),
    ).toThrow(ForbiddenError);
  });

  it("allows staff to run command center actions", () => {
    expect(
      canRunLitigationCommandCenterActions(
        baseAccess({ isAssignedStaff: true }),
      ),
    ).toBe(true);
  });
});

describe("litigation-command-center.schema (Phase 14-A / 15-G Full RC)", () => {
  it("parses minimal command center response", () => {
    const parsed = litigationCommandCenterResponseSchema.parse({
      caseId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      caseTitle: "테스트 사건",
      caseStatus: "REVIEW_PENDING",
      caseStatusLabel: "검토 대기",
      version: "15-G.1",
      narrative: {
        phaseLabel: "준비서면 대응 단계",
        headline: "확정된 반박 쟁점 3건이 있습니다.",
        detailLines: [],
      },
      riskSignalCount: 1,
      todayTasks: [],
      deadlines: [],
      opponentBriefs: [],
      evidenceMapping: null,
      reviewPendingItems: [],
      reviewPendingCount: 0,
      confirmedRebuttalCount: 3,
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
      supplements: [],
      draftContexts: [],
      evidenceMappingPendingItems: [],
      recentActionFeed: [],
      clientSubmissionPendingCount: 0,
      caseUnreadMessageCount: 0,
      clientSubmissions: [],
      conversationMessages: [],
      sharedDocuments: [],
      shareableDocuments: [],
      actionOperationsDashboard: emptyLegalReliabilityActionOperationDashboardSummary(
        "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      ),
      readOnly: false,
      actionsEnabled: true,
    });
    expect(parsed.version).toBe("15-G.1");
    expect(parsed.clientSubmissions).toEqual([]);
    expect(parsed.conversationMessages).toEqual([]);
    expect(parsed.actionsEnabled).toBe(true);
    expect(parsed.recentActionFeed).toEqual([]);
  });
});
