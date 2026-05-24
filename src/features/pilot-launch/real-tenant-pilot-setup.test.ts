import { describe, expect, it } from "vitest";
import { buildRealTenantPilotSetupForSlug } from "./real-tenant-pilot-setup.service";
import { REAL_TENANT_PILOT_DEFAULT_SLUG } from "./real-tenant-pilot-setup.registry";

describe("real-tenant-pilot-setup (Phase 26-B)", () => {
  it("seeds default pilot tenant with partial completion", () => {
    const result = buildRealTenantPilotSetupForSlug({});
    expect(result.tenantSlug).toBe(REAL_TENANT_PILOT_DEFAULT_SLUG);
    expect(result.completionRate).toBeGreaterThan(0);
    expect(result.pilotTenantReady).toBe(false);
  });

  it("marks pilotTenantReady when all steps complete", () => {
    const result = buildRealTenantPilotSetupForSlug({
      completedStepIds: [
        "provision-tenant",
        "assign-pilot-owner",
        "configure-commercial-plan",
        "pilot-case-seed",
        "live-messaging-opt-in",
        "pilot-kickoff",
      ],
    });
    expect(result.pilotTenantReady).toBe(true);
  });
});
