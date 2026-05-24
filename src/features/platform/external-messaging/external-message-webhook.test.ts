import { afterEach, describe, expect, it, vi } from "vitest";
import {
  EXTERNAL_MESSAGE_PROVIDER_DELIVERY_STATUSES,
  parseEmailWebhookEvents,
  parseKakaoWebhookEvents,
} from "./external-message-webhook.schema";
import {
  computeExternalMessageWebhookSignature,
  verifyExternalMessageWebhookSignature,
} from "./external-message-webhook-signature";
import {
  isWebhookFailureStatus,
  mapProviderWebhookStatus,
} from "./external-message-webhook-status-mapper";
import {
  isWebhookEventAlreadyProcessed,
  mergeWebhookSafePayloadSummary,
  processExternalMessageWebhookEvent,
  reevaluateExternalMessageRedeliveryAfterWebhook,
} from "./external-message-webhook.service";
import { redactExternalMessagePayload } from "@/lib/data-governance/data-redaction.service";

vi.mock("@/lib/audit-log", () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/features/secure-document-delivery/secure-document-delivery.repository", () => ({
  findExternalMessageLogByProviderMessageId: vi.fn(),
  updateExternalMessageLogRow: vi.fn().mockResolvedValue({ id: "log-1" }),
  updateDeliveryStatus: vi.fn().mockResolvedValue(undefined),
  markDeliveryViewed: vi.fn().mockResolvedValue(undefined),
}));

import {
  findExternalMessageLogByProviderMessageId,
  updateExternalMessageLogRow,
  updateDeliveryStatus,
} from "@/features/secure-document-delivery/secure-document-delivery.repository";

const baseLog = {
  id: "log-1",
  caseId: "clh3vkg8b0000qzrmn8311i4",
  recipientUserId: "clh3vkg8b0000qzrmn8311i5",
  deliveryId: "delivery-1",
  channel: "EMAIL" as const,
  provider: "SENDGRID",
  templateCode: "CLIENT_DOC_SHARE_V1",
  payloadSummaryJson: {
    metadataOnly: true,
    providerMessageId: "msg-provider-1",
    portalPath: "/client/cases/c1",
  },
  status: "SENT" as const,
  failureReason: null,
  sentAt: new Date("2026-05-24T10:00:00.000Z"),
  delivery: {
    id: "delivery-1",
    deliveryStatus: "PENDING" as const,
    deliveryChannel: "EMAIL" as const,
    sharedDocumentId: "share-1",
  },
};

