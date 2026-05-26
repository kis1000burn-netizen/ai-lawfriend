import type { LawyerVerificationStatus, UserStatus } from "@prisma/client";
import { resolveTenantEntitlementsFromPlan } from "@/features/platform/tenant-entitlement/tenant-plan.registry";
import type { ResolvedTenantEntitlements } from "@/features/platform/tenant-entitlement/tenant-plan.schema";

/**
 * 배포 후 체험·홍보 기간 SSOT.
 * 구독(플랜)·변호사 승인·계정 PENDING 게이트를 기간 내 완화한다.
 */
export const POST_DEPLOY_PROMO_WINDOW_MARKER = "post-deploy-promo-window-v1" as const;

/** 최초 상용 배포 기준일 — env 미설정 시 fallback */
export const POST_DEPLOY_PROMO_WINDOW_DEFAULT_START_ISO =
  "2026-05-24T00:00:00.000Z" as const;

export const POST_DEPLOY_PROMO_WINDOW_DEFAULT_DAYS = 30 as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseStartIso(raw: string | undefined): Date {
  const value = raw?.trim() || POST_DEPLOY_PROMO_WINDOW_DEFAULT_START_ISO;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid AIBEOPCHIN_POST_DEPLOY_PROMO_START_ISO");
  }
  return parsed;
}

function resolvePromoWindowDays(): number {
  const raw = process.env.AIBEOPCHIN_POST_DEPLOY_PROMO_DAYS?.trim();
  if (!raw) {
    return POST_DEPLOY_PROMO_WINDOW_DEFAULT_DAYS;
  }
  const days = Number(raw);
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error("AIBEOPCHIN_POST_DEPLOY_PROMO_DAYS must be an integer between 1 and 365.");
  }
  return days;
}

export function isPostDeployPromoWindowForceDisabled(): boolean {
  return process.env.AIBEOPCHIN_POST_DEPLOY_PROMO_DISABLED?.trim().toLowerCase() === "true";
}

export function getPostDeployPromoWindowStart(): Date {
  return parseStartIso(process.env.AIBEOPCHIN_POST_DEPLOY_PROMO_START_ISO);
}

export function getPostDeployPromoWindowEnd(): Date {
  const days = resolvePromoWindowDays();
  return new Date(getPostDeployPromoWindowStart().getTime() + days * MS_PER_DAY);
}

export function isPostDeployPromoWindowActive(at: Date = new Date()): boolean {
  if (isPostDeployPromoWindowForceDisabled()) {
    return false;
  }
  const start = getPostDeployPromoWindowStart();
  const end = getPostDeployPromoWindowEnd();
  return at.getTime() >= start.getTime() && at.getTime() < end.getTime();
}

export function getPostDeployPromoWindowStatus(at: Date = new Date()) {
  const start = getPostDeployPromoWindowStart();
  const end = getPostDeployPromoWindowEnd();
  const active = isPostDeployPromoWindowActive(at);
  const remainingMs = Math.max(0, end.getTime() - at.getTime());
  const remainingDays = active ? Math.ceil(remainingMs / MS_PER_DAY) : 0;

  return {
    marker: POST_DEPLOY_PROMO_WINDOW_MARKER,
    active,
    forceDisabled: isPostDeployPromoWindowForceDisabled(),
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    remainingDays,
  };
}

/** 체험 기간 — 관리자 계정 승인(PENDING) 없이 로그인 허용 */
export function isAccountStatusLoginAllowed(status: UserStatus): boolean {
  if (status === "ACTIVE") {
    return true;
  }
  if (status === "PENDING" && isPostDeployPromoWindowActive()) {
    return true;
  }
  return false;
}

export function resolveLawyerVerificationApprovedForAuth(input: {
  role: string;
  verificationStatus: LawyerVerificationStatus | null | undefined;
}): boolean {
  if (input.role !== "LAWYER") {
    return true;
  }
  if (isPostDeployPromoWindowActive()) {
    return true;
  }
  return input.verificationStatus === "APPROVED";
}

/** 체험 기간 — ENTERPRISE·ACTIVE entitlements로 구독/플랜 제한 우회 */
export function applyPostDeployPromoEntitlementOverride(
  entitlements: ResolvedTenantEntitlements,
): ResolvedTenantEntitlements {
  if (!isPostDeployPromoWindowActive()) {
    return entitlements;
  }

  return resolveTenantEntitlementsFromPlan({
    tenantId: entitlements.tenantId,
    tier: "ENTERPRISE",
    status: "ACTIVE",
    featureFlags: {},
  });
}
