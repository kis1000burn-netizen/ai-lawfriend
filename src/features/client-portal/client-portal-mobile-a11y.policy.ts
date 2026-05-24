/**
 * Product Phase 21-E — Mobile accessibility · low-end device smoke policy.
 */
import { CLIENT_PORTAL_PWA_CACHE_DENYLIST } from "./client-portal-pwa.policy";

export const CLIENT_PORTAL_MOBILE_A11Y_POLICY_MARKER_PHASE21E =
  "phase21e-client-mobile-a11y-smoke" as const;

export const CLIENT_PORTAL_MOBILE_MIN_TOUCH_TARGET_PX = 44 as const;

export const CLIENT_PORTAL_MOBILE_SLOW_UPLOAD_THRESHOLD_MS = 4000 as const;

export const CLIENT_PORTAL_MOBILE_SLOW_UPLOAD_MESSAGE =
  "네트워크가 느릴 수 있습니다. 업로드를 계속 진행 중입니다." as const;

export const CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700" as const;

export const CLIENT_PORTAL_MOBILE_TOUCH_TARGET_CLASS = "min-h-11 min-w-11" as const;

export const CLIENT_PORTAL_MOBILE_LOW_END_SMOKE_TEST_ID =
  "client-portal-low-end-smoke-shell" as const;

/** Core client flows covered by 21-E smoke. */
export const CLIENT_PORTAL_MOBILE_SMOKE_FLOWS = [
  "supplements",
  "uploads",
  "shared",
  "chat",
  "deadlines",
] as const;

export const CLIENT_PORTAL_MOBILE_SENSITIVE_CACHE_DENY_TERMS = [
  "/api/",
  "/client/cases/",
  "shared-documents",
  "messages",
  "attachment",
] as const;

export function shouldShowClientPortalSlowUploadHint(
  hasActiveUploads: boolean,
  elapsedMs: number,
): boolean {
  return hasActiveUploads && elapsedMs >= CLIENT_PORTAL_MOBILE_SLOW_UPLOAD_THRESHOLD_MS;
}

export function assertClientPortalSensitiveCacheDenylistRegression(): void {
  for (const term of CLIENT_PORTAL_MOBILE_SENSITIVE_CACHE_DENY_TERMS) {
    if (!CLIENT_PORTAL_PWA_CACHE_DENYLIST.some((entry) => entry.includes(term) || term.includes(entry))) {
      throw new Error(`Missing sensitive cache deny term: ${term}`);
    }
  }
}
