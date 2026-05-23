import { describe, expect, it } from "vitest";

import {
  CASE_SUMMARY_PROMPT_REGISTRY_VERSION,
  resolveCaseSummaryPromptForOperation,
} from "./case-summary-prompt-registry";

describe("case-summary-prompt-registry Phase 9-B", () => {
  it("exposes 9-B.1 registry version", () => {
    expect(CASE_SUMMARY_PROMPT_REGISTRY_VERSION).toBe("9-B.1");
  });

  it("resolves generate operation", () => {
    const resolved = resolveCaseSummaryPromptForOperation("CASE_SUMMARY_GENERATE");
    expect(resolved.promptKey).toBe("case.summary.generate");
    expect(resolved.taskType).toBe("CASE_SUMMARY_GENERATE");
  });
});
