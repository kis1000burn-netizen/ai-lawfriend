/**
 * Product Phase 20-B — SMTP email adapter (secure link · allowlist · redacted response).
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
  readSmtpEmailConfig,
  type SmtpEmailConfig,
} from "./external-message-email-config";
import type { ExternalMessageEmailTransport } from "./external-message-email-transport";

export const REAL_MESSAGING_SMTP_ADAPTER_MARKER_PHASE20B =
  "phase20b-real-messaging-smtp-adapter" as const;

export class ExternalMessageSmtpAdapter implements ExternalMessageAdapter {
  readonly provider = "SMTP" as const;
  readonly channel = "EMAIL" as const;

  constructor(
    private readonly transport: ExternalMessageEmailTransport,
    private readonly smtpConfig: SmtpEmailConfig,
  ) {}

  supportsChannel(channel: "EMAIL" | "KAKAO" | "IN_APP"): boolean {
    return channel === "EMAIL";
  }

  validatePayload(payload: ExternalMessageSendPayload): ExternalMessagePayloadValidationResult {
    if (payload.channel !== "EMAIL") {
      return { ok: false, reason: "SMTP_EMAIL_CHANNEL_ONLY" };
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

    const transportResult = await this.transport.send({
      to: email,
      subject: content.subject,
      text: content.textBody,
      html: content.htmlBody,
      fromAddress: this.smtpConfig.fromAddress,
      fromName: this.smtpConfig.fromName,
    });

    return {
      status: "SENT",
      provider: this.provider,
      channel: payload.channel,
      providerMessageId: transportResult.messageId,
      providerStatusCode: transportResult.responseCode,
      retryable: false,
      redeliveryEligible: false,
      safeSummary: {
        templateKey: payload.template.templateKey,
        recipientMasked: maskExternalMessageRecipient(payload.recipient),
        portalPath: payload.safeLink?.portalPath,
      },
      rawProviderResponseRedacted: redactProviderRawResponse(transportResult.rawResponse),
    };
  }

  mapProviderError(error: unknown) {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes("auth") || message.includes("credentials")) {
        return createExternalMessageProviderError({
          code: "AUTH_ERROR",
          retryable: false,
          autoRetryAllowed: false,
          redeliveryEligible: false,
          safeMessage: "SMTP authentication failed",
        });
      }
      if (message.includes("timeout") || message.includes("etimedout")) {
        return createExternalMessageProviderError({
          code: "NETWORK_TIMEOUT",
          retryable: true,
          autoRetryAllowed: false,
          redeliveryEligible: true,
          safeMessage: "SMTP network timeout",
        });
      }
      if (message.includes("config") || message.includes("missing")) {
        return createExternalMessageProviderError({
          code: "CONFIG_ERROR",
          retryable: false,
          autoRetryAllowed: false,
          redeliveryEligible: false,
          safeMessage: "SMTP configuration error",
        });
      }
    }
    return mapUnknownProviderError(error);
  }
}

export function createSmtpAdapterFromEnv(): ExternalMessageSmtpAdapter | null {
  const config = readSmtpEmailConfig();
  if (!config) {
    return null;
  }
  return new ExternalMessageSmtpAdapter(
    {
      send: async () => {
        throw new Error("SMTP transport not initialized — use registerExternalMessageSmtpAdapter");
      },
    },
    config,
  );
}

export function registerExternalMessageSmtpAdapter(
  transport: ExternalMessageEmailTransport,
  config: SmtpEmailConfig = readSmtpEmailConfig()!,
): ExternalMessageSmtpAdapter {
  return new ExternalMessageSmtpAdapter(transport, config);
}
