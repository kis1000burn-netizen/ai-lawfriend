import { afterEach, describe, expect, it, vi } from "vitest";
import { redactExternalMessagePayload } from "@/lib/data-governance/data-redaction.service";
import { EXTERNAL_MESSAGE_REDELIVERY_SAFE_PAYLOAD_KEYS } from "@/features/platform/reliability/external-message-redelivery.schema";

vi.mock("@/features/secure-document-delivery/secure-document-delivery.repository", () => ({
  createExternalMessageLogRow: vi.fn().mockResolvedValue({ id: "log-kakao-1" }),
}));

import { createExternalMessageLogRow } from "@/features/secure-document-delivery/secure-document-delivery.repository";
import {
  EXTERNAL_MESSAGE_DEFAULT_REDACTION_POLICY_VERSION,
  registerExternalMessageAdapter,
  resetExternalMessageAdapterRegistryForTests,
  sendExternalMessageViaAdapter,
} from "./external-message-adapter.service";
import { maskExternalMessageRecipient } from "./external-message-channel-policy";
import {
  KAKAO_PROVIDER_ENV_KEY,
  resolveKakaoProvider,
} from "./external-message-kakao-config";
import {
  KAKAO_ALIMTALK_TEMPLATE_REGISTRY,
  isKakaoAlimtalkTemplateKeyRegistered,
  validateKakaoAlimtalkTemplateRegistry,
} from "./external-message-kakao-template-registry";
import { validateKakaoAlimtalkConsent } from "./external-message-kakao-consent-guard";
import { buildKakaoAlimtalkSafeVariables } from "./external-message-kakao-message-builder";
import { redactProviderRawResponse } from "./external-message-provider-response-redaction";
import {
  createMockKakaoAlimtalkTransport,
  type ExternalMessageKakaoAlimtalkTransport,
} from "./external-message-kakao-alimtalk-transport";
import { ExternalMessageKakaoAlimtalkAdapter } from "./external-message-kakao-alimtalk-adapter";
import {
  mapExternalMessageChannelToDeliveryChannel,
  mapProviderResultToExternalMessageLogStatus,
  recordExternalMessageAdapterResult,
} from "./external-message-log.service";
import { isExternalMessageProviderResultRedacted } from "./external-message-adapter-result";
import { isRedeliveryEligibleError } from "./external-message-provider-error";

const baseKakaoPayload = {
  channel: "KAKAO" as const,
  provider: "KAKAO_ALIMTALK" as const,
  surface: "DOCUMENT_DELIVERY" as const,
  caseId: "clh3vkg8b0000qzrmn8311i4",
  recipientUserId: "clh3vkg8b0000qzrmn8311i5",
  recipient: { phone: "01012345678", displayName: "의뢰인" },
  template: {
    templateKey: "CLIENT_DOC_SHARE_V1",
    providerTemplateCode: "AIBEOPCHIN_CLIENT_DOC_SHARE_V1",
    variables: {
      noticeBody: "문서가 공유되었습니다.",
      documentTitle: "소장",
    },
  },
  safeLink: { portalPath: "/client/cases/c1?tab=shared" },
  metadata: {
    source: "DOCUMENT_DELIVERY" as const,
    idempotencyKey: "idem-kakao-12345678",
    redactionPolicyVersion: EXTERNAL_MESSAGE_DEFAULT_REDACTION_POLICY_VERSION,
    consentVerified: true,
  },
};

