import { describe, expect, it } from "vitest";
import { assembleCustomerSuccessActivitySummary } from "./customer-success-activity.policy";

describe("customer-success-activity (Phase 29-B)", () => {
  it("marks csActivityLogReady when activities exist", () => {
    const result = assembleCustomerSuccessActivitySummary({
      tenantId: "tenant-1",
      activities: [
        {
          id: "act-1",
          tenantId: "tenant-1",
          activityType: "ONBOARDING_MEETING",
          summary: "Kickoff completed",
          createdAt: new Date().toISOString(),
        },
      ],
    });
    expect(result.csActivityLogReady).toBe(true);
  });

  it("blocks ready when no activities", () => {
    const result = assembleCustomerSuccessActivitySummary({
      tenantId: "tenant-1",
      activities: [],
    });
    expect(result.csActivityLogReady).toBe(false);
  });
});
