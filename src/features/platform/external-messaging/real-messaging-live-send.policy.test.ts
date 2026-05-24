import { describe, expect, it } from "vitest";
import {
  evaluateRealMessagingLiveSendUnlockGates,
  isRealMessagingProviderConfiguredForLiveSend,
  validateRealMessagingLiveSendOperatorConfirmation,
} from "./real-messaging-live-send.policy";
import { REAL_MESSAGING_LIVE_SEND_OPERATOR_CONFIRMATION_PHRASE } from "./real-messaging-rc-lock";

describe("real-messaging-live-send.policy (Phase 20-F)", () => {
  it("defaults to DRY_RUN when live flag is off", () => {
    const result = evaluateRealMessagingLiveSendUnlockGates({
      bundledRcVerifyPassed: true,
      emailWebhookSecretConfigured: false,
      kakaoWebhookSecretConfigured: false,
      consentGatePolicyAcknowledged: true,
      operatorConfirmationValid: false,
      env: {},
    });

    expect(result.dryRunOnly).toBe(true);
    expect(result.liveSendAllowed).toBe(false);
    expect(result.mode).toBe("DRY_RUN");
  });

  it("requires all gates when live send flag is enabled", () => {
    const result = evaluateRealMessagingLiveSendUnlockGates({
      bundledRcVerifyPassed: true,
      emailWebhookSecretConfigured: true,
      kakaoWebhookSecretConfigured: true,
      consentGatePolicyAcknowledged: true,
      operatorConfirmationValid: true,
      env: {
        EXTERNAL_MESSAGE_LIVE_SEND_ENABLED: "true",
        EMAIL_PROVIDER: "SMTP",
        SMTP_HOST: "smtp.example.com",
        SMTP_FROM_ADDRESS: "noreply@example.com",
        EXTERNAL_MESSAGE_LIVE_SEND_RECIPIENT_ALLOWLIST: "client@example.com",
      },
    });

    expect(result.liveSendAllowed).toBe(true);
    expect(result.mode).toBe("LIVE_SEND");
    expect(result.gates.every((gate) => gate.passed)).toBe(true);
  });

  it("blocks live send without recipient allowlist", () => {
    const result = evaluateRealMessagingLiveSendUnlockGates({
      bundledRcVerifyPassed: true,
      emailWebhookSecretConfigured: true,
      kakaoWebhookSecretConfigured: true,
      consentGatePolicyAcknowledged: true,
      operatorConfirmationValid: true,
      env: {
        EXTERNAL_MESSAGE_LIVE_SEND_ENABLED: "true",
        EMAIL_PROVIDER: "SMTP",
      },
    });

    expect(result.liveSendAllowed).toBe(false);
    const allowlistGate = result.gates.find((g) => g.id === "RECIPIENT_ALLOWLIST");
    expect(allowlistGate?.passed).toBe(false);
  });

  it("validates operator confirmation phrase", () => {
    expect(
      validateRealMessagingLiveSendOperatorConfirmation(
        REAL_MESSAGING_LIVE_SEND_OPERATOR_CONFIRMATION_PHRASE,
      ),
    ).toBe(true);
    expect(validateRealMessagingLiveSendOperatorConfirmation("wrong")).toBe(false);
  });

  it("detects live provider configuration", () => {
    expect(isRealMessagingProviderConfiguredForLiveSend({})).toBe(false);
    expect(
      isRealMessagingProviderConfiguredForLiveSend({ EMAIL_PROVIDER: "SENDGRID" }),
    ).toBe(true);
    expect(
      isRealMessagingProviderConfiguredForLiveSend({ KAKAO_PROVIDER: "ALIMTALK" }),
    ).toBe(true);
  });
});
