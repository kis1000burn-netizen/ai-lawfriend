import { describe, expect, it } from "vitest";
import { buildPartnerProgramModel } from "./partner-program-model.service";

describe("partner-program-model (Phase 31-A)", () => {
  it("marks partnerProgramReady when required tiers enabled", () => {
    const result = buildPartnerProgramModel();
    expect(result.partnerProgramReady).toBe(true);
  });
});
