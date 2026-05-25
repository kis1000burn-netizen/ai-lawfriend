import { describe, expect, it } from "vitest";
import { buildCustomerProofCaseStudyTemplate } from "./case-study-template.service";

describe("case-study-template (Phase 33-D)", () => {
  it("marks caseStudyTemplateReady when required sections templated", () => {
    const result = buildCustomerProofCaseStudyTemplate();
    expect(result.caseStudyTemplateReady).toBe(true);
  });
});
