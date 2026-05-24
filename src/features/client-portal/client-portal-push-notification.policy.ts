/**
 * Product Phase 21-D — Client portal push notification surface policy.
 */
import type { ExternalMessageSendSurface } from "@/features/platform/external-messaging/external-message-adapter.schema";
import { SECURE_DELIVERY_NOTICE_BY_SURFACE } from "@/features/platform/external-messaging/secure-delivery-message-builder";
import { SECURE_DELIVERY_FORBIDDEN_MESSAGE_CONTENT } from "@/features/platform/external-messaging/secure-delivery-message-policy";

export const CLIENT_PORTAL_PUSH_NOTIFICATION_POLICY_MARKER_PHASE21D =
  "phase21d-client-portal-push-notification-surface" as const;

export const CLIENT_PORTAL_PUSH_VAPID_PUBLIC_KEY_ENV = "CLIENT_PORTAL_VAPID_PUBLIC_KEY" as const;

export const CLIENT_PORTAL_WEB_PUSH_LIVE_SEND_ENV = "CLIENT_PORTAL_WEB_PUSH_LIVE_SEND" as const;

export const CLIENT_PORTAL_PUSH_SURFACE_FF = "NEXT_PUBLIC_FF_CLIENT_PORTAL_PUSH_SURFACE" as const;

export const CLIENT_PORTAL_PUSH_FORBIDDEN_PAYLOAD_KEYS = [
  ...SECURE_DELIVERY_FORBIDDEN_MESSAGE_CONTENT,
  "documentTitle",
  "legalBody",
  "messageBody",
  "attachmentName",
  "fileName",
  "recipientEmail",
  "recipientPhone",
] as const;

export type ClientPortalNotificationPermissionState =
  | "unsupported"
  | "default"
  | "granted"
  | "denied";

export type ClientPortalPushPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
  caseId: string;
  surface: ExternalMessageSendSurface;
  metadataOnly: true;
};

export type ClientPortalPushDispatchResult =
  | { status: "SKIPPED_LIVE_SEND_OFF" }
  | { status: "SKIPPED_NO_CONSENT" }
  | { status: "SKIPPED_NO_SUBSCRIPTION" }
  | { status: "PREPARED"; payload: ClientPortalPushPayload; subscriptionCount: number };

export function isClientPortalPushSurfaceEnabled(): boolean {
  if (typeof process !== "undefined" && process.env[CLIENT_PORTAL_PUSH_SURFACE_FF] === "false") {
    return false;
  }
  return true;
}

/** Real web-push send remains OFF unless explicitly enabled in server env. */
export function isClientPortalWebPushLiveSendEnabled(): boolean {
  return process.env[CLIENT_PORTAL_WEB_PUSH_LIVE_SEND_ENV] === "true";
}

export function resolveClientPortalNotificationPermissionState(): ClientPortalNotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  const permission = Notification.permission;
  if (permission === "granted" || permission === "denied" || permission === "default") {
    return permission;
  }
  return "default";
}

export function evaluateClientPortalWebPushConsent(input: {
  webPushOptIn: boolean;
  permission: ClientPortalNotificationPermissionState;
}): { allowed: true } | { allowed: false; reason: string } {
  if (!input.webPushOptIn) {
    return { allowed: false, reason: "웹 푸시 알림 미동의" };
  }
  if (input.permission !== "granted") {
    return { allowed: false, reason: "브라우저 알림 권한 미허용" };
  }
  return { allowed: true };
}

export function buildClientPortalPushPayload(input: {
  caseId: string;
  surface: ExternalMessageSendSurface;
  portalPath: string;
  entityId: string;
}): ClientPortalPushPayload {
  const notice = SECURE_DELIVERY_NOTICE_BY_SURFACE[input.surface];
  const body = notice.replace(/^\[AI법친\]\s*/, "").slice(0, 180);

  return {
    title: "AI법친 의뢰인 포털",
    body,
    url: input.portalPath,
    tag: `aibeopchin-${input.surface}-${input.entityId}`.slice(0, 120),
    caseId: input.caseId,
    surface: input.surface,
    metadataOnly: true,
  };
}

export function assertClientPortalPushPayloadSafe(payload: Record<string, unknown>): void {
  for (const key of CLIENT_PORTAL_PUSH_FORBIDDEN_PAYLOAD_KEYS) {
    if (key in payload && payload[key] != null) {
      throw new Error(`PUSH_PAYLOAD_FORBIDDEN_KEY:${key}`);
    }
  }
  if (!payload.url || typeof payload.url !== "string" || !payload.url.startsWith("/client/")) {
    throw new Error("PUSH_PAYLOAD_REQUIRES_SECURE_PORTAL_LINK");
  }
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function resolveClientPortalVapidPublicKey(): string | null {
  const key = process.env[CLIENT_PORTAL_PUSH_VAPID_PUBLIC_KEY_ENV]?.trim();
  return key || null;
}
