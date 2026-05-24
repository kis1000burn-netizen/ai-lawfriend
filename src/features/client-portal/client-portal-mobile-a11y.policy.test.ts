import { describe, expect, it } from "vitest";
import {
  assertClientPortalSensitiveCacheDenylistRegression,
  CLIENT_PORTAL_MOBILE_MIN_TOUCH_TARGET_PX,
  CLIENT_PORTAL_MOBILE_SLOW_UPLOAD_THRESHOLD_MS,
  shouldShowClientPortalSlowUploadHint,
} from "./client-portal-mobile-a11y.policy";

describe("client-portal-mobile-a11y.policy (Phase 21-E)", () => {
  it("defines minimum touch target for mobile smoke", () => {
    expect(CLIENT_PORTAL_MOBILE_MIN_TOUCH_TARGET_PX).toBeGreaterThanOrEqual(44);
  });

  it("shows slow upload hint after threshold while uploading", () => {
    expect(
      shouldShowClientPortalSlowUploadHint(true, CLIENT_PORTAL_MOBILE_SLOW_UPLOAD_THRESHOLD_MS),
    ).toBe(true);
    expect(shouldShowClientPortalSlowUploadHint(false, 5000)).toBe(false);
    expect(shouldShowClientPortalSlowUploadHint(true, 1000)).toBe(false);
  });

  it("keeps sensitive data cache denylist regression terms", () => {
    expect(() => assertClientPortalSensitiveCacheDenylistRegression()).not.toThrow();
  });
});
