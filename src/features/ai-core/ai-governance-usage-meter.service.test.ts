import { describe, expect, it, beforeEach, afterEach } from "vitest";

import {
  evaluateAiGovernanceMeterGate,
  recordAiGovernanceFeatureUsage,
  resetAiGovernanceUsageMetersForTests,
  PHASE10B_AI_GOVERNANCE_USAGE_METER_MARKER,
} from "./ai-governance-usage-meter.service";
import { resolveDefaultAiGovernanceControlMatrix } from "./ai-governance-policy.service";

describe("ai-governance-usage-meter.service Phase 10-B", () => {
  const envSnapshot = { ...process.env };

  beforeEach(() => {
    resetAiGovernanceUsageMetersForTests();
    delete process.env.AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET;
    delete process.env.AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE;
  });

  afterEach(() => {
    if (envSnapshot.AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET === undefined) {
      delete process.env.AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET;
    } else {
      process.env.AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET =
        envSnapshot.AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET;
    }
    if (envSnapshot.AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE === undefined) {
      delete process.env.AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE;
    } else {
      process.env.AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE =
        envSnapshot.AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE;
    }
  });

  it("exposes marker", () => {
    expect(PHASE10B_AI_GOVERNANCE_USAGE_METER_MARKER).toBe(
      "PHASE10B_AI_GOVERNANCE_USAGE_METER",
    );
  });

  it("records feature usage counters", () => {
    const snapshot = recordAiGovernanceFeatureUsage({
      caseId: "c1",
      feature: "CASE_SUMMARY",
      llmInvoked: true,
      tokensUsed: 120,
    });
    expect(snapshot.featureUsage.CASE_SUMMARY!.invokeCount).toBe(1);
    expect(snapshot.featureUsage.CASE_SUMMARY!.llmCallCount).toBe(1);
    expect(snapshot.tenantMonthlyTokensUsed).toBe(120);
    expect(snapshot.caseLlmCallsUsed).toBe(1);
  });

  it("blocks when tenant token budget exceeded", () => {
    process.env.AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET = "100";
    const matrix = resolveDefaultAiGovernanceControlMatrix();
    recordAiGovernanceFeatureUsage({
      feature: "CASE_SUMMARY",
      llmInvoked: true,
      tokensUsed: 100,
      matrix,
    });

    const gate = evaluateAiGovernanceMeterGate({
      caseId: "c1",
      feature: "CASE_SUMMARY",
      projectedLlmCall: true,
      projectedTokens: 1,
      matrix,
    });
    expect(gate.allowed).toBe(false);
    expect(gate.controlCode).toBe("TENANT_TOKEN_BUDGET_EXCEEDED");
  });

  it("blocks when case llm limit exceeded", () => {
    process.env.AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE = "1";
    const matrix = resolveDefaultAiGovernanceControlMatrix();
    recordAiGovernanceFeatureUsage({
      caseId: "c1",
      feature: "CASE_SUMMARY",
      llmInvoked: true,
      matrix,
    });

    const gate = evaluateAiGovernanceMeterGate({
      caseId: "c1",
      feature: "CASE_SUMMARY",
      projectedLlmCall: true,
      matrix,
    });
    expect(gate.allowed).toBe(false);
    expect(gate.controlCode).toBe("CASE_LLM_LIMIT_EXCEEDED");
  });
});
