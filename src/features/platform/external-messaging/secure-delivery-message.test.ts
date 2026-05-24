import { describe, expect, it } from "vitest";
import {
  buildSecureDeliveryExternalPayload,
  buildSecureDeliveryIdempotencyKey,
  buildSecureDeliveryPortalPath,
  SECURE_DELIVERY_TEMPLATE_BY_SURFACE,
} from "./secure-delivery-message-builder";
import {
  assertSecurePortalLinkRequired,
  evaluateSecureDeliveryConsentForChannel,
  SECURE_DELIVERY_FORBIDDEN_MESSAGE_CONTENT,
} from "./secure-delivery-message-policy";
import { evaluateSecureDeliveryRedeliveryEligibility } from "./secure-delivery-message.service";
import { redactExternalMessagePayload } from "@/lib/data-governance/data-redaction.service";

describe("secure delivery message (Phase 20-E)", () => {
  const basePrefs = {
    kakaoOptIn: true,
    emailOptIn: true,
    documentShareNoticeEnabled: true,
    litigationDeadlineReminderEnabled: true,
  };

  it("maps surface to template keys", () => {
    expect(SECURE_DELIVERY_TEMPLATE_BY_SURFACE.DOCUMENT_DELIVERY).toBe("CLIENT_DOC_SHARE_V1");
    expect(SECURE_DELIVERY_TEMPLATE_BY_SURFACE.SUPPLEMENT_REQUEST).toBe("SUPPLEMENT_REQUEST_V1");
    expect(SECURE_DELIVERY_TEMPLATE_BY_SURFACE.COURT_DEADLINE_REMINDER).toBe(
      "COURT_DEADLINE_REMINDER_V1",
    );
    expect(SECURE_DELIVERY_TEMPLATE_BY_SURFACE.CLIENT_PORTAL_MESSAGE).toBe(
      "CLIENT_PORTAL_MESSAGE_V1",
    );
  });

  it("builds secure portal paths only (no attachment content)", () => {
    expect(
      buildSecureDeliveryPortalPath({
        caseId: "case-1",
        surface: "DOCUMENT_DELIVERY",
        entityId: "share-1",
      }),
    ).toBe("/client/cases/case-1?tab=shared&share=share-1");
    expect(
      buildSecureDeliveryPortalPath({
        caseId: "case-1",
        surface: "SUPPLEMENT_REQUEST",
      }),
    ).toBe("/client/cases/case-1?tab=supplement");
  });

  it("requires secure portal link", () => {
    expect(assertSecurePortalLinkRequired(undefined)).toEqual({
      allowed: false,
      reason: "SAFE_LINK_REQUIRED",
    });
    expect(assertSecurePortalLinkRequired("/client/cases/c1?tab=shared")).toEqual({
      allowed: true,
    });
  });

  it("enforces consent gate per channel and surface", () => {
    expect(
      evaluateSecureDeliveryConsentForChannel("EMAIL", basePrefs, "DOCUMENT_DELIVERY"),
    ).toEqual({ allowed: true });

    expect(
      evaluateSecureDeliveryConsentForChannel(
        "KAKAO_ALIMTALK",
        { ...basePrefs, kakaoOptIn: false },
        "SUPPLEMENT_REQUEST",
      ),
    ).toEqual({ allowed: false, reason: "카카오 알림톡 미동의" });

    expect(
      evaluateSecureDeliveryConsentForChannel(
        "EMAIL",
        { ...basePrefs, litigationDeadlineReminderEnabled: false },
        "COURT_DEADLINE_REMINDER",
      ),
    ).toEqual({ allowed: false, reason: "의뢰인 기일 알림 수신 거부" });
  });

  it("builds metadata-only payload with safeLink and idempotency", () => {
    const payload = buildSecureDeliveryExternalPayload({
      surface: "CLIENT_PORTAL_MESSAGE",
      channel: "EMAIL",
      caseId: "case-1",
      recipientUserId: "user-1",
      recipient: { email: "client@example.com" },
      portalPath: "/client/cases/case-1?tab=messages",
      entityId: "msg-1",
      consentVerified: true,
    });

    expect(payload.safeLink?.portalPath).toBe("/client/cases/case-1?tab=messages");
    expect(payload.template.templateKey).toBe("CLIENT_PORTAL_MESSAGE_V1");
    expect(payload.metadata.idempotencyKey).toBe(
      buildSecureDeliveryIdempotencyKey({
        surface: "CLIENT_PORTAL_MESSAGE",
        caseId: "case-1",
        channel: "EMAIL",
        entityId: "msg-1",
      }),
    );
    expect(payload.metadata.consentVerified).toBe(true);
  });

  it("forbids document body fields in policy seal", () => {
    expect(SECURE_DELIVERY_FORBIDDEN_MESSAGE_CONTENT).toContain("documentBody");
    expect(SECURE_DELIVERY_FORBIDDEN_MESSAGE_CONTENT).toContain("attachment");
  });

  it("applies 19-B redaction to payload summary", () => {
    const redacted = redactExternalMessagePayload({
      metadataOnly: true,
      portalPath: "/client/cases/c1?tab=shared",
      surface: "DOCUMENT_DELIVERY",
      channel: "EMAIL",
    });
    expect(redacted).not.toHaveProperty("documentBody");
    expect(redacted).toHaveProperty("portalPath");
  });

  it("evaluates 18-B redelivery eligibility for failed delivery", () => {
    const result = evaluateSecureDeliveryRedeliveryEligibility({
      logStatus: "FAILED",
      channel: "EMAIL",
      failureReason: "provider timeout",
    });
    expect(typeof result.retryable).toBe("boolean");
  });
});
