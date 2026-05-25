import { describe, expect, it } from "vitest";
import { buildJudgmentDrawerPrecedentViewer } from "./judgment-drawer.service";

describe("judgment-drawer (Phase 48-D)", () => {
  it("marks judgmentDrawerPrecedentViewerReady when required items defined", () => {
    const result = buildJudgmentDrawerPrecedentViewer();
    expect(result.judgmentDrawerPrecedentViewerReady).toBe(true);
    expect(result.uiRoute).toContain("lawyer-workbench");
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
