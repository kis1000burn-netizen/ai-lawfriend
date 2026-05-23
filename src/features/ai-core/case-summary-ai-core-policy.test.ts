import { describe, expect, it } from "vitest";

import {
  CASE_SUMMARY_AI_MODES,
  CASE_SUMMARY_AI_OPERATIONS,
  CASE_SUMMARY_PROMPT_KEYS,
  assertCaseSummaryAiModeEnvValidForRc,
  parseCaseSummaryAiMode,
  PHASE9A_CASE_SUMMARY_AI_CORE_INTEGRATION_MARKER,
  shouldInvokeLlmOnCaseSummaryGenerate,
  shouldInvokeLlmOnCaseSummaryRegenerate,
} from "./case-summary-ai-core-policy";

describe("case-summary-ai-core-policy Phase 9-A", () => {
  it("exposes phase marker and operations", () => {
    expect(PHASE9A_CASE_SUMMARY_AI_CORE_INTEGRATION_MARKER).toBe(
      "PHASE9A_CASE_SUMMARY_AI_CORE_INTEGRATION",
    );
    expect(CASE_SUMMARY_AI_OPERATIONS).toEqual([
      "CASE_SUMMARY_GENERATE",
      "CASE_SUMMARY_REGENERATE",
    ]);
    expect(CASE_SUMMARY_AI_MODES).toEqual([
      "RULE_BASED",
      "AI_ENRICH",
      "AI_REGENERATE",
      "LOCK_AFTER_LAWYER_REVIEW",
    ]);
    expect(CASE_SUMMARY_PROMPT_KEYS.GENERATE).toBe("case.summary.generate");
  });

  it("defaults unknown mode to RULE_BASED", () => {
    expect(parseCaseSummaryAiMode(null)).toBe("RULE_BASED");
    expect(parseCaseSummaryAiMode("invalid")).toBe("RULE_BASED");
  });
});

describe("CaseSummaryAiMode runtime gate (Spec §6 — 9-C-FIX)", () => {
  it("RULE_BASED generate false", () => {
    expect(shouldInvokeLlmOnCaseSummaryGenerate("RULE_BASED")).toBe(false);
  });

  it("RULE_BASED regenerate false", () => {
    expect(shouldInvokeLlmOnCaseSummaryRegenerate("RULE_BASED")).toBe(false);
  });

  it("AI_ENRICH generate true", () => {
    expect(shouldInvokeLlmOnCaseSummaryGenerate("AI_ENRICH")).toBe(true);
  });

  it("AI_ENRICH regenerate false", () => {
    expect(shouldInvokeLlmOnCaseSummaryRegenerate("AI_ENRICH")).toBe(false);
  });

  it("AI_REGENERATE generate true", () => {
    expect(shouldInvokeLlmOnCaseSummaryGenerate("AI_REGENERATE")).toBe(true);
  });

  it("AI_REGENERATE regenerate true", () => {
    expect(shouldInvokeLlmOnCaseSummaryRegenerate("AI_REGENERATE")).toBe(true);
  });

  it("LOCK_AFTER_LAWYER_REVIEW unlocked generate/regenerate true", () => {
    expect(shouldInvokeLlmOnCaseSummaryGenerate("LOCK_AFTER_LAWYER_REVIEW")).toBe(true);
    expect(shouldInvokeLlmOnCaseSummaryRegenerate("LOCK_AFTER_LAWYER_REVIEW")).toBe(true);
  });

  it("LOCK_AFTER_LAWYER_REVIEW locked generate/regenerate false", () => {
    const ctx = { isLawyerReviewLocked: true };
    expect(shouldInvokeLlmOnCaseSummaryGenerate("LOCK_AFTER_LAWYER_REVIEW", ctx)).toBe(
      false,
    );
    expect(shouldInvokeLlmOnCaseSummaryRegenerate("LOCK_AFTER_LAWYER_REVIEW", ctx)).toBe(
      false,
    );
  });
});

describe("assertCaseSummaryAiModeEnvValidForRc", () => {
  it("allows unset env", () => {
    delete process.env.CASE_SUMMARY_AI_MODE;
    expect(() => assertCaseSummaryAiModeEnvValidForRc()).not.toThrow();
  });

  it("rejects invalid env for RC", () => {
    process.env.CASE_SUMMARY_AI_MODE = "AI_ENRICHED";
    expect(() => assertCaseSummaryAiModeEnvValidForRc()).toThrow(/Invalid CASE_SUMMARY_AI_MODE/);
    delete process.env.CASE_SUMMARY_AI_MODE;
  });
});
