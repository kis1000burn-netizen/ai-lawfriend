import { describe, expect, it } from "vitest";
import { buildCourtReadyPackItemExplainabilityWorkspace } from "./court-ready-pack-item-explainability-workspace.service";

describe("court-ready-pack-item-explainability-workspace (Phase 45-E)", () => {
  it("marks courtReadyPackItemExplainabilityWorkspaceReady when required items defined", () => {
    const result = buildCourtReadyPackItemExplainabilityWorkspace();
    expect(result.courtReadyPackItemExplainabilityWorkspaceReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
