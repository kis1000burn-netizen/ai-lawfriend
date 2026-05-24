/**
 * Phase 18-B — Safe external message re-delivery policy (no duplicate · no auto auth retry).
 */
import type { CaseDocumentDeliveryChannel, ExternalMessageStatus } from "@prisma/client";
import {
  externalMessageRedeliveryMetaSchema,
  EXTERNAL_MESSAGE_REDELIVERY_SAFE_PAYLOAD_KEYS,
} from "./external-message-redelivery.schema";

export const RELIABILITY_EXTERNAL_MESSAGE_REDELIVERY_POLICY_MARKER_PHASE18B =
  "phase18b-external-message-redelivery-policy" as const;

const BLOCKED_FAILURE_PATTERNS = [
  /AUTH/i,
  /CREDENTIAL/i,
  /TEMPLATE/i,
  /CONSENT/i,
  /PERMISSION/i,
  /FORBIDDEN/i,
  /UNAUTHORIZED/i,
  /NOT_REGISTERED/i,
  /INVALID_?KEY/i,
  /CONFIG/i,
];

export type ExternalMessageRedeliveryPolicyInput = {
  logStatus: ExternalMessageStatus;
  channel: CaseDocumentDeliveryChannel;
  failureReason?: string | null;
  deliveryStatus?: string | null;
  hasSuccessfulSibling: boolean;
  hasInFlightRedelivery: boolean;
  attemptCount: number;
  maxAttempts: number;
};

export type ExternalMessageRedeliveryPolicyResult = {
  retryable: boolean;
  autoRetryAllowed: false;
  blockReason?: string;
};

export function evaluateExternalMessageRedeliveryPolicy(
  input: ExternalMessageRedeliveryPolicyInput,
): ExternalMessageRedeliveryPolicyResult {
  if (input.logStatus === "SENT") {
    return { retryable: false, autoRetryAllowed: false, blockReason: "Already sent successfully." };
  }

  if (input.logStatus === "SKIPPED_NO_CONSENT") {
    return {
      retryable: false,
      autoRetryAllowed: false,
      blockReason: "Consent/configuration issue — operator must fix preference before re-delivery.",
    };
  }

  if (input.deliveryStatus === "SENT" || input.deliveryStatus === "VIEWED") {
    return {
      retryable: false,
      autoRetryAllowed: false,
      blockReason: "Delivery record already marked sent/viewed.",
    };
  }

  if (input.hasSuccessfulSibling) {
    return {
      retryable: false,
      autoRetryAllowed: false,
      blockReason: "Duplicate guard — successful delivery exists for this channel.",
    };
  }

  if (input.hasInFlightRedelivery) {
    return {
      retryable: false,
      autoRetryAllowed: false,
      blockReason: "Duplicate guard — re-delivery already in progress.",
    };
  }

  if (input.attemptCount >= input.maxAttempts) {
    return {
      retryable: false,
      autoRetryAllowed: false,
      blockReason: "Maximum re-delivery attempts reached.",
    };
  }

  const reason = input.failureReason?.trim() ?? "";
  if (reason && BLOCKED_FAILURE_PATTERNS.some((p) => p.test(reason))) {
    return {
      retryable: false,
      autoRetryAllowed: false,
      blockReason: "Auth/template/config failure — automatic re-delivery blocked.",
    };
  }

  if (input.logStatus !== "FAILED" && input.logStatus !== "PENDING") {
    return {
      retryable: false,
      autoRetryAllowed: false,
      blockReason: `Status ${input.logStatus} is not eligible for re-delivery.`,
    };
  }

  return { retryable: true, autoRetryAllowed: false };
}

export function extractSafeRedeliveryMeta(payload: unknown): {
  ok: boolean;
  meta?: ReturnType<typeof externalMessageRedeliveryMetaSchema.parse>;
  error?: string;
} {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Missing payload summary." };
  }

  const raw = payload as Record<string, unknown>;
  for (const key of Object.keys(raw)) {
    if (!EXTERNAL_MESSAGE_REDELIVERY_SAFE_PAYLOAD_KEYS.includes(key as never)) {
      if (/body|content|preview|attachment|file|document/i.test(key)) {
        return { ok: false, error: `Unsafe payload field rejected: ${key}` };
      }
    }
  }

  try {
    const meta = externalMessageRedeliveryMetaSchema.parse({
      noticeBody:
        typeof raw.noticeBody === "string"
          ? raw.noticeBody
          : "[AI법친] 사건 관련 알림 — 포털에서 확인해 주세요.",
      portalPath: typeof raw.portalPath === "string" ? raw.portalPath : "/client",
      documentTitle:
        typeof raw.documentTitle === "string" ? raw.documentTitle : "공유 문서",
      containsFileAttachment: false as const,
      templateCode: typeof raw.templateCode === "string" ? raw.templateCode : undefined,
      metadataOnly: true as const,
    });
    return { ok: true, meta };
  } catch {
    return { ok: false, error: "Could not build metadata-only re-delivery payload." };
  }
}
