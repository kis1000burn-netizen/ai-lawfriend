import { describe, expect, it } from "vitest";
import {
  assertConfirmedForDownstreamUse,
  filterDownstreamUsableItems,
} from "./document-intelligence-review.policy";

describe("document-intelligence-review.policy (Phase 13-G)", () => {
  it("blocks downstream use before lawyer confirmation", () => {
    expect(() =>
      assertConfirmedForDownstreamUse({ reviewStatus: "NEEDS_LAWYER_REVIEW" }),
    ).toThrow(/LAWYER_CONFIRMED/);
  });

  it("allows downstream for confirmed statuses", () => {
    expect(() =>
      assertConfirmedForDownstreamUse({ reviewStatus: "LAWYER_CONFIRMED" }),
    ).not.toThrow();
    expect(() =>
      assertConfirmedForDownstreamUse({ reviewStatus: "LAWYER_CORRECTED" }),
    ).not.toThrow();
  });

  it("filters downstream usable items", () => {
    const items = filterDownstreamUsableItems([
      {
        itemId: "a",
        sourcePhase: "PHASE_13D",
        itemCategory: "claim",
        ledgerSubjectKind: "DOCUMENT_CLAIM",
        aiText: "x",
        displayText: "x",
        reviewStatus: "LAWYER_CONFIRMED",
        decisionLabel: "CONFIRMED",
        citations: [],
        downstreamUsable: true,
      },
      {
        itemId: "b",
        sourcePhase: "PHASE_13D",
        itemCategory: "claim",
        ledgerSubjectKind: "DOCUMENT_CLAIM",
        aiText: "y",
        displayText: "y",
        reviewStatus: "NEEDS_LAWYER_REVIEW",
        decisionLabel: "PENDING",
        citations: [],
        downstreamUsable: false,
      },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]?.itemId).toBe("a");
  });
});
