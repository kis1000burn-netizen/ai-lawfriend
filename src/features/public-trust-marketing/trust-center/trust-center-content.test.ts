import { describe, expect, it } from "vitest";
import { buildTrustCenterContentPack } from "./trust-center-content.service";

describe("trust-center-content (Phase 33-A)", () => {
  it("marks trustCenterContentReady when required sections published", () => {
    const result = buildTrustCenterContentPack();
    expect(result.trustCenterContentReady).toBe(true);
  });
});
