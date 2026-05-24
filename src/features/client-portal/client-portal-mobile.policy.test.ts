import { describe, expect, it } from "vitest";
import {
  CLIENT_PORTAL_MOBILE_BOTTOM_NAV_TABS,
  CLIENT_PORTAL_NOTIFICATION_TAB_ALIASES,
  CLIENT_PORTAL_SURFACE_TO_TAB,
  normalizeClientPortalMobileTab,
  resolveClientPortalMobileDeepLink,
} from "./client-portal-mobile.policy";

describe("client-portal-mobile.policy (Phase 21-A)", () => {
  it("maps Phase 20 notification tab aliases to UI tabs", () => {
    expect(CLIENT_PORTAL_NOTIFICATION_TAB_ALIASES.supplement).toBe("supplements");
    expect(CLIENT_PORTAL_NOTIFICATION_TAB_ALIASES.messages).toBe("chat");
    expect(CLIENT_PORTAL_NOTIFICATION_TAB_ALIASES.deadlines).toBe("deadlines");
  });

  it("maps secure delivery surfaces to portal tabs", () => {
    expect(CLIENT_PORTAL_SURFACE_TO_TAB.DOCUMENT_DELIVERY).toBe("shared");
    expect(CLIENT_PORTAL_SURFACE_TO_TAB.SUPPLEMENT_REQUEST).toBe("supplements");
    expect(CLIENT_PORTAL_SURFACE_TO_TAB.COURT_DEADLINE_REMINDER).toBe("deadlines");
    expect(CLIENT_PORTAL_SURFACE_TO_TAB.CLIENT_PORTAL_MESSAGE).toBe("chat");
  });

  it("resolves share deep link to shared tab", () => {
    expect(
      resolveClientPortalMobileDeepLink({ tab: "shared", share: "share-123" }),
    ).toEqual({
      tab: "shared",
      shareId: "share-123",
      matchedAlias: "shared",
    });
  });

  it("normalizes direct UI tab keys", () => {
    expect(normalizeClientPortalMobileTab("chat")).toBe("chat");
    expect(normalizeClientPortalMobileTab("supplements")).toBe("supplements");
  });

  it("defaults to supplements when tab is missing", () => {
    expect(resolveClientPortalMobileDeepLink({})).toEqual({
      tab: "supplements",
      shareId: null,
      matchedAlias: undefined,
    });
  });

  it("defines five bottom-nav primary tabs", () => {
    expect(CLIENT_PORTAL_MOBILE_BOTTOM_NAV_TABS).toEqual([
      "supplements",
      "uploads",
      "shared",
      "chat",
      "deadlines",
    ]);
  });
});
