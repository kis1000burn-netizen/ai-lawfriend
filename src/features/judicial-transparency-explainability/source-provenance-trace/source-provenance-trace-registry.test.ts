import { describe, expect, it } from "vitest";
import { buildSourceProvenanceTraceRegistry } from "./source-provenance-trace-registry.service";

describe("source-provenance-trace-registry (Phase 45-A)", () => {
  it("marks sourceProvenanceTraceRegistryReady when required items defined", () => {
    const result = buildSourceProvenanceTraceRegistry();
    expect(result.sourceProvenanceTraceRegistryReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
