import { describe, expect, it } from "vitest";
import { buildEnterpriseSecurityReviewPack } from "./enterprise-security-review-pack.service";

describe("enterprise-security-review-pack (Phase 30-D)", () => {
  it("marks securityReviewPackReady when all approved", () => {
    const result = buildEnterpriseSecurityReviewPack();
    expect(result.securityReviewPackReady).toBe(true);
  });
});
