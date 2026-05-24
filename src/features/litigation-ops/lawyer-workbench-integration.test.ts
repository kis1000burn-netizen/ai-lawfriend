import { describe, expect, it } from "vitest";
import {
  assembleLawyerWorkbenchIntegrationResult,
  buildCommandCenterPath,
  isUpcomingDeadline,
} from "./lawyer-workbench-integration.policy";

describe("lawyer-workbench-integration (Phase 24-C)", () => {
  it("builds command center path", () => {
    expect(buildCommandCenterPath("abc")).toBe("/cases/abc/litigation-command-center");
  });

  it("detects upcoming deadlines within window", () => {
    const dueAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    expect(isUpcomingDeadline(dueAt, 14)).toBe(true);
  });

  it("aggregates workbench totals", () => {
    const result = assembleLawyerWorkbenchIntegrationResult({
      cases: [
        {
          caseId: "c1",
          caseTitle: "사건1",
          caseStatus: "DRAFTING",
          openTaskCount: 2,
          upcomingDeadlineCount: 1,
          overdueDeadlineCount: 0,
          filingReadinessScore: 80,
          commandCenterPath: "/cases/c1/litigation-command-center",
        },
      ],
    });

    expect(result.totals.openTasks).toBe(2);
    expect(result.totals.upcomingDeadlines).toBe(1);
  });
});
