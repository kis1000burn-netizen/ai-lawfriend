/**
 * Product Phase 20-A — Dry-run adapter (no real provider send).
 */
import type { ExternalMessageAdapter } from "./external-message-adapter.contract";
import type {
  ExternalMessageChannel,
  ExternalMessagePayloadValidationResult,
  ExternalMessageSendPayload,
} from "./external-message-adapter.schema";
import type { ExternalMessageProviderResult } from "./external-message-adapter-result";
import { mapUnknownProviderError } from "./external-message-provider-error";
import {
  maskExternalMessageRecipient,
  validateExternalMessageChannelPolicy,
} from "./external-message-channel-policy";
import { validateExternalMessageTemplatePolicy } from "./external-message-template-policy";

export const REAL_MESSAGING_DRY_RUN_ADAPTER_MARKER_PHASE20A =
  "phase20a-real-messaging-dry-run-adapter" as const;

export class ExternalMessageDryRunAdapter implements ExternalMessageAdapter {
  readonly provider = "DRY_RUN" as const;
  readonly channel: ExternalMessageChannel;

  constructor(channel: ExternalMessageChannel) {
    this.channel = channel;
  }

  supportsChannel(channel: ExternalMessageChannel): boolean {
    return this.channel === channel;
  }

  validatePayload(payload: ExternalMessageSendPayload): ExternalMessagePayloadValidationResult {
    if (!payload.template.templateKey) {
      return { ok: false, reason: "TEMPLATE_KEY_REQUIRED" };
    }

    if (!payload.metadata.idempotencyKey) {
      return { ok: false, reason: "IDEMPOTENCY_KEY_REQUIRED" };
    }

    const channelPolicy = validateExternalMessageChannelPolicy(payload);
    if (!channelPolicy.ok) {
      return channelPolicy;
    }

    const templatePolicy = validateExternalMessageTemplatePolicy(payload);
    if (!templatePolicy.ok) {
      return templatePolicy;
    }

    return { ok: true };
  }

  async send(payload: ExternalMessageSendPayload): Promise<ExternalMessageProviderResult> {
    const validation = this.validatePayload(payload);
    if (!validation.ok) {
      throw new Error(validation.reason);
    }

    return {
      status: "DRY_RUN",
      provider: this.provider,
      channel: payload.channel,
      retryable: false,
      redeliveryEligible: false,
      safeSummary: {
        templateKey: payload.template.templateKey,
        recipientMasked: maskExternalMessageRecipient(payload.recipient),
        portalPath: payload.safeLink?.portalPath,
      },
      rawProviderResponseRedacted: {
        dryRun: true,
        idempotencyKey: payload.metadata.idempotencyKey,
      },
    };
  }

  mapProviderError(error: unknown) {
    return mapUnknownProviderError(error);
  }
}

export function createDryRunAdapterForChannel(
  channel: ExternalMessageChannel,
): ExternalMessageDryRunAdapter {
  return new ExternalMessageDryRunAdapter(channel);
}
