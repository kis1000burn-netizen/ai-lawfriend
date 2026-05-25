/**
 * Product Phase 20-E — Secure delivery external message payload builder (portal link only).
 */
import { KAKAO_ALIMTALK_TEMPLATE_REGISTRY } from "./external-message-kakao-template-registry";
import { EXTERNAL_MESSAGE_EMAIL_TEMPLATE_ALLOWLIST } from "./external-message-email-template-allowlist";
import type {
  ExternalMessageChannel,
  ExternalMessageProvider,
  ExternalMessageSendPayload,
  ExternalMessageSendSurface,
} from "./external-message-adapter.schema";
import {
  SECURE_DELIVERY_NOTICE_BY_SURFACE,
  SECURE_DELIVERY_TEMPLATE_BY_SURFACE,
} from "./secure-delivery-message-constants";
import { EXTERNAL_MESSAGE_DEFAULT_REDACTION_POLICY_VERSION } from "./external-message-adapter.service";
import {
  emailProviderForResolved,
  resolveEmailProvider,
} from "./external-message-email-config";
import {
  kakaoProviderForResolved,
  resolveKakaoProvider,
} from "./external-message-kakao-config";

export const REAL_MESSAGING_SECURE_DELIVERY_BUILDER_MARKER_PHASE20E =
  "phase20e-real-messaging-secure-delivery-builder" as const;

export {
  SECURE_DELIVERY_NOTICE_BY_SURFACE,
  SECURE_DELIVERY_TEMPLATE_BY_SURFACE,
} from "./secure-delivery-message-constants";

export function buildSecureDeliveryPortalPath(input: {
  caseId: string;
  surface: ExternalMessageSendSurface;
  entityId?: string;
}): string {
  switch (input.surface) {
    case "DOCUMENT_DELIVERY":
      return input.entityId
        ? `/client/cases/${input.caseId}?tab=shared&share=${input.entityId}`
        : `/client/cases/${input.caseId}?tab=shared`;
    case "SUPPLEMENT_REQUEST":
      return `/client/cases/${input.caseId}?tab=supplement`;
    case "COURT_DEADLINE_REMINDER":
      return `/client/cases/${input.caseId}?tab=deadlines`;
    case "CLIENT_PORTAL_MESSAGE":
      return `/client/cases/${input.caseId}?tab=messages`;
    default:
      return `/client/cases/${input.caseId}`;
  }
}

export function mapDeliveryChannelToMessageChannel(
  channel: "EMAIL" | "KAKAO_ALIMTALK" | "IN_APP" | "SMS",
): ExternalMessageChannel | null {
  if (channel === "EMAIL") return "EMAIL";
  if (channel === "KAKAO_ALIMTALK") return "KAKAO";
  return null;
}

export function resolveProviderForMessageChannel(
  channel: ExternalMessageChannel,
): ExternalMessageProvider {
  if (channel === "EMAIL") {
    return emailProviderForResolved(resolveEmailProvider());
  }
  if (channel === "KAKAO") {
    return kakaoProviderForResolved(resolveKakaoProvider());
  }
  return "DRY_RUN";
}

export function resolveProviderTemplateCode(
  templateKey: string,
  channel: ExternalMessageChannel,
): string | undefined {
  if (channel === "KAKAO") {
    const entry =
      KAKAO_ALIMTALK_TEMPLATE_REGISTRY[
        templateKey as keyof typeof KAKAO_ALIMTALK_TEMPLATE_REGISTRY
      ];
    return entry?.providerTemplateCode;
  }
  if (
    channel === "EMAIL" &&
    (EXTERNAL_MESSAGE_EMAIL_TEMPLATE_ALLOWLIST as readonly string[]).includes(templateKey)
  ) {
    return templateKey;
  }
  return undefined;
}

export function buildSecureDeliveryIdempotencyKey(input: {
  surface: ExternalMessageSendSurface;
  caseId: string;
  channel: ExternalMessageChannel;
  entityId: string;
}): string {
  return `sd-${input.surface}-${input.caseId}-${input.channel}-${input.entityId}`.slice(0, 128);
}

export function buildSecureDeliveryExternalPayload(input: {
  surface: ExternalMessageSendSurface;
  channel: ExternalMessageChannel;
  caseId: string;
  recipientUserId: string;
  recipient: { email?: string; phone?: string; displayName?: string };
  portalPath: string;
  templateKey?: string;
  variables?: Record<string, string>;
  entityId: string;
  consentVerified: boolean;
  metadataSource?: "CLIENT_PORTAL" | "COMMAND_CENTER" | "DEADLINE" | "DOCUMENT_DELIVERY";
}): ExternalMessageSendPayload {
  const templateKey = input.templateKey ?? SECURE_DELIVERY_TEMPLATE_BY_SURFACE[input.surface];
  const provider = resolveProviderForMessageChannel(input.channel);
  const providerTemplateCode = resolveProviderTemplateCode(templateKey, input.channel);

  return {
    channel: input.channel,
    provider,
    surface: input.surface,
    caseId: input.caseId,
    recipientUserId: input.recipientUserId,
    recipient: input.recipient,
    template: {
      templateKey,
      providerTemplateCode,
      variables: {
        noticeBody: SECURE_DELIVERY_NOTICE_BY_SURFACE[input.surface],
        portalPath: input.portalPath,
        ...input.variables,
      },
    },
    safeLink: { portalPath: input.portalPath },
    metadata: {
      source: input.metadataSource ?? "COMMAND_CENTER",
      idempotencyKey: buildSecureDeliveryIdempotencyKey({
        surface: input.surface,
        caseId: input.caseId,
        channel: input.channel,
        entityId: input.entityId,
      }),
      redactionPolicyVersion: EXTERNAL_MESSAGE_DEFAULT_REDACTION_POLICY_VERSION,
      consentVerified: input.consentVerified,
    },
  };
}
