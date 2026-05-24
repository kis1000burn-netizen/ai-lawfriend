/**
 * Product Phase 22-B — Tenant entitlement service · API/UI hooks · denial audit.
 */
import { ForbiddenError } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit-log";
import { assertTenantIsActive } from "@/features/platform/tenant-organization/tenant-organization.policy";

import { resolveTenantEntitlementsFromPlan } from "./tenant-plan.registry";
import type {
  ResolvedTenantEntitlements,
  TenantEntitlementFeature,
  TenantEntitlementGateResult,
  TenantUiEntitlementVisibility,
} from "./tenant-plan.schema";
import {
  assertTenantOrganizationActiveForEntitlement,
  evaluateTenantCaseLimit,
  evaluateTenantEntitlementWithGlobalKillSwitch,
  evaluateTenantSeatLimit,
  mapExternalMessageChannelToEntitlementFeature,
  resolveTenantUiEntitlementVisibility,
  TENANT_ENTITLEMENT_DENIED_CODES,
} from "./tenant-entitlement.policy";
import {
  findTenantPlanByTenantId,
  loadTenantEntitlementContext,
} from "./tenant-entitlement.repository";
import type { ExternalMessageChannel } from "@/features/platform/external-messaging/external-message-adapter.schema";

export const TENANT_ENTITLEMENT_SERVICE_MARKER_PHASE22B =
  "phase22b-tenant-entitlement-service" as const;

export const TENANT_ENTITLEMENT_AUDIT_ACTION_DENIED =
  "TENANT_ENTITLEMENT_DENIED" as const;

export type TenantApiEntitlementAssertInput = {
  tenantId: string;
  feature: TenantEntitlementFeature;
  actorUserId?: string;
  globalEnabled?: boolean;
};

export async function resolveTenantEntitlements(
  tenantId: string,
): Promise<ResolvedTenantEntitlements | null> {
  const context = await loadTenantEntitlementContext(tenantId);
  if (!context) {
    return null;
  }

  assertTenantOrganizationActiveForEntitlement(context.tenant.status);

  return resolveTenantEntitlementsFromPlan({
    tenantId,
    tier: context.tier,
    status: context.status,
    featureFlags: context.featureFlags,
  });
}

export async function persistTenantEntitlementDenialAudit(input: {
  tenantId: string;
  feature: TenantEntitlementFeature;
  reason: string;
  code: string;
  actorUserId?: string;
  metadata?: Record<string, unknown>;
}) {
  await writeAuditLog({
    actorUserId: input.actorUserId ?? "system",
    action: TENANT_ENTITLEMENT_AUDIT_ACTION_DENIED,
    entityType: "TENANT",
    entityId: input.tenantId,
    message: `Entitlement denied: ${input.feature}`,
    metadata: {
      feature: input.feature,
      reason: input.reason,
      code: input.code,
      ...input.metadata,
    },
  });
}

function throwEntitlementDenied(
  gate: Extract<TenantEntitlementGateResult, { allowed: false }>,
  input: TenantApiEntitlementAssertInput,
) {
  throw new ForbiddenError(gate.reason);
}

export async function evaluateTenantApiEntitlement(
  input: TenantApiEntitlementAssertInput,
): Promise<TenantEntitlementGateResult> {
  const entitlements = await resolveTenantEntitlements(input.tenantId);
  if (!entitlements) {
    return {
      allowed: false,
      reason: "Tenant not found.",
      code: "TENANT_NOT_FOUND",
    };
  }

  return evaluateTenantEntitlementWithGlobalKillSwitch({
    entitlements,
    feature: input.feature,
    globalEnabled: input.globalEnabled,
  });
}

