import { describe, expect, it } from "vitest";
import { buildLitigationRiskRadarPanel } from "./litigation-risk-radar.service";

describe("litigation-risk-radar (Phase 48-B)", () => {
  it("marks litigationRiskRadarPanelReady when required items defined", () => {
    const result = buildLitigationRiskRadarPanel();
    expect(result.litigationRiskRadarPanelReady).toBe(true);
    expect(result.uiRoute).toContain("lawyer-workbench");
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
