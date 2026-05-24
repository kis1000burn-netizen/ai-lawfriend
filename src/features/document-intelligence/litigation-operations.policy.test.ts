import { describe, expect, it } from "vitest";
import {
  assertReviewItemConfirmedForDownstream,
  isEligibleForDownstreamSync,
} from "./litigation-operations.policy";
import { litigationOpsSyncResultSchema } from "./litigation-operations.schema";

describe("litigation-operations.policy (Phase 13-H)", () => {
  it("blocks unconfirmed items from downstream", () => {
    expect(() =>
      assertReviewItemConfirmedForDownstream({
        itemId: "x",
        reviewStatus: "NEEDS_LAWYER_REVIEW",
      }),
    ).toThrow(/LAWYER_CONFIRMED/);
  });

  it("allows confirmed items for downstream sync eligibility", () => {
    expect(
      isEligibleForDownstreamSync({
        itemId: "x",
        sourcePhase: "PHASE_13D",
        itemCategory: "deadline",
        ledgerSubjectKind: "DEADLINE",
        aiText: "7일 이내",
        displayText: "7일 이내",
        reviewStatus: "LAWYER_CONFIRMED",
        decisionLabel: "CONFIRMED",
        citations: [],
        downstreamUsable: true,
      }),
    ).toBe(true);
  });
});

describe("litigation-operations.schema (Phase 13-H)", () => {
  it("parses sync result output", () => {
    const parsed = litigationOpsSyncResultSchema.parse({
      caseId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      version: "13-H.1",
      syncedFromReviewDecisionIds: ["dec-1"],
      deadlinesCreated: 1,
      tasksCreated: 2,
      supplementDraftsCreated: 0,
      draftContextsCreated: 1,
      skippedItems: [{ itemId: "13d-f-claim-0", reason: "NOT_LAWYER_CONFIRMED" }],
    });
    expect(parsed.tasksCreated).toBe(2);
  });
});
