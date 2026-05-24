/**
 * Product Phase 20-A — ExternalMessageAdapter contract.
 */
import type {
  ExternalMessageChannel,
  ExternalMessagePayloadValidationResult,
  ExternalMessageProvider,
  ExternalMessageSendPayload,
} from "./external-message-adapter.schema";
import type { ExternalMessageProviderResult } from "./external-message-adapter-result";
import type { ExternalMessageProviderError } from "./external-message-provider-error";

export const REAL_MESSAGING_ADAPTER_CONTRACT_MARKER_PHASE20A =
  "phase20a-real-messaging-adapter-contract" as const;

export interface ExternalMessageAdapter {
  readonly provider: ExternalMessageProvider;
  readonly channel: ExternalMessageChannel;

  supportsChannel(channel: ExternalMessageChannel): boolean;

  validatePayload(
    payload: ExternalMessageSendPayload,
  ): ExternalMessagePayloadValidationResult;

  send(payload: ExternalMessageSendPayload): Promise<ExternalMessageProviderResult>;

  mapProviderError(error: unknown): ExternalMessageProviderError;
}
