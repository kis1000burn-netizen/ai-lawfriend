import { describe, expect, it } from "vitest";
import { buildEvidenceListPack } from "./evidence-list-pack.service";

describe("evidence-list-pack (Phase 44-C)", () => {
  it("marks evidenceListPackReady when required items defined", () => {
    const result = buildEvidenceListPack();
    expect(result.evidenceListPackReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
