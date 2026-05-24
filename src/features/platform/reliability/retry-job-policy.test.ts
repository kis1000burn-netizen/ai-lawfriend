import { describe, expect, it } from "vitest";
import {
  canOperatorQueueRetry,
  evaluateRetryJobPolicy,
} from "./retry-job-policy";

describe("retry-job-policy (Phase 18-A)", () => {
  it("blocks permission-class cron failures", () => {
    const result = evaluateRetryJobPolicy({
      sourceType: "CRON",
      jobCode: "SLA_ESCALATION_SCAN",
      failureReason: "FORBIDDEN access to queue",
    });
    expect(result.retryable).toBe(false);
    expect(result.safetyClass).toBe("BLOCKED");
  });

  it("allows transient cron failures with operator approval", () => {
    const result = evaluateRetryJobPolicy({
      sourceType: "CRON",
      jobCode: "CUSTOM_JOB",
      failureReason: "NETWORK timeout after 30s",
    });
    expect(result.retryable).toBe(true);
    expect(result.safetyClass).toBe("OPERATOR_APPROVAL");
  });

  it("allows safe-auto for whitelisted cron with transient error", () => {
    const result = evaluateRetryJobPolicy({
      sourceType: "CRON",
      jobCode: "LITIGATION_DEADLINE_REMINDER",
      failureReason: "RATE_LIMIT exceeded",
    });
    expect(result.retryable).toBe(true);
    expect(result.safetyClass).toBe("SAFE_AUTO");
  });

  it("gates operator retry by status and policy", () => {
    expect(
      canOperatorQueueRetry({
        retryable: true,
        safetyClass: "OPERATOR_APPROVAL",
        status: "FAILED",
        attemptCount: 0,
        maxAttempts: 3,
      }).allowed,
    ).toBe(true);

    expect(
      canOperatorQueueRetry({
        retryable: false,
        safetyClass: "BLOCKED",
        status: "FAILED",
        attemptCount: 0,
        maxAttempts: 3,
      }).allowed,
    ).toBe(false);
  });
});
