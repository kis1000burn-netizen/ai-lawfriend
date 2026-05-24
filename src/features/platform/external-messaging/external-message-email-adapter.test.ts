import { afterEach, describe, expect, it, vi } from "vitest";
import { redactExternalMessagePayload } from "@/lib/data-governance/data-redaction.service";
import { EXTERNAL_MESSAGE_REDELIVERY_SAFE_PAYLOAD_KEYS } from "@/features/platform/reliability/external-message-redelivery.schema";

vi.mock("@/features/secure-document-delivery/secure-document-delivery.repository", () => ({
  createExternalMessageLogRow: vi.fn().mockResolvedValue({ id: "log-1" }),
}));

import { createExternalMessageLogRow } from "@/features/secure-document-delivery/secure-document-delivery.repository";
import {
  EXTERNAL_MESSAGE_DEFAULT_REDACTION_POLICY_VERSION,
  registerExternalMessageAdapter,
  resetExternalMessageAdapterRegistryForTests,
  sendExternalMessageViaAdapter,
} from "./external-message-adapter.service";
import { maskExternalMessageRecipient } from "./external-message-channel-policy";
import {
  EMAIL_PROVIDER_ENV_KEY,
  resolveEmailProvider,
} from "./external-message-email-config";
import {
  EXTERNAL_MESSAGE_EMAIL_TEMPLATE_ALLOWLIST,
  isEmailTemplateKeyAllowed,
  validateEmailTemplateAllowlist,
} from "./external-message-email-template-allowlist";
import {
  buildSafeEmailContent,
  buildSafeEmailSubject,
} from "./external-message-email-body-builder";
import { redactProviderRawResponse } from "./external-message-provider-response-redaction";
import {
  createMockEmailTransport,
  type ExternalMessageEmailTransport,
} from "./external-message-email-transport";
import { ExternalMessageSmtpAdapter } from "./external-message-smtp-adapter";
import {
  mapProviderResultToExternalMessageLogStatus,
  recordExternalMessageAdapterResult,
} from "./external-message-log.service";
import { isExternalMessageProviderResultRedacted } from "./external-message-adapter-result";
import { isRedeliveryEligibleError } from "./external-message-provider-error";

const smtpConfig = {
  host: "smtp.example.com",
  port: 587,
  secure: false,
  fromAddress: "noreply@aibeopchin.example",
  fromName: "AI법친",
};

const baseEmailPayload = {
  channel: "EMAIL" as const,
  provider: "SMTP" as const,
  surface: "DOCUMENT_DELIVERY" as const,
  caseId: "clh3vkg8b0000qzrmn8311i4",
  recipientUserId: "clh3vkg8b0000qzrmn8311i5",
  recipient: { email: "client@example.com", displayName: "의뢰인" },
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
    idempotencyKey: "idem-email-12345678",
    redactionPolicyVersion: EXTERNAL_MESSAGE_DEFAULT_REDACTION_POLICY_VERSION,
    consentVerified: true,
  },
};