describe("external message kakao adapter (Phase 20-C)", () => {
  afterEach(() => {
    resetExternalMessageAdapterRegistryForTests();
    vi.unstubAllEnvs();
    vi.mocked(createExternalMessageLogRow).mockClear();
  });

  it("branches KAKAO_PROVIDER env (default DRY_RUN)", () => {
    expect(resolveKakaoProvider({})).toBe("DRY_RUN");
    expect(resolveKakaoProvider({ [KAKAO_PROVIDER_ENV_KEY]: "ALIMTALK" })).toBe("ALIMTALK");
    expect(resolveKakaoProvider({ [KAKAO_PROVIDER_ENV_KEY]: "invalid" })).toBe("DRY_RUN");
  });

  it("requires registered templateCode and allowlisted variables", () => {
    expect(isKakaoAlimtalkTemplateKeyRegistered("CLIENT_DOC_SHARE_V1")).toBe(true);
    expect(Object.keys(KAKAO_ALIMTALK_TEMPLATE_REGISTRY).length).toBeGreaterThanOrEqual(5);

    const blocked = validateKakaoAlimtalkTemplateRegistry({
      ...baseKakaoPayload,
      template: {
        ...baseKakaoPayload.template,
        templateKey: "UNKNOWN_TEMPLATE",
      },
    });
    expect(blocked.ok).toBe(false);

    const badVariable = validateKakaoAlimtalkTemplateRegistry({
      ...baseKakaoPayload,
      template: {
        ...baseKakaoPayload.template,
        variables: { documentBody: "legal text full" },
      },
    });
    expect(badVariable.ok).toBe(false);
  });

  it("enforces Kakao consent guard", () => {
    const blocked = validateKakaoAlimtalkConsent({
      ...baseKakaoPayload,
      metadata: { ...baseKakaoPayload.metadata, consentVerified: false },
    });
    expect(blocked.ok).toBe(false);

    const missing = validateKakaoAlimtalkConsent({
      ...baseKakaoPayload,
      metadata: { ...baseKakaoPayload.metadata, consentVerified: undefined },
    });
    expect(missing.ok).toBe(false);
  });

  it("masks recipient phone for logs", () => {
    const masked = maskExternalMessageRecipient({ phone: "01012345678" });
    expect(masked).not.toBe("01012345678");
  });

  it("builds allowlisted Alimtalk variables with secure portal link", () => {
    const registry = validateKakaoAlimtalkTemplateRegistry(baseKakaoPayload);
    expect(registry.ok).toBe(true);
    if (!registry.ok) return;

    const variables = buildKakaoAlimtalkSafeVariables(
      baseKakaoPayload,
      registry.entry,
      "https://app.example.com",
    );
    expect(variables.portalPath).toContain("https://app.example.com/client/cases/c1");
    expect(variables.noticeBody).toBeTruthy();
    expect(variables.documentBody).toBeUndefined();
  });

  it("redacts provider raw response (no phone)", () => {
    const redacted = redactProviderRawResponse({
      messageId: "kakao-1",
      to: "01012345678",
      recipient: { phone: "01012345678" },
      body: "secret",
    });
    expect(redacted.to).toBeUndefined();
    expect(redacted.body).toBeUndefined();
    expect(JSON.stringify(redacted)).not.toContain("01012345678");
  });

  it("Alimtalk adapter sends via transport and returns SENT with redacted response", async () => {
    const transport: ExternalMessageKakaoAlimtalkTransport = createMockKakaoAlimtalkTransport({
      messageId: "kakao-msg-88",
      statusCode: "200",
      rawResponse: {
        messageId: "kakao-msg-88",
        to: "01012345678",
        body: "should not persist",
      },
    });

    const adapter = new ExternalMessageKakaoAlimtalkAdapter(transport);
    registerExternalMessageAdapter(adapter);

    const result = await sendExternalMessageViaAdapter(baseKakaoPayload);
    expect(result.status).toBe("SENT");
    expect(result.provider).toBe("KAKAO_ALIMTALK");
    expect(result.providerMessageId).toBe("kakao-msg-88");
    expect(result.safeSummary.recipientMasked).not.toBe("01012345678");
    expect(isExternalMessageProviderResultRedacted(result)).toBe(true);
  });

  it("maps KAKAO channel to KAKAO_ALIMTALK delivery channel for logs", () => {
    expect(mapExternalMessageChannelToDeliveryChannel("KAKAO")).toBe("KAKAO_ALIMTALK");
    expect(mapExternalMessageChannelToDeliveryChannel("EMAIL")).toBe("EMAIL");
  });

  it("records ExternalMessageLog SENT with redacted payload summary", async () => {
    const result = {
      status: "SENT" as const,
      provider: "KAKAO_ALIMTALK" as const,
      channel: "KAKAO" as const,
      retryable: false,
      redeliveryEligible: false,
      safeSummary: {
        templateKey: "CLIENT_DOC_SHARE_V1",
        recipientMasked: "010****5678",
        portalPath: "/client/cases/c1",
      },
      rawProviderResponseRedacted: { messageId: "kakao-msg-88" },
    };

    await recordExternalMessageAdapterResult({
      caseId: baseKakaoPayload.caseId!,
      recipientUserId: baseKakaoPayload.recipientUserId!,
      deliveryId: "delivery-kakao-1",
      payload: baseKakaoPayload,
      result,
    });

    expect(createExternalMessageLogRow).toHaveBeenCalledOnce();
    const call = vi.mocked(createExternalMessageLogRow).mock.calls[0][0];
    expect(call.status).toBe("SENT");
    expect(call.channel).toBe("KAKAO_ALIMTALK");
    expect(call.provider).toBe("KAKAO_ALIMTALK");
    expect(call.payloadSummaryJson.metadataOnly).toBe(true);

    for (const key of EXTERNAL_MESSAGE_REDELIVERY_SAFE_PAYLOAD_KEYS) {
      if (key in call.payloadSummaryJson) {
        expect(call.payloadSummaryJson[key]).toBeDefined();
      }
    }
  });

  it("19-B redaction regression on kakao log payload summary", () => {
    const summary = redactExternalMessagePayload({
      noticeBody: "민감 알림톡 본문",
      portalPath: "/client/cases/c1",
      metadataOnly: true,
      recipientPhone: "01012345678",
    }) as Record<string, unknown>;

    expect(summary.noticeBody).toContain("REDACTED");
    expect(summary.portalPath).toBe("/client/cases/c1");
    expect(summary.recipientPhone).toContain("REDACTED");
  });

  it("18-B redelivery flags remain compatible for retryable Kakao errors", () => {
    expect(mapProviderResultToExternalMessageLogStatus("FAILED")).toBe("FAILED");
    const err = {
      code: "RATE_LIMITED" as const,
      retryable: true,
      autoRetryAllowed: false,
      redeliveryEligible: true,
      safeMessage: "Kakao rate limited",
    };
    expect(isRedeliveryEligibleError(err)).toBe(true);
  });
});
