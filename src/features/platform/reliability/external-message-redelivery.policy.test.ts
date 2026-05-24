import { describe, expect, it } from "vitest";
import {
  evaluateExternalMessageRedeliveryPolicy,
  extractSafeRedeliveryMeta,
} from "./external-message-redelivery.policy";

describe("external-message-redelivery.policy (Phase 18-B)", () => {
  it("blocks re-delivery when already SENT", () => {
    const result = evaluateExternalMessageRedeliveryPolicy({
      logStatus: "SENT",
      channel: "KAKAO_ALIMTALK",
      hasSuccessfulSibling: false,
      hasInFlightRedelivery: false,
      attemptCount: 0,
      maxAttempts: 5,
    });
    expect(result.retryable).toBe(false);
  });

  it("blocks auth/template failures from auto-style retry", () => {
    const result = evaluateExternalMessageRedeliveryPolicy({
      logStatus: "FAILED",
      channel: "EMAIL",
      failureReason: "TEMPLATE_NOT_REGISTERED",
      hasSuccessfulSibling: false,
      hasInFlightRedelivery: false,
      attemptCount: 0,
      maxAttempts: 5,
    });
    expect(result.retryable).toBe(false);
    expect(result.autoRetryAllowed).toBe(false);
  });

  it("blocks duplicate when successful sibling exists", () => {
    const result = evaluateExternalMessageRedeliveryPolicy({
      logStatus: "FAILED",
      channel: "KAKAO_ALIMTALK",
      failureReason: "NETWORK timeout",
      hasSuccessfulSibling: true,
      hasInFlightRedelivery: false,
      attemptCount: 0,
      maxAttempts: 5,
    });
    expect(result.retryable).toBe(false);
  });

  it("allows transient FAILED with operator-only path", () => {
    const result = evaluateExternalMessageRedeliveryPolicy({
      logStatus: "FAILED",
      channel: "KAKAO_ALIMTALK",
      failureReason: "NETWORK timeout",
      hasSuccessfulSibling: false,
      hasInFlightRedelivery: false,
      attemptCount: 0,
      maxAttempts: 5,
    });
    expect(result.retryable).toBe(true);
    expect(result.autoRetryAllowed).toBe(false);
  });

  it("rejects unsafe payload with document body keys", () => {
    const safe = extractSafeRedeliveryMeta({
      documentBody: "secret legal text",
      portalPath: "/client/cases/x",
    });
    expect(safe.ok).toBe(false);
  });

  it("extracts metadata-only safe payload", () => {
    const safe = extractSafeRedeliveryMeta({
      noticeBody: "[AI법친] 알림",
      portalPath: "/client/cases/c1",
      documentTitle: "소장",
      containsFileAttachment: false,
    });
    expect(safe.ok).toBe(true);
    expect(safe.meta?.metadataOnly).toBe(true);
  });
});
