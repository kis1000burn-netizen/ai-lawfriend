/**
 * Product Phase 20-B — SendGrid email adapter (HTTP API · secure link only).
 */
import type { ExternalMessageAdapter } from "./external-message-adapter.contract";
import type {
  ExternalMessagePayloadValidationResult,
  ExternalMessageSendPayload,
} from "./external-message-adapter.schema";
import type { ExternalMessageProviderResult } from "./external-message-adapter-result";
import {
  createExternalMessageProviderError,
  mapUnknownProviderError,
} from "./external-message-provider-error";
import {
  maskExternalMessageRecipient,
  validateExternalMessageChannelPolicy,
} from "./external-message-channel-policy";
import { validateExternalMessageTemplatePolicy } from "./external-message-template-policy";
import { validateEmailTemplateAllowlist } from "./external-message-email-template-allowlist";
import { buildSafeEmailContent } from "./external-message-email-body-builder";
import { redactProviderRawResponse } from "./external-message-provider-response-redaction";
import {
  readSendGridEmailConfig,
  type SendGridEmailConfig,
} from "./external-message-email-config";

export const REAL_MESSAGING_SENDGRID_ADAPTER_MARKER_PHASE20B =
  "phase20b-real-messaging-sendgrid-adapter" as const;

export class ExternalMessageSendGridAdapter implements ExternalMessageAdapter {
  readonly provider = "SENDGRID" as const;
  readonly channel = "EMAIL" as const;

  constructor(private readonly config: SendGridEmailConfig) {}

  supportsChannel(channel: "EMAIL" | "KAKAO" | "IN_APP"): boolean {
    return channel === "EMAIL";
  }

  validatePayload(payload: ExternalMessageSendPayload): ExternalMessagePayloadValidationResult {
    if (payload.channel !== "EMAIL") {
      return { ok: false, reason: "SENDGRID_EMAIL_CHANNEL_ONLY" };
    }

    if (!payload.recipient.email) {
      return { ok: false, reason: "EMAIL_RECIPIENT_REQUIRED" };
    }

    const allowlist = validateEmailTemplateAllowlist(payload);
    if (!allowlist.ok) return allowlist;

    const channelPolicy = validateExternalMessageChannelPolicy(payload);
    if (!channelPolicy.ok) return channelPolicy;

    const templatePolicy = validateExternalMessageTemplatePolicy(payload);
    if (!templatePolicy.ok) return templatePolicy;

    return { ok: true };
  }

  async send(payload: ExternalMessageSendPayload): Promise<ExternalMessageProviderResult> {
    const validation = this.validatePayload(payload);
    if (!validation.ok) {
      throw new Error(validation.reason);
    }

    const email = payload.recipient.email!;
    const content = buildSafeEmailContent(payload);

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: this.config.fromAddress, name: this.config.fromName },
        subject: content.subject,
        content: [
          { type: "text/plain", value: content.textBody },
          { type: "text/html", value: content.htmlBody },
        ],
      }),
    });

    const rawResponse = {
      status: response.status,
      statusText: response.statusText,
      accepted: response.ok,
    };

    if (!response.ok) {
      const err = new Error(`SendGrid rejected request (${response.status})`);
      throw err;
    }

    const messageId = response.headers.get("x-message-id") ?? undefined;

    return {
      status: "SENT",
      provider: this.provider,
      channel: payload.channel,
      providerMessageId: messageId,
      providerStatusCode: String(response.status),
      retryable: false,
      redeliveryEligible: false,
      safeSummary: {
        templateKey: payload.template.templateKey,
        recipientMasked: maskExternalMessageRecipient(payload.recipient),
        portalPath: payload.safeLink?.portalPath,
      },
      rawProviderResponseRedacted: redactProviderRawResponse(rawResponse),
    };
  }

  mapProviderError(error: unknown) {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes("401") || message.includes("403")) {
        return createExternalMessageProviderError({
          code: "AUTH_ERROR",
          retryable: false,
          autoRetryAllowed: false,
          redeliveryEligible: false,
          safeMessage: "SendGrid authentication failed",
        });
      }
      if (message.includes("429")) {
        return createExternalMessageProviderError({
          code: "RATE_LIMITED",
          retryable: true,
          autoRetryAllowed: false,
          redeliveryEligible: true,
          safeMessage: "SendGrid rate limited",
        });
      }
      if (message.includes("rejected")) {
        return createExternalMessageProviderError({
          code: "PROVIDER_REJECTED",
          retryable: false,
          autoRetryAllowed: false,
          redeliveryEligible: false,
          safeMessage: "SendGrid rejected message",
        });
      }
    }
    return mapUnknownProviderError(error);
  }
}

export function createSendGridAdapterFromEnv(): ExternalMessageSendGridAdapter | null {
  const config = readSendGridEmailConfig();
  if (!config) {
    return null;
  }
  return new ExternalMessageSendGridAdapter(config);
}
