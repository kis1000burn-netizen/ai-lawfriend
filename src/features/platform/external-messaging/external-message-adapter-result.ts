/**
 * Product Phase 20-A — Provider result standardization.
 */
import type {
  ExternalMessageChannel,
  ExternalMessageProvider,
} from "./external-message-adapter.schema";

export const REAL_MESSAGING_ADAPTER_RESULT_MARKER_PHASE20A =
  "phase20a-real-messaging-adapter-result" as const;

export const EXTERNAL_MESSAGE_PROVIDER_RESULT_STATUSES = [
  "SENT",
  "FAILED",
  "SKIPPED",
  "DRY_RUN",
] as const;

export type ExternalMessageProviderResultStatus =
  (typeof EXTERNAL_MESSAGE_PROVIDER_RESULT_STATUSES)[number];

export type ExternalMessageProviderSafeSummary = {
  templateKey: string;
  recipientMasked: string;
  portalPath?: string;
};

export interface ExternalMessageProviderResult {
  status: ExternalMessageProviderResultStatus;
  provider: ExternalMessageProvider;
  channel: ExternalMessageChannel;

  providerMessageId?: string;
  providerStatusCode?: string;

  retryable: boolean;
  redeliveryEligible: boolean;

  safeSummary: ExternalMessageProviderSafeSummary;

  /** Redacted provider response — never store raw payload. */
  rawProviderResponseRedacted?: Record<string, unknown>;
}

export function isExternalMessageProviderResultRedacted(
  result: ExternalMessageProviderResult,
): boolean {
  if (!result.rawProviderResponseRedacted) {
    return true;
  }
  const forbidden = ["body", "attachment", "documentBody", "rawPayload", "recipientEmail"];
  return !forbidden.some((key) => key in result.rawProviderResponseRedacted!);
}