describe("external message email adapter (Phase 20-B)", () => {
  afterEach(() => {
    resetExternalMessageAdapterRegistryForTests();
    vi.unstubAllEnvs();
    vi.mocked(createExternalMessageLogRow).mockClear();
  });

  it("branches EMAIL_PROVIDER env (default DRY_RUN)", () => {
    expect(resolveEmailProvider({})).toBe("DRY_RUN");
    expect(resolveEmailProvider({ [EMAIL_PROVIDER_ENV_KEY]: "SMTP" })).toBe("SMTP");
    expect(resolveEmailProvider({ [EMAIL_PROVIDER_ENV_KEY]: "sendgrid" })).toBe("SENDGRID");
    expect(resolveEmailProvider({ [EMAIL_PROVIDER_ENV_KEY]: "invalid" })).toBe("DRY_RUN");
  });

  it("enforces templateKey allowlist", () => {
    expect(isEmailTemplateKeyAllowed("CLIENT_DOC_SHARE_V1")).toBe(true);
    expect(isEmailTemplateKeyAllowed("UNKNOWN_TEMPLATE")).toBe(false);
    expect(EXTERNAL_MESSAGE_EMAIL_TEMPLATE_ALLOWLIST.length).toBeGreaterThanOrEqual(5);

    const blocked = validateEmailTemplateAllowlist({
      ...baseEmailPayload,
      template: { ...baseEmailPayload.template, templateKey: "UNKNOWN_TEMPLATE" },
    });
    expect(blocked.ok).toBe(false);
  });

  it("builds safe subject/body without legal body", () => {
    const subject = buildSafeEmailSubject(baseEmailPayload);
    expect(subject).toContain("[AI법친]");
    expect(subject).toContain("문서 공유 알림");

    const content = buildSafeEmailContent(baseEmailPayload, "https://app.example.com");
    expect(content.textBody).toContain("https://app.example.com/client/cases/c1");
    expect(content.textBody).toContain("법률 문서 본문은 이메일로 전송되지 않습니다");
    expect(content.textBody).not.toContain("documentBody");
    expect(content.htmlBody).not.toContain("attachment");
    expect(content.textBody.length).toBeLessThan(1200);
  });

  it("masks recipient email for logs", () => {
    const masked = maskExternalMessageRecipient({ email: "client@example.com" });
    expect(masked).not.toBe("client@example.com");
  });

  it("redacts provider raw response (no recipient email)", () => {
    const redacted = redactProviderRawResponse({
      messageId: "msg-1",
      to: "client@example.com",
      body: "secret body",
      accepted: ["client@example.com"],
    });
    expect(redacted.to).toBeUndefined();
    expect(redacted.body).toBeUndefined();
    expect(JSON.stringify(redacted)).not.toContain("client@example.com");
  });

  it("SMTP adapter sends via transport and returns SENT with redacted response", async () => {
    const transport: ExternalMessageEmailTransport = createMockEmailTransport({
      messageId: "smtp-msg-99",
      accepted: ["client@example.com"],
      responseCode: "250",
      rawResponse: {
        messageId: "smtp-msg-99",
        to: "client@example.com",
        body: "should not persist",
      },
    });

    const adapter = new ExternalMessageSmtpAdapter(transport, smtpConfig);
    registerExternalMessageAdapter(adapter);

    const result = await sendExternalMessageViaAdapter(baseEmailPayload);
    expect(result.status).toBe("SENT");
    expect(result.provider).toBe("SMTP");
    expect(result.providerMessageId).toBe("smtp-msg-99");
    expect(result.safeSummary.recipientMasked).not.toBe("client@example.com");
    expect(isExternalMessageProviderResultRedacted(result)).toBe(true);
    expect(JSON.stringify(result.rawProviderResponseRedacted)).not.toContain(
      "client@example.com",
    );
  });

  it("maps provider result to ExternalMessageLog SENT/FAILED status", () => {
    expect(mapProviderResultToExternalMessageLogStatus("SENT")).toBe("SENT");
    expect(mapProviderResultToExternalMessageLogStatus("FAILED")).toBe("FAILED");
    expect(mapProviderResultToExternalMessageLogStatus("DRY_RUN")).toBe("SENT");
  });

  it("records ExternalMessageLog row with redacted payload summary", async () => {
    const result = {
      status: "SENT" as const,
      provider: "SMTP" as const,
      channel: "EMAIL" as const,
      retryable: false,
      redeliveryEligible: false,
      safeSummary: {
        templateKey: "CLIENT_DOC_SHARE_V1",
        recipientMasked: "c*****@example.com",
        portalPath: "/client/cases/c1",
      },
      rawProviderResponseRedacted: { messageId: "smtp-msg-99" },
    };

    await recordExternalMessageAdapterResult({
      caseId: baseEmailPayload.caseId!,
      recipientUserId: baseEmailPayload.recipientUserId!,
      deliveryId: "delivery-1",
      payload: baseEmailPayload,
      result,
    });

    expect(createExternalMessageLogRow).toHaveBeenCalledOnce();
    const call = vi.mocked(createExternalMessageLogRow).mock.calls[0][0];
    expect(call.status).toBe("SENT");
    expect(call.provider).toBe("SMTP");
    expect(call.payloadSummaryJson.metadataOnly).toBe(true);
    expect(call.payloadSummaryJson.containsFileAttachment).toBe(false);

    for (const key of EXTERNAL_MESSAGE_REDELIVERY_SAFE_PAYLOAD_KEYS) {
      if (key in call.payloadSummaryJson) {
        expect(call.payloadSummaryJson[key]).toBeDefined();
      }
    }
  });

  it("19-B redaction regression on log payload summary", () => {
    const summary = redactExternalMessagePayload({
      noticeBody: "민감 알림 본문",
      portalPath: "/client/cases/c1",
      metadataOnly: true,
      recipientEmail: "client@example.com",
    }) as Record<string, unknown>;

    expect(summary.noticeBody).toContain("REDACTED");
    expect(summary.portalPath).toBe("/client/cases/c1");
    expect(summary.recipientEmail).toContain("REDACTED");
  });

  it("18-B redelivery flags remain compatible for retryable SMTP errors", () => {
    const err = {
      code: "NETWORK_TIMEOUT" as const,
      retryable: true,
      autoRetryAllowed: false,
      redeliveryEligible: true,
      safeMessage: "SMTP network timeout",
    };
    expect(isRedeliveryEligibleError(err)).toBe(true);
  });
});
