import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPostDeployPromoEntitlementOverride,
  getPostDeployPromoWindowStatus,
  isAccountStatusLoginAllowed,
  isPostDeployPromoWindowActive,
  POST_DEPLOY_PROMO_WINDOW_DEFAULT_START_ISO,
  resolveLawyerVerificationApprovedForAuth,
} from "./post-deploy-promo-window.policy";

describe("post-deploy-promo-window", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    delete process.env.AIBEOPCHIN_POST_DEPLOY_PROMO_DISABLED;
    process.env.AIBEOPCHIN_POST_DEPLOY_PROMO_START_ISO = POST_DEPLOY_PROMO_WINDOW_DEFAULT_START_ISO;
    process.env.AIBEOPCHIN_POST_DEPLOY_PROMO_DAYS = "30";
  });

  afterEach(() => {
    process.env = { ...envBackup };
    vi.useRealTimers();
  });

  it("is active within 30 days after deploy start", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T12:00:00.000Z"));
    expect(isPostDeployPromoWindowActive()).toBe(true);
    expect(getPostDeployPromoWindowStatus().remainingDays).toBeGreaterThan(0);
  });

  it("is inactive after window ends", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-01T00:00:00.000Z"));
    expect(isPostDeployPromoWindowActive()).toBe(false);
  });

  it("allows pending account login during promo", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T12:00:00.000Z"));
    expect(isAccountStatusLoginAllowed("PENDING")).toBe(true);
  });

  it("bypasses lawyer verification during promo", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T12:00:00.000Z"));
    expect(
      resolveLawyerVerificationApprovedForAuth({
        role: "LAWYER",
        verificationStatus: "PENDING",
      }),
    ).toBe(true);
  });

  it("upgrades entitlements to enterprise during promo", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T12:00:00.000Z"));
    const overridden = applyPostDeployPromoEntitlementOverride({
      tenantId: "tenant-1",
      tier: "FREE",
      status: "PAST_DUE",
      limits: {
        maxSeats: 2,
        maxActiveCases: 5,
        monthlyAiTokenBudget: 10_000,
        maxLlmCallsPerCase: 3,
      },
      features: {
        AI_CASE_SUMMARY: true,
        AI_CASE_INTELLIGENCE_GRAPH: false,
        AI_CONTRADICTION_RADAR: false,
        AI_LAWYER_JUDGMENT_LEDGER: false,
        AI_DOCUMENT_PARAGRAPH: false,
        EXTERNAL_MESSAGING_EMAIL: true,
        EXTERNAL_MESSAGING_KAKAO: false,
        CLIENT_PORTAL_MOBILE: true,
        CLIENT_PORTAL_PWA: false,
        CLIENT_PORTAL_PUSH: false,
      },
    });

    expect(overridden.tier).toBe("ENTERPRISE");
    expect(overridden.status).toBe("ACTIVE");
    expect(overridden.features.CLIENT_PORTAL_PUSH).toBe(true);
  });
});
