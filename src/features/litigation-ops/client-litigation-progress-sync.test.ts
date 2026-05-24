import { describe, expect, it } from "vitest";
import { assembleClientLitigationProgressSync } from "./client-litigation-progress-sync.policy";

describe("client-litigation-progress-sync (Phase 24-E)", () => {
  it("assembles client-visible progress with deadlines", () => {
    const sync = assembleClientLitigationProgressSync({
      caseId: "case-1",
      caseStatus: "DRAFTING",
      clientVisibleDeadlines: [
        {
          id: "dl-1",
          title: "변론기일",
          dueAt: new Date("2026-06-01T09:00:00.000Z"),
          courtName: "서울중앙지방법원",
          hearingKind: "변론",
        },
      ],
    });

    expect(sync.events.some((e) => e.kind === "DEADLINE")).toBe(true);
    expect(sync.upcomingDeadlines).toHaveLength(1);
    expect(sync.disclaimer).toContain("의뢰인");
  });

  it("includes milestone events", () => {
    const sync = assembleClientLitigationProgressSync({
      caseId: "case-1",
      caseStatus: "IN_INTERVIEW",
      clientVisibleDeadlines: [],
    });

    expect(sync.events.some((e) => e.kind === "MILESTONE")).toBe(true);
  });
});
