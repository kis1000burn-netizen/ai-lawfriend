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

export const SECURE_DELIVERY_TEMPLATE_BY_SURFACE: Record<
  ExternalMessageSendSurface,
  string
> = {
  DOCUMENT_DELIVERY: "CLIENT_DOC_SHARE_V1",
  SUPPLEMENT_REQUEST: "SUPPLEMENT_REQUEST_V1",
  COURT_DEADLINE_REMINDER: "COURT_DEADLINE_REMINDER_V1",
  CLIENT_PORTAL_MESSAGE: "CLIENT_PORTAL_MESSAGE_V1",
  SYSTEM_NOTICE: "SYSTEM_NOTICE_V1",
};

export const SECURE_DELIVERY_NOTICE_BY_SURFACE: Record<ExternalMessageSendSurface, string> = {
  DOCUMENT_DELIVERY:
    "[AI법친] 변호사가 사건 관련 서류를 공유했습니다. 보안 포털에서 확인해 주세요.",
  SUPPLEMENT_REQUEST: "[AI법친] 보완 요청이 도착했습니다. 보안 포털에서 확인해 주세요.",
  COURT_DEADLINE_REMINDER: "[AI법친] 사건 기한 알림이 있습니다. 보안 포털에서 확인해 주세요.",
  CLIENT_PORTAL_MESSAGE: "[AI법친] 포털에 새 메시지가 있습니다. 보안 포털에서 확인해 주세요.",
  SYSTEM_NOTICE: "[AI법친] 시스템 안내가 있습니다. 보안 포털에서 확인해 주세요.",
};

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
