import { describe, expect, it } from "vitest";
import { buildExplainabilityTraceBundleGate } from "./explainability-trace-bundle-gate.service";

describe("explainability-trace-bundle-gate (Phase 47-F)", () => {
  it("marks explainabilityTraceBundleGateReady when bundled items defined", () => {
    const result = buildExplainabilityTraceBundleGate();
    expect(result.explainabilityTraceBundleGateReady).toBe(true);
    expect(result.bundledPhase).toBe("45-F");
    expect(result.bundledVerifyScript).toBe("verify:aibeopchin-judicial-transparency-explainability-rc");
  });
});
