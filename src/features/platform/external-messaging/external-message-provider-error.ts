/**
 * Product Phase 20-A — Provider error standardization (18-B redelivery compatible).
 */
export const REAL_MESSAGING_PROVIDER_ERROR_MARKER_PHASE20A =
  "phase20a-real-messaging-provider-error" as const;

export const EXTERNAL_MESSAGE_PROVIDER_ERROR_CODES = [
  "AUTH_ERROR",
  "CONFIG_ERROR",
  "CONSENT_REQUIRED",
  "TEMPLATE_ERROR",
  "RATE_LIMITED",
  "NETWORK_TIMEOUT",
  "PROVIDER_REJECTED",
  "UNKNOWN_PROVIDER_ERROR",
] as const;

export type ExternalMessageProviderErrorCode =
  (typeof EXTERNAL_MESSAGE_PROVIDER_ERROR_CODES)[number];

export interface ExternalMessageProviderError {
  code: ExternalMessageProviderErrorCode;
  retryable: boolean;
  autoRetryAllowed: boolean;
  redeliveryEligible: boolean;
  safeMessage: string;
}

export function createExternalMessageProviderError(input: {
  code: ExternalMessageProviderErrorCode;
  retryable?: boolean;
  autoRetryAllowed?: boolean;
  redeliveryEligible?: boolean;
  safeMessage: string;
}): ExternalMessageProviderError {
  const retryable = input.retryable ?? false;
  return {
    code: input.code,
    retryable,
    autoRetryAllowed: input.autoRetryAllowed ?? retryable,
    redeliveryEligible: input.redeliveryEligible ?? retryable,
    safeMessage: input.safeMessage,
  };
}

export function mapUnknownProviderError(error: unknown): ExternalMessageProviderError {
  const safeMessage =
    error instanceof Error ? error.message.slice(0, 200) : "Unknown provider error";
  return createExternalMessageProviderError({
    code: "UNKNOWN_PROVIDER_ERROR",
    retryable: false,
    autoRetryAllowed: false,
    redeliveryEligible: false,
    safeMessage,
  });
}

export function isRedeliveryEligibleError(
  error: ExternalMessageProviderError,
): boolean {
  return error.redeliveryEligible && error.code !== "CONSENT_REQUIRED";
}
