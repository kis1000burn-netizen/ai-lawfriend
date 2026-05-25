import { describe, expect, it } from "vitest";
import { buildMediationHearingPreparationPack } from "./mediation-hearing-preparation-pack.service";

describe("mediation-hearing-preparation-pack (Phase 46-D)", () => {
  it("marks mediationHearingPreparationPackReady when required items defined", () => {
    const result = buildMediationHearingPreparationPack();
    expect(result.mediationHearingPreparationPackReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
