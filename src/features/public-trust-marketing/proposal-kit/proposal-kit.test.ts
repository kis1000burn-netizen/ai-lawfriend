import { describe, expect, it } from "vitest";
import { buildPartnerEnterpriseProposalKit } from "./proposal-kit.service";

describe("proposal-kit (Phase 33-E)", () => {
  it("marks proposalKitReady when required sections assembled", () => {
    const result = buildPartnerEnterpriseProposalKit();
    expect(result.proposalKitReady).toBe(true);
  });
});
