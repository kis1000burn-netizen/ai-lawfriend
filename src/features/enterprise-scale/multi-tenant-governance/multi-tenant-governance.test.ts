import { describe, expect, it } from "vitest";
import { buildMultiTenantGovernanceRoleDelegation } from "./multi-tenant-governance.service";

describe("multi-tenant-governance (Phase 30-B)", () => {
  it("marks governanceDelegationReady when all delegated", () => {
    const result = buildMultiTenantGovernanceRoleDelegation();
    expect(result.governanceDelegationReady).toBe(true);
  });
});
