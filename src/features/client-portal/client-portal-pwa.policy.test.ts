import { describe, expect, it } from "vitest";
import {
  buildClientPortalRestorePath,
  CLIENT_PORTAL_PWA_CACHE_DENYLIST,
  CLIENT_PORTAL_PWA_OFFLINE_PATH,
  CLIENT_PORTAL_PWA_SERVICE_WORKER_PATH,
  CLIENT_PORTAL_PWA_SHELL_CACHE_URLS,
  CLIENT_PORTAL_PWA_START_URL,
  isClientPortalPathCacheDenied,
  parseClientPortalLastVisit,
  shouldRestoreClientPortalFromPwaLaunch,
} from "./client-portal-pwa.policy";

describe("client-portal-pwa.policy (Phase 21-C)", () => {
  it("defines manifest, service worker, and home screen launch URL", () => {
    expect(CLIENT_PORTAL_PWA_START_URL).toContain("/client/cases");
    expect(CLIENT_PORTAL_PWA_SERVICE_WORKER_PATH).toBe("/client/sw.js");
    expect(CLIENT_PORTAL_PWA_OFFLINE_PATH).toBe("/client/offline");
  });

  it("denies cache for API, uploads, and case detail paths", () => {
    expect(isClientPortalPathCacheDenied("/api/client/cases/c1")).toBe(true);
    expect(isClientPortalPathCacheDenied("/client/cases/c1/files/upload")).toBe(true);
    expect(isClientPortalPathCacheDenied("/client/cases/c1/shared-documents/x")).toBe(true);
    expect(isClientPortalPathCacheDenied("/client/offline")).toBe(false);
    expect(CLIENT_PORTAL_PWA_CACHE_DENYLIST).toContain("/api/");
    expect(CLIENT_PORTAL_PWA_CACHE_DENYLIST).toContain("shared-documents");
  });

  it("shell cache includes offline page and manifest only", () => {
    expect(CLIENT_PORTAL_PWA_SHELL_CACHE_URLS).toContain("/client/offline");
    expect(CLIENT_PORTAL_PWA_SHELL_CACHE_URLS).toContain("/manifest.webmanifest");
    expect(CLIENT_PORTAL_PWA_SHELL_CACHE_URLS.some((url) => url.includes("/api/"))).toBe(false);
  });

  it("builds restore path with tab query", () => {
    expect(
      buildClientPortalRestorePath({
        caseId: "case-1",
        tab: "chat",
        updatedAt: "2026-05-24T00:00:00.000Z",
      }),
    ).toBe("/client/cases/case-1?tab=chat&source=pwa-restore");
  });

  it("parses last visit from storage JSON", () => {
    const parsed = parseClientPortalLastVisit(
      JSON.stringify({ caseId: "case-1", tab: "supplements", updatedAt: "t" }),
    );
    expect(parsed?.caseId).toBe("case-1");
    expect(parsed?.tab).toBe("supplements");
  });

  it("detects PWA launch restore query", () => {
    expect(shouldRestoreClientPortalFromPwaLaunch("?source=pwa")).toBe(true);
    expect(shouldRestoreClientPortalFromPwaLaunch("?source=email")).toBe(false);
  });
});
