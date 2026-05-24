import { describe, expect, it } from "vitest";
import {
  buildListSummaryPhaseLabel,
  computeListSummaryPriority,
} from "./litigation-command-center-list-summary.helpers";
import { litigationCommandCenterListSummarySchema } from "./litigation-command-center-list-summary.schema";

describe("litigation-command-center-list-summary.helpers (Phase 14-D)", () => {
  it("builds phase label from batch signals", () => {
    expect(
      buildListSummaryPhaseLabel({
        hasOpsSync: true,
        opponentBriefAnalyzedCount: 0,
        hasEvidenceMapping: false,
        hasLitigationFiles: false,
      }),
    ).toBe("운영 연동·제출 준비");

    expect(
      buildListSummaryPhaseLabel({
        hasOpsSync: false,
        opponentBriefAnalyzedCount: 2,
        hasEvidenceMapping: false,
        hasLitigationFiles: true,
      }),
    ).toBe("상대방 서면 대응");
  });

  it("prioritizes imminent deadlines", () => {
    const urgent = computeListSummaryPriority({
      todayTaskCount: 1,
      reviewPendingCount: 0,
      supplementDraftCount: 0,
      daysUntilNextDeadline: 2,
      isDeadlineImminent: true,
    });
    const normal = computeListSummaryPriority({
      todayTaskCount: 0,
      reviewPendingCount: 0,
      supplementDraftCount: 0,
      daysUntilNextDeadline: null,
      isDeadlineImminent: false,
    });
    expect(urgent.score).toBeGreaterThan(normal.score);
    expect(urgent.label).toBe("기일 임박");
  });

  it("prioritizes supplement responses awaiting lawyer review", () => {
    const withResponse = computeListSummaryPriority({
      todayTaskCount: 0,
      reviewPendingCount: 0,
      supplementDraftCount: 0,
      supplementAwaitingReviewCount: 2,
      daysUntilNextDeadline: null,
      isDeadlineImminent: false,
    });
    expect(withResponse.label).toBe("보완 응답");
    expect(withResponse.score).toBeGreaterThan(0);
  });
});

describe("litigation-command-center-list-summary.schema (Phase 14-D)", () => {
  it("parses eligible list summary", () => {
    const parsed = litigationCommandCenterListSummarySchema.parse({
      caseId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      version: "14-D.1",
      eligible: true,
      phaseLabel: "상대방 서면 대응",
      todayTaskCount: 2,
      nextDeadlineTitle: "준비서면 제출",
      nextDeadlineDueAt: "2026-06-03T00:00:00.000Z",
      daysUntilNextDeadline: 10,
      isDeadlineImminent: false,
      reviewPendingCount: 3,
      supplementDraftCount: 1,
      supplementSentCount: 0,
      supplementAwaitingReviewCount: 1,
      opponentBriefAnalyzedCount: 1,
      opponentBriefFileCount: 1,
      hasOpponentBriefAnalysis: true,
      priorityScore: 21,
      priorityLabel: "검토 우선",
    });
    expect(parsed.hasOpponentBriefAnalysis).toBe(true);
  });
});
