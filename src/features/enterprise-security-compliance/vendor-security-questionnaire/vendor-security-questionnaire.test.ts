import { describe, expect, it } from "vitest";
import { buildVendorSecurityQuestionnairePack } from "./vendor-security-questionnaire.service";

describe("vendor-security-questionnaire (Phase 32-D)", () => {
  it("marks vendorQuestionnairePackReady when required sections prepared", () => {
    const result = buildVendorSecurityQuestionnairePack();
    expect(result.vendorQuestionnairePackReady).toBe(true);
  });
});
