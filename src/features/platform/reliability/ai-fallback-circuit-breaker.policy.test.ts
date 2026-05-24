import { describe, expect, it, beforeEach } from "vitest";
import {
  classifyAiFailureReason,
  evaluateAiFallbackPolicy,
  isCircuitCountableFailure,
} from "./ai-fallback-circuit-breaker.policy";
import {
  getAiCircuitSnapshot,
  recordAiProviderFailure,
  resetAiCircuitStateForTests,
} from "./ai-circuit-state.store";

describe("ai-fallback-circuit-breaker.policy (Phase 18-D)", () => {
  beforeEach(() => {
    resetAiCircuitStateForTests();
  });

  it("classifies rate limit failures", () => {
    expect(classifyAiFailureReason(new Error("429 rate_limit exceeded"))).toBe("RATE_LIMIT");
  });

  it("classifies safety denial without retry", () => {
    const result = evaluateAiFallbackPolicy({
      taskType: "DOCUMENT_PARAGRAPH_GENERATE",
      failureClass: "SAFETY_DENIAL",
      circuitState: "CLOSED",
      attemptCount: 1,
    });
    expect(result.retryAllowed).toBe(false);
    expect(result.fallbackAllowed).toBe(false);
  });

  it("blocks budget exceeded without fallback", () => {
    const result = evaluateAiFallbackPolicy({
      taskType: "CASE_SUMMARY_GENERATE",
      failureClass: "BUDGET_EXCEEDED",
      circuitState: "CLOSED",
      attemptCount: 1,
    });
    expect(result.action).toBe("BLOCK");
    expect(result.fallbackAllowed).toBe(false);
  });

  it("allows limited retry for timeout", () => {
    const result = evaluateAiFallbackPolicy({
      taskType: "DOCUMENT_PARAGRAPH_REGENERATE",
      failureClass: "TIMEOUT",
      circuitState: "CLOSED",
      attemptCount: 1,
    });
    expect(result.action).toBe("RETRY");
    expect(result.retryAllowed).toBe(true);
  });

  it("opens circuit after repeated provider failures", () => {
    for (let i = 0; i < 5; i += 1) {
      recordAiProviderFailure("openai", "PROVIDER_ERROR");
    }
    const snapshot = getAiCircuitSnapshot("openai");
    expect(snapshot.state).toBe("OPEN");

    const result = evaluateAiFallbackPolicy({
      taskType: "CASE_SUMMARY_GENERATE",
      failureClass: "PROVIDER_ERROR",
      circuitState: "OPEN",
      attemptCount: 2,
      clientFacingOutput: true,
    });
    expect(result.action).toBe("CIRCUIT_OPEN_BLOCK");
    expect(result.fallbackAllowed).toBe(true);
    expect(result.blockPublicExposure).toBe(true);
  });

  it("requires manual review for opponent brief fallback", () => {
    const result = evaluateAiFallbackPolicy({
      taskType: "OPPONENT_BRIEF_ANALYZE",
      failureClass: "PROVIDER_ERROR",
      circuitState: "CLOSED",
      attemptCount: 2,
      clientFacingOutput: true,
    });
    expect(result.action).toBe("MANUAL_REVIEW");
    expect(result.requiresManualReview).toBe(true);
    expect(result.blockPublicExposure).toBe(true);
  });

  it("counts only transient/provider failures toward circuit", () => {
    expect(isCircuitCountableFailure("SAFETY_DENIAL")).toBe(false);
    expect(isCircuitCountableFailure("BUDGET_EXCEEDED")).toBe(false);
    expect(isCircuitCountableFailure("RATE_LIMIT")).toBe(true);
  });
});
