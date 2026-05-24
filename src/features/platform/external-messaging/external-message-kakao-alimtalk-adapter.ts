/**
 * Product Phase 20-C — Kakao Alimtalk adapter (registry · consent · masking · redaction).
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
import { validateKakaoAlimtalkConsent } from "./external-message-kakao-consent-guard";
import { validateKakaoAlimtalkTemplateRegistry } from "./external-message-kakao-template-registry";
import { buildKakaoAlimtalkSafeVariables } from "./external-message-kakao-message-builder";
import { redactProviderRawResponse } from "./external-message-provider-response-redaction";
import type { ExternalMessageKakaoAlimtalkTransport } from "./external-message-kakao-alimtalk-transport";

export const REAL_MESSAGING_KAKAO_ALIMTALK_ADAPTER_MARKER_PHASE20C =
  "phase20c-real-messaging-kakao-alimtalk-adapter" as const;

export class ExternalMessageKakaoAlimtalkAdapter implements ExternalMessageAdapter {
  readonly provider = "KAKAO_ALIMTALK" as const;
  readonly channel = "KAKAO" as const;

  constructor(private readonly transport: ExternalMessageKakaoAlimtalkTransport) {}

  supportsChannel(channel: "EMAIL" | "KAKAO" | "IN_APP"): boolean {
    return channel === "KAKAO";
  }

  validatePayload(payload: ExternalMessageSendPayload): ExternalMessagePayloadValidationResult {
    if (payload.channel !== "KAKAO") {
      return { ok: false, reason: "KAKAO_ALIMTALK_CHANNEL_ONLY" };
    }

    if (!payload.recipient.phone) {
      return { ok: false, reason: "KAKAO_PHONE_REQUIRED" };
    }

    const consent = validateKakaoAlimtalkConsent(payload);
    if (!consent.ok) return consent;

    const registry = validateKakaoAlimtalkTemplateRegistry(payload);
    if (!registry.ok) return registry;

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

    const registry = validateKakaoAlimtalkTemplateRegistry(payload);
    if (!registry.ok) {
      throw new Error(registry.reason);
    }

    const phone = payload.recipient.phone!;
    const variables = buildKakaoAlimtalkSafeVariables(payload, registry.entry);
    const templateCode = payload.template.providerTemplateCode!;

    const transportResult = await this.transport.send({
      phone,
      templateCode,
      variables,
    });

    return {
      status: "SENT",
      provider: this.provider,
      channel: payload.channel,
      providerMessageId: transportResult.messageId,
      providerStatusCode: transportResult.statusCode,
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
      if (message.includes("consent")) {
        return createExternalMessageProviderError({
          code: "CONSENT_REQUIRED",
          retryable: false,
          autoRetryAllowed: false,
          redeliveryEligible: false,
          safeMessage: "Kakao consent required",
        });
      }
      if (message.includes("template")) {
        return createExternalMessageProviderError({
          code: "TEMPLATE_ERROR",
          retryable: false,
          autoRetryAllowed: false,
          redeliveryEligible: false,
          safeMessage: "Kakao template error",
        });
      }
      if (message.includes("401") || message.includes("403") || message.includes("auth")) {
        return createExternalMessageProviderError({
          code: "AUTH_ERROR",
          retryable: false,
          autoRetryAllowed: false,
          redeliveryEligible: false,
          safeMessage: "Kakao Alimtalk authentication failed",
        });
      }
      if (message.includes("429") || message.includes("rate")) {
        return createExternalMessageProviderError({
          code: "RATE_LIMITED",
          retryable: true,
          autoRetryAllowed: false,
          redeliveryEligible: true,
          safeMessage: "Kakao Alimtalk rate limited",
        });
      }
      if (message.includes("timeout")) {
        return createExternalMessageProviderError({
          code: "NETWORK_TIMEOUT",
          retryable: true,
          autoRetryAllowed: false,
          redeliveryEligible: true,
          safeMessage: "Kakao Alimtalk network timeout",
        });
      }
      if (message.includes("rejected")) {
        return createExternalMessageProviderError({
          code: "PROVIDER_REJECTED",
          retryable: false,
          autoRetryAllowed: false,
          redeliveryEligible: false,
          safeMessage: "Kakao Alimtalk rejected message",
        });
      }
    }
    return mapUnknownProviderError(error);
  }
}

export function createKakaoAlimtalkAdapterFromTransport(
  transport: ExternalMessageKakaoAlimtalkTransport,
): ExternalMessageKakaoAlimtalkAdapter {
  return new ExternalMessageKakaoAlimtalkAdapter(transport);
}
