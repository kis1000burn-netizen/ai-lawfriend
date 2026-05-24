import { describe, expect, it } from "vitest";
import {
  buildClientPortalPushPayload,
  CLIENT_PORTAL_PUSH_FORBIDDEN_PAYLOAD_KEYS,
  evaluateClientPortalWebPushConsent,
  isClientPortalWebPushLiveSendEnabled,
  assertClientPortalPushPayloadSafe,
} from "./client-portal-push-notification.policy";

describe("client-portal-push-notification.policy (Phase 21-D)", () => {
  it("builds secure-link centered push payload without forbidden keys", () => {
    const payload = buildClientPortalPushPayload({
      caseId: "case-1",
      surface: "SUPPLEMENT_REQUEST",
      portalPath: "/client/cases/case-1?tab=supplement",
      entityId: "req-1",
    });

    expect(payload.url).toBe("/client/cases/case-1?tab=supplement");
    expect(payload.metadataOnly).toBe(true);
    expect(payload.body).not.toContain("첨부");
    expect(() => assertClientPortalPushPayloadSafe(payload)).not.toThrow();
  });

  it("denies push when consent or permission missing", () => {
    expect(
      evaluateClientPortalWebPushConsent({ webPushOptIn: false, permission: "granted" }).allowed,
    ).toBe(false);
    expect(
      evaluateClientPortalWebPushConsent({ webPushOptIn: true, permission: "denied" }).allowed,
    ).toBe(false);
    expect(
      evaluateClientPortalWebPushConsent({ webPushOptIn: true, permission: "granted" }).allowed,
    ).toBe(true);
  });

  it("keeps live send OFF by default", () => {
    const previous = process.env.CLIENT_PORTAL_WEB_PUSH_LIVE_SEND;
    delete process.env.CLIENT_PORTAL_WEB_PUSH_LIVE_SEND;
    expect(isClientPortalWebPushLiveSendEnabled()).toBe(false);
    process.env.CLIENT_PORTAL_WEB_PUSH_LIVE_SEND = "true";
    expect(isClientPortalWebPushLiveSendEnabled()).toBe(true);
    if (previous === undefined) {
      delete process.env.CLIENT_PORTAL_WEB_PUSH_LIVE_SEND;
    } else {
      process.env.CLIENT_PORTAL_WEB_PUSH_LIVE_SEND = previous;
    }
  });

  it("blocks forbidden payload keys", () => {
    expect(CLIENT_PORTAL_PUSH_FORBIDDEN_PAYLOAD_KEYS).toContain("documentBody");
    expect(() =>
      assertClientPortalPushPayloadSafe({
        title: "t",
        body: "b",
        url: "/client/cases/c1",
        documentBody: "secret",
      }),
    ).toThrow(/PUSH_PAYLOAD_FORBIDDEN_KEY/);
  });
});
