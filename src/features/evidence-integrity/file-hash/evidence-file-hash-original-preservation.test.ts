import { describe, expect, it } from "vitest";
import { buildEvidenceFileHashOriginalPreservation } from "./evidence-file-hash-original-preservation.service";

describe("evidence-file-hash-original-preservation (Phase 42-A)", () => {
  it("marks evidenceFileHashOriginalPreservationReady when required items defined", () => {
    const result = buildEvidenceFileHashOriginalPreservation();
    expect(result.evidenceFileHashOriginalPreservationReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
    
  });
});
