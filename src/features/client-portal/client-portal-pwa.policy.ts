/**
 * Product Phase 21-C — Client portal PWA policy (manifest · cache denylist · restore).
 */
import type { ClientPortalMobileTabKey } from "./client-portal-mobile.policy";
import { normalizeClientPortalMobileTab } from "./client-portal-mobile.policy";

export const CLIENT_PORTAL_PWA_POLICY_MARKER_PHASE21C =
  "phase21c-client-portal-pwa-install" as const;

export const CLIENT_PORTAL_PWA_MANIFEST_PATH = "/manifest.webmanifest" as const;

export const CLIENT_PORTAL_PWA_SERVICE_WORKER_PATH = "/client/sw.js" as const;

export const CLIENT_PORTAL_PWA_SCOPE = "/client/" as const;

export const CLIENT_PORTAL_PWA_START_URL = "/client/cases?source=pwa" as const;

export const CLIENT_PORTAL_PWA_OFFLINE_PATH = "/client/offline" as const;

export const CLIENT_PORTAL_PWA_APP_NAME = "AI법친 의뢰인 포털" as const;

export const CLIENT_PORTAL_PWA_SHORT_NAME = "AI법친" as const;

export const CLIENT_PORTAL_PWA_THEME_COLOR = "#312e81" as const;

export const CLIENT_PORTAL_PWA_BACKGROUND_COLOR = "#eef2ff" as const;

export const CLIENT_PORTAL_PWA_ICON_PATH = "/pwa/client-portal-icon.svg" as const;

export const CLIENT_PORTAL_PWA_LAST_VISIT_STORAGE_KEY =
  "aibeopchin.clientPortal.lastVisit.v1" as const;

/** Never cache API, uploads, shared docs, attachments, or auth. */
export const CLIENT_PORTAL_PWA_CACHE_DENYLIST = [
  "/api/",
  "/login",
  "/client/cases/",
  "files/upload",
  "shared-documents",
  "supplement-requests",
  "submissions",
  "messages",
  "deadlines",
  "document",
  "attachment",
  "push-subscriptions",
  "notification-preferences",
  "notifications",
] as const;

export const CLIENT_PORTAL_PWA_SHELL_CACHE_URLS = [
  CLIENT_PORTAL_PWA_OFFLINE_PATH,
  CLIENT_PORTAL_PWA_MANIFEST_PATH,
  CLIENT_PORTAL_PWA_ICON_PATH,
] as const;

export type ClientPortalLastVisit = {
  caseId: string;
  tab: ClientPortalMobileTabKey;
  updatedAt: string;
};

export function isClientPortalPathCacheDenied(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  return CLIENT_PORTAL_PWA_CACHE_DENYLIST.some((term) => lower.includes(term.toLowerCase()));
}

export function buildClientPortalRestorePath(last: ClientPortalLastVisit): string {
  const params = new URLSearchParams({ tab: last.tab, source: "pwa-restore" });
  return `/client/cases/${last.caseId}?${params.toString()}`;
}

export function parseClientPortalLastVisit(raw: string | null): ClientPortalLastVisit | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ClientPortalLastVisit>;
    if (!parsed.caseId || !parsed.tab) return null;
    const tab = normalizeClientPortalMobileTab(parsed.tab);
    if (!tab) return null;
    return {
      caseId: parsed.caseId,
      tab,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveClientPortalLastVisit(input: {
  caseId: string;
  tab: ClientPortalMobileTabKey;
}): void {
  if (typeof window === "undefined") return;
  const payload: ClientPortalLastVisit = {
    caseId: input.caseId,
    tab: input.tab,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(
    CLIENT_PORTAL_PWA_LAST_VISIT_STORAGE_KEY,
    JSON.stringify(payload),
  );
}

export function readClientPortalLastVisit(): ClientPortalLastVisit | null {
  if (typeof window === "undefined") return null;
  return parseClientPortalLastVisit(
    window.localStorage.getItem(CLIENT_PORTAL_PWA_LAST_VISIT_STORAGE_KEY),
  );
}

export function isPwaStandaloneDisplayMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function shouldRestoreClientPortalFromPwaLaunch(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.get("source") === "pwa" || params.get("source") === "pwa-restore";
}