describe("external message webhook (Phase 20-D)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("defines provider delivery statuses", () => {
    expect(EXTERNAL_MESSAGE_PROVIDER_DELIVERY_STATUSES).toContain("DELIVERED");
    expect(EXTERNAL_MESSAGE_PROVIDER_DELIVERY_STATUSES).toContain("BOUNCED");
    expect(EXTERNAL_MESSAGE_PROVIDER_DELIVERY_STATUSES).toContain("READ");
  });

  it("verifies webhook signature", () => {
    const secret = "test-email-webhook-secret";
    const rawBody = JSON.stringify({ messageId: "msg-provider-1", event: "delivered" });
    const signature = computeExternalMessageWebhookSignature(secret, rawBody);

    expect(
      verifyExternalMessageWebhookSignature({
        provider: "email",
        rawBody,
        signatureHeader: signature,
        secret,
      }),
    ).toBe(true);
  });

  it("parses email webhook metadata without raw recipient fields", () => {
    const events = parseEmailWebhookEvents([
      {
        sg_message_id: "msg-provider-1",
        sg_event_id: "evt-email-1",
        event: "delivered",
        timestamp: 1_718_000_000,
      },
    ]);
    expect(events).toHaveLength(1);
    expect(events[0]?.providerStatus).toBe("DELIVERED");
    expect(events[0]?.providerMessageId).toBe("msg-provider-1");
  });

  it("parses kakao webhook metadata", () => {
    const events = parseKakaoWebhookEvents({
      messageId: "kakao-msg-1",
      eventId: "evt-kakao-1",
      status: "SUCCESS",
    });
    expect(events[0]?.providerStatus).toBe("DELIVERED");
    expect(events[0]?.provider).toBe("KAKAO_ALIMTALK");
  });

  it("maps provider statuses to ExternalMessageLog and delivery prep", () => {
    expect(mapProviderWebhookStatus("DELIVERED").externalMessageStatus).toBe("SENT");
    expect(mapProviderWebhookStatus("BOUNCED").externalMessageStatus).toBe("FAILED");
    expect(mapProviderWebhookStatus("READ").deliveryStatusPrep).toBe("VIEWED");
    expect(isWebhookFailureStatus("REJECTED")).toBe(true);
  });

  it("tracks providerEventId idempotency in payload summary", () => {
    expect(
      isWebhookEventAlreadyProcessed(
        { processedWebhookEventIds: ["evt-1"] },
        "evt-1",
      ),
    ).toBe(true);

    const merged = mergeWebhookSafePayloadSummary(baseLog.payloadSummaryJson, {
      providerStatus: "DELIVERED",
      providerEventId: "evt-2",
      redeliveryEligible: false,
    });
    expect(merged.metadataOnly).toBe(true);
    expect(merged.processedWebhookEventIds).toContain("evt-2");
    expect(JSON.stringify(merged)).not.toContain("@");
  });

  it("processes webhook and updates ExternalMessageLog without raw payload", async () => {
    vi.mocked(findExternalMessageLogByProviderMessageId).mockResolvedValue(baseLog as never);

    const result = await processExternalMessageWebhookEvent(
      {
        provider: "EMAIL",
        providerMessageId: "msg-provider-1",
        providerEventId: "evt-email-2",
        providerStatus: "DELIVERED",
      },
      { auditActorUserId: "clh3vkg8b0000qzrmn8311i6" },
    );

    expect(result.duplicate).toBe(false);
    expect(result.mappedExternalMessageStatus).toBe("SENT");
    expect(updateExternalMessageLogRow).toHaveBeenCalledOnce();
    expect(updateDeliveryStatus).toHaveBeenCalledOnce();

    const updateArg = vi.mocked(updateExternalMessageLogRow).mock.calls[0][1];
    expect(updateArg.payloadSummaryJson).toBeTruthy();
    expect(JSON.stringify(updateArg.payloadSummaryJson)).not.toContain("client@");
  });

  it("skips duplicate providerEventId", async () => {
    vi.mocked(findExternalMessageLogByProviderMessageId).mockResolvedValue({
      ...baseLog,
      payloadSummaryJson: {
        ...baseLog.payloadSummaryJson,
        processedWebhookEventIds: ["evt-dup"],
      },
    } as never);

    const result = await processExternalMessageWebhookEvent({
      provider: "EMAIL",
      providerMessageId: "msg-provider-1",
      providerEventId: "evt-dup",
      providerStatus: "DELIVERED",
    });

    expect(result.duplicate).toBe(true);
    expect(updateExternalMessageLogRow).not.toHaveBeenCalled();
  });

  it("19-B redaction regression on webhook payload merge", () => {
    const out = redactExternalMessagePayload({
      noticeBody: "민감 webhook 본문",
      metadataOnly: true,
      recipientEmail: "client@example.com",
    }) as Record<string, unknown>;
    expect(out.noticeBody).toContain("REDACTED");
    expect(out.recipientEmail).toContain("REDACTED");
  });

  it("18-B redelivery eligibility re-evaluates after BOUNCED webhook", () => {
    const policy = reevaluateExternalMessageRedeliveryAfterWebhook({
      logStatus: "FAILED",
      channel: "EMAIL",
      failureReason: "BOUNCED",
      deliveryStatus: "FAILED",
      hasSuccessfulSibling: false,
      hasInFlightRedelivery: false,
    });
    expect(policy.autoRetryAllowed).toBe(false);
    expect(policy.retryable).toBe(true);
  });
});
