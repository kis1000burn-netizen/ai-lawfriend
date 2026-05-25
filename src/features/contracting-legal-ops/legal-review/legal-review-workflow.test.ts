import { describe, expect, it } from "vitest";
import { buildLegalReviewWorkflow } from "./legal-review-workflow.service";

describe("legal-review-workflow (Phase 35-B)", () => {
  it("marks legalReviewWorkflowReady when required steps defined", () => {
    const result = buildLegalReviewWorkflow();
    expect(result.legalReviewWorkflowReady).toBe(true);
  });
});
