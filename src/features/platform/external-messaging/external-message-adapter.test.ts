import { describe, expect, it } from "vitest";
import {
  EXTERNAL_MESSAGE_CHANNELS,
  EXTERNAL_MESSAGE_PROVIDERS,
} from "./external-message-adapter.schema";
import { isExternalMessageProviderResultRedacted } from "./external-message-adapter-result";
import {
  EXTERNAL_MESSAGE_PROVIDER_ERROR_CODES,
  isRedeliveryEligibleError,
} from "./external-message-provider-error";
import {
  maskExternalMessageRecipient,
  validateExternalMessageChannelPolicy,
  EXTERNAL_MESSAGE_FORBIDDEN_SEND_RULES,
} from "./external-message-channel-policy";
import {
  ExternalMessageDryRunAdapter,
  createDryRunAdapterForChannel,
} from "./external-message-dry-run-adapter";
import {
  buildExternalMessageLogSafeSummary,
  EXTERNAL_MESSAGE_DEFAULT_REDACTION_POLICY_VERSION,
  sendExternalMessageViaAdapter,
  validateExternalMessageSendRequest,
} from "./external-message-adapter.service";

const basePayload = {
  channel: "EMAIL" as const,
  provider: "DRY_RUN" as const,
  surface: "DOCUMENT_DELIVERY" as const,
  caseId: "clh3vkg8b0000qzrmn8311i4",
  recipient: { email: "client@example.com" },
  template: {
    templateKey: "CLIENT_DOC_SHARE_V1",
    variables: {
      noticeBody: "문서가 공유되었습니다.",
      documentTitle: "소장",
    },
  },
  safeLink: { portalPath: "/client/cases/c1?tab=shared" },
  metadata: {
    source: "DOCUMENT_DELIVERY" as const,
    idempotencyKey: "idem-12345678",
    redactionPolicyVersion: EXTERNAL_MESSAGE_DEFAULT_REDACTION_POLICY_VERSION,
    consentVerified: true,
  },
};

describe("external message adapter (Phase 20-A)", () => {
  it("defines channel and provider enums", () => {
    expect(EXTERNAL_MESSAGE_CHANNELS).toContain("EMAIL");
    expect(EXTERNAL_MESSAGE_CHANNELS).toContain("KAKAO");
    expect(EXTERNAL_MESSAGE_PROVIDERS).toContain("DRY_RUN");
  });

  it("seals forbidden send rules", () => {
    expect(EXTERNAL_MESSAGE_FORBIDDEN_SEND_RULES.length).toBeGreaterThanOrEqual(8);
  });

  it("requires templateKey and idempotencyKey", () => {
    const adapter = createDryRunAdapterForChannel("EMAIL");
    expect(adapter.validatePayload({
      ...basePayload,
      template: { ...basePayload.template, templateKey: "" },
    })).toEqual({ ok: false, reason: "TEMPLATE_KEY_REQUIRED" });

    expect(adapter.validatePayload({
      ...basePayload,
      metadata: { ...basePayload.metadata, idempotencyKey: "" },
    })).toEqual({ ok: false, reason: "IDEMPOTENCY_KEY_REQUIRED" });
  });

  it("masks recipient for logs", () => {
    const masked = maskExternalMessageRecipient({ email: "client@example.com" });
    expect(masked).not.toBe("client@example.com");
    expect(masked).toContain("@");
  });

  it("dry-run adapter returns DRY_RUN result with redacted response", async () => {
    const adapter = new ExternalMessageDryRunAdapter("EMAIL");
    const result = await adapter.send(basePayload);
    expect(result.status).toBe("DRY_RUN");
    expect(result.safeSummary.templateKey).toBe("CLIENT_DOC_SHARE_V1");
    expect(result.rawProviderResponseRedacted?.dryRun).toBe(true);
    expect(isExternalMessageProviderResultRedacted(result)).toBe(true);
  });

  it("blocks attachment-like template variables", () => {
    const blocked = validateExternalMessageChannelPolicy({
      ...basePayload,
      template: {
        ...basePayload.template,
        variables: { documentBody: "full legal text" },
      },
    });
    expect(blocked.ok).toBe(false);
  });

  it("sends via service with dry-run default", async () => {
    const result = await sendExternalMessageViaAdapter(basePayload);
    expect(result.status).toBe("DRY_RUN");
    expect(result.redeliveryEligible).toBe(false);
  });

  it("builds ExternalMessageLog safe summary compatible with 18-B keys", () => {
    const result = {
      status: "DRY_RUN" as const,
      provider: "DRY_RUN" as const,
      channel: "EMAIL" as const,
      retryable: false,
      redeliveryEligible: false,
      safeSummary: {
        templateKey: "CLIENT_DOC_SHARE_V1",
        recipientMasked: "c*****@example.com",
        portalPath: "/client/cases/c1",
      },
    };
    const summary = buildExternalMessageLogSafeSummary(basePayload, result);
    expect(summary.metadataOnly).toBe(true);
    expect(summary.containsFileAttachment).toBe(false);
    expect(summary.portalPath).toBeTruthy();
  });

  it("standardizes provider error codes for 18-B redelivery", () => {
    expect(EXTERNAL_MESSAGE_PROVIDER_ERROR_CODES).toContain("RATE_LIMITED");
    const err = {
      code: "RATE_LIMITED" as const,
      retryable: true,
      autoRetryAllowed: true,
      redeliveryEligible: true,
      safeMessage: "rate limited",
    };
    expect(isRedeliveryEligibleError(err)).toBe(true);
  });

  it("rejects send without safe link on external channel", () => {
    const invalid = validateExternalMessageSendRequest({
      ...basePayload,
      safeLink: undefined,
    });
    expect(invalid.ok).toBe(false);
  });
});
