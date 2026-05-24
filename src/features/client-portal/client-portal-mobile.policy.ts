/**
 * Product Phase 21-A — Mobile client portal baseline (tab SSOT · notification deep-link aliases).
 */
import type { ExternalMessageSendSurface } from "@/features/platform/external-messaging/external-message-adapter.schema";

export const CLIENT_MOBILE_PORTAL_POLICY_MARKER_PHASE21A =
  "phase21a-client-mobile-portal-baseline" as const;

/** UI tab keys used by `ClientPortalClient`. */
export const CLIENT_PORTAL_MOBILE_TAB_KEYS = [
  "supplements",
  "uploads",
  "shared",
  "chat",
  "deadlines",
  "history",
] as const;

export type ClientPortalMobileTabKey = (typeof CLIENT_PORTAL_MOBILE_TAB_KEYS)[number];

/** Primary tabs shown in mobile bottom navigation (21-A). */
export const CLIENT_PORTAL_MOBILE_BOTTOM_NAV_TABS: ClientPortalMobileTabKey[] = [
  "supplements",
  "uploads",
  "shared",
  "chat",
  "deadlines",
];

/**
 * Phase 20 secure-delivery portal paths use short tab keys; map to UI tabs here.
 * @see secure-delivery-message-builder.ts `buildSecureDeliveryPortalPath`
 */
export const CLIENT_PORTAL_NOTIFICATION_TAB_ALIASES: Record<string, ClientPortalMobileTabKey> = {
  supplement: "supplements",
  supplements: "supplements",
  messages: "chat",
  message: "chat",
  chat: "chat",
  shared: "shared",
  share: "shared",
  deadlines: "deadlines",
  deadline: "deadlines",
  uploads: "uploads",
  upload: "uploads",
  history: "history",
};

export const CLIENT_PORTAL_SURFACE_TO_TAB: Record<
  Exclude<ExternalMessageSendSurface, "SYSTEM_NOTICE">,
  ClientPortalMobileTabKey
> = {
  DOCUMENT_DELIVERY: "shared",
  SUPPLEMENT_REQUEST: "supplements",
  COURT_DEADLINE_REMINDER: "deadlines",
  CLIENT_PORTAL_MESSAGE: "chat",
};

export type ClientPortalMobileDeepLinkInput = {
  tab?: string | null;
  share?: string | null;
};

export type ClientPortalMobileDeepLinkResolution = {
  tab: ClientPortalMobileTabKey;
  shareId: string | null;
  matchedAlias?: string;
};

export function normalizeClientPortalMobileTab(
  raw: string | null | undefined,
): ClientPortalMobileTabKey | null {
  if (!raw?.trim()) return null;
  const key = raw.trim().toLowerCase();
  if ((CLIENT_PORTAL_MOBILE_TAB_KEYS as readonly string[]).includes(key)) {
    return key as ClientPortalMobileTabKey;
  }
  return CLIENT_PORTAL_NOTIFICATION_TAB_ALIASES[key] ?? null;
}

export function resolveClientPortalMobileDeepLink(
  input: ClientPortalMobileDeepLinkInput,
): ClientPortalMobileDeepLinkResolution {
  const normalized = normalizeClientPortalMobileTab(input.tab);
  const tab = normalized ?? "supplements";
  const shareId = input.share?.trim() || null;

  if (shareId) {
    return {
      tab: "shared",
      shareId,
      matchedAlias: input.tab?.trim() || "share",
    };
  }

  return {
    tab,
    shareId: null,
    matchedAlias: input.tab?.trim() || undefined,
  };
}
