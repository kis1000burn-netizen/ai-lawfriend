import { describe, expect, it } from "vitest";
import { buildCourtReadyPackBuilderUx } from "./court-ready-pack-builder.service";

describe("court-ready-pack-builder (Phase 48-E)", () => {
  it("marks courtReadyPackBuilderUxReady when required items defined", () => {
    const result = buildCourtReadyPackBuilderUx();
    expect(result.courtReadyPackBuilderUxReady).toBe(true);
    expect(result.uiRoute).toContain("lawyer-workbench");
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
