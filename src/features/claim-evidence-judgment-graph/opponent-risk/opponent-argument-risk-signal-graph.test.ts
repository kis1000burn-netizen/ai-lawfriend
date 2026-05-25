import { describe, expect, it } from "vitest";
import { buildOpponentArgumentRiskSignalGraph } from "./opponent-argument-risk-signal-graph.service";

describe("opponent-argument-risk-signal-graph (Phase 43-D)", () => {
  it("marks opponentArgumentRiskSignalGraphReady when required items defined", () => {
    const result = buildOpponentArgumentRiskSignalGraph();
    expect(result.opponentArgumentRiskSignalGraphReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
    
  });
});