/** API enforcement hook — throws ForbiddenError + entitlement denial audit on deny. */
export async function enforceTenantApiEntitlement(
  input: TenantApiEntitlementAssertInput,
): Promise<ResolvedTenantEntitlements> {
  const entitlements = await resolveTenantEntitlements(input.tenantId);
  if (!entitlements) {
    throw new ForbiddenError("Tenant not found.");
  }

  const gate = evaluateTenantEntitlementWithGlobalKillSwitch({
    entitlements,
    feature: input.feature,
    globalEnabled: input.globalEnabled,
  });

  if (!gate.allowed) {
    await persistTenantEntitlementDenialAudit({
      tenantId: input.tenantId,
      feature: input.feature,
      reason: gate.reason,
      code: gate.code,
      actorUserId: input.actorUserId,
    });
    throwEntitlementDenied(gate, input);
  }

  return entitlements;
}

export async function enforceTenantSeatLimit(input: {
  tenantId: string;
  actorUserId?: string;
}): Promise<ResolvedTenantEntitlements> {
  const context = await loadTenantEntitlementContext(input.tenantId);
  if (!context) {
    throw new ForbiddenError("Tenant not found.");
  }

  assertTenantIsActive(context.tenant.status);

  const entitlements = resolveTenantEntitlementsFromPlan({
    tenantId: input.tenantId,
    tier: context.tier,
    status: context.status,
    featureFlags: context.featureFlags,
  });

  const gate = evaluateTenantSeatLimit({
    entitlements,
    activeSeatCount: context.activeSeatCount,
  });

  if (!gate.allowed) {
    await persistTenantEntitlementDenialAudit({
      tenantId: input.tenantId,
      feature: "AI_CASE_SUMMARY",
      reason: gate.reason,
      code: gate.code,
      actorUserId: input.actorUserId,
      metadata: { limitKind: "SEAT", activeSeatCount: context.activeSeatCount },
    });
    throwEntitlementDenied(gate, {
      tenantId: input.tenantId,
      feature: "AI_CASE_SUMMARY",
      actorUserId: input.actorUserId,
    });
  }

  return entitlements;
}

export async function enforceTenantCaseLimit(input: {
  tenantId: string;
  actorUserId?: string;
}): Promise<ResolvedTenantEntitlements> {
  const context = await loadTenantEntitlementContext(input.tenantId);
  if (!context) {
    throw new ForbiddenError("Tenant not found.");
  }

  assertTenantIsActive(context.tenant.status);

  const entitlements = resolveTenantEntitlementsFromPlan({
    tenantId: input.tenantId,
    tier: context.tier,
    status: context.status,
    featureFlags: context.featureFlags,
  });

  const gate = evaluateTenantCaseLimit({
    entitlements,
    activeCaseCount: context.activeCaseCount,
  });

  if (!gate.allowed) {
    await persistTenantEntitlementDenialAudit({
      tenantId: input.tenantId,
      feature: "AI_CASE_SUMMARY",
      reason: gate.reason,
      code: gate.code,
      actorUserId: input.actorUserId,
      metadata: { limitKind: "CASE", activeCaseCount: context.activeCaseCount },
    });
    throwEntitlementDenied(gate, {
      tenantId: input.tenantId,
      feature: "AI_CASE_SUMMARY",
      actorUserId: input.actorUserId,
    });
  }

  return entitlements;
}

/** UI visibility hook — returns per-feature visible/enabled flags for tenant-scoped UI. */
export async function resolveTenantUiEntitlements(
  tenantId: string,
): Promise<TenantUiEntitlementVisibility[]> {
  const entitlements = await resolveTenantEntitlements(tenantId);
  if (!entitlements) {
    return [];
  }
  return resolveTenantUiEntitlementVisibility(entitlements);
}

export async function assertExternalMessagingEntitlement(input: {
  tenantId: string;
  channel: ExternalMessageChannel;
  actorUserId?: string;
}): Promise<void> {
  const feature = mapExternalMessageChannelToEntitlementFeature(input.channel);
  if (!feature) {
    return;
  }

  await enforceTenantApiEntitlement({
    tenantId: input.tenantId,
    feature,
    actorUserId: input.actorUserId,
  });
}

export async function getTenantPlanSummary(tenantId: string) {
  const plan = await findTenantPlanByTenantId(tenantId);
  const entitlements = await resolveTenantEntitlements(tenantId);
  return { plan, entitlements };
}

export { TENANT_ENTITLEMENT_DENIED_CODES };
