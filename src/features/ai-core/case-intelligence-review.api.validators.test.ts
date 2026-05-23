import { describe, expect, it } from "vitest";

import { caseIntelligenceJudgmentBodySchema } from "./case-intelligence-review.api.validators";

describe("case-intelligence-review.api.validators Phase 11-A", () => {
  it("requires rejectionReason for REJECTED", () => {
    const result = caseIntelligenceJudgmentBodySchema.safeParse({
      entryId: "e1",
      judgmentState: "REJECTED",
    });
    expect(result.success).toBe(false);
  });

  it("requires lawyerEditedText for EDITED", () => {
    const result = caseIntelligenceJudgmentBodySchema.safeParse({
      entryId: "e1",
      judgmentState: "EDITED",
    });
    expect(result.success).toBe(false);
  });

  it("accepts CONFIRMED judgment", () => {
    const result = caseIntelligenceJudgmentBodySchema.safeParse({
      entryId: "e1",
      judgmentState: "CONFIRMED",
      clientVisible: true,
    });
    expect(result.success).toBe(true);
  });
});
