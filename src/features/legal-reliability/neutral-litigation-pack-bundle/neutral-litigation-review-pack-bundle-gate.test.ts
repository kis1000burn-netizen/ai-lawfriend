import { describe, expect, it } from "vitest";
import { buildNeutralLitigationReviewPackBundleGate } from "./neutral-litigation-review-pack-bundle-gate.service";

describe("neutral-litigation-review-pack-bundle-gate (Phase 47-G)", () => {
  it("marks neutralLitigationReviewPackBundleGateReady when bundled items defined", () => {
    const result = buildNeutralLitigationReviewPackBundleGate();
    expect(result.neutralLitigationReviewPackBundleGateReady).toBe(true);
    expect(result.bundledPhase).toBe("46-F");
    expect(result.bundledVerifyScript).toBe("verify:aibeopchin-neutral-litigation-review-pack-rc");
  });
});
