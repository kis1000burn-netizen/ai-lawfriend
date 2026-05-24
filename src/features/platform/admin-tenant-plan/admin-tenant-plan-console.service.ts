/**
 * Product Phase 22-E — Admin tenant plan console orchestration.
 */
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit-log";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { listTenantsForAdmin } from "@/features/platform/tenant-organization/tenant-organization.repository";
import { findTenantById } from "@/features/platform/tenant-organization/tenant-organization.repository";
import {
  findTenantPlanByTenantId,
  upsertTenantPlan,
} from "@/features/platform/tenant-entitlement/tenant-entitlement.repository";
import { parseTenantFeatureFlagOverrides } from "@/features/platform/tenant-entitlement/tenant-entitlement.policy";
import { resolveTenantUiEntitlements } from "@/features/platform/tenant-entitlement/tenant-entitlement.service";
import { getTenantUsageSummary } from "@/features/platform/tenant-metering/tenant-metering.service";
import { resolveTenantUsagePeriodKey } from "@/features/platform/tenant-metering/tenant-usage.policy";
import {
  createManualBillingLedgerAdjustment,
  getTenantBillingLedgerSummary,
} from "@/features/platform/billing-ledger/billing-usage-ledger.service";
import { isBillingPeriodClosed } from "@/features/platform/billing-ledger/billing-usage-ledger.repository";

import {
  ADMIN_TENANT_PLAN_AUDIT_ACTIONS,
  ADMIN_TENANT_PLAN_CONSOLE_POLICY_MARKER_PHASE22E,
  isBillingPeriodMutationBlocked,
} from "./admin-tenant-plan-console.policy";
import type {
  AdminBillingLedgerAdjustmentBody,
  AdminTenantListItem,
  AdminTenantPlanConsoleSnapshot,
  AdminUpdateTenantFeatureOverridesBody,
  AdminUpdateTenantPlanBody,
} from "./admin-tenant-plan-console.schema";

export const ADMIN_TENANT_PLAN_CONSOLE_SERVICE_MARKER_PHASE22E =
  "phase22e-admin-tenant-plan-console-service" as const;

export { ADMIN_TENANT_PLAN_CONSOLE_POLICY_MARKER_PHASE22E };

export async function getAdminTenantListSnapshot(): Promise<AdminTenantListItem[]> {
  const tenants = await listTenantsForAdmin();
  return tenants.map((tenant) => ({
    id: tenant.id,
    slug: tenant.slug,
    legalName: tenant.legalName,
    displayName: tenant.displayName,
    status: tenant.status,
    tier: tenant.plan?.tier ?? "FREE",
    planStatus: tenant.plan?.status ?? "ACTIVE",
    activeMembershipCount: tenant.memberships.length,
  }));
}

async function listClosedPeriodKeysForTenant(tenantId: string): Promise<string[]> {
  const rows = await prisma.billingLedgerPeriodClose.findMany({
    where: { tenantId },
    select: { billingPeriodKey: true },
    orderBy: { billingPeriodKey: "desc" },
  });
  return rows.map((row) => row.billingPeriodKey);
}

export async function getAdminTenantPlanConsoleSnapshot(
  tenantId: string,
  periodKey?: string,
): Promise<AdminTenantPlanConsoleSnapshot> {
  const tenant = await findTenantById(tenantId);
  if (!tenant) {
    throw new NotFoundError("Tenant not found.");
  }

  const resolvedPeriodKey = periodKey ?? resolveTenantUsagePeriodKey();
  const plan = await findTenantPlanByTenantId(tenantId);
  const featureFlags = parseTenantFeatureFlagOverrides(plan?.featureFlags);

  const [usageSummary, billingLedgerSummary, uiEntitlements, periodClosed, closedPeriodKeys] =
    await Promise.all([
      getTenantUsageSummary({ tenantId, periodKey: resolvedPeriodKey }),
      getTenantBillingLedgerSummary({
        tenantId,
        billingPeriodKey: resolvedPeriodKey,
      }),
      resolveTenantUiEntitlements(tenantId),
      isBillingPeriodClosed(tenantId, resolvedPeriodKey),
      listClosedPeriodKeysForTenant(tenantId),
    ]);

  return {
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      legalName: tenant.legalName,
      displayName: tenant.displayName,
      status: tenant.status,
    },
    plan: {
      tier: plan?.tier ?? "FREE",
      status: plan?.status ?? "ACTIVE",
      featureFlags,
    },
    periodKey: resolvedPeriodKey,
    periodClosed,
    closedPeriodKeys,
    billingMutationsBlocked: isBillingPeriodMutationBlocked(periodClosed),
    usageSummary,
    billingLedgerSummary,
    uiEntitlements,
  };
}

export async function updateAdminTenantPlan(input: {
  tenantId: string;
  body: AdminUpdateTenantPlanBody;
  actorUserId: string;
}) {
  const tenant = await findTenantById(input.tenantId);
  if (!tenant) {
    throw new NotFoundError("Tenant not found.");
  }

  const before = await findTenantPlanByTenantId(input.tenantId);
  const plan = await upsertTenantPlan({
    tenantId: input.tenantId,
    tier: input.body.tier,
    status: input.body.status,
    featureFlags: parseTenantFeatureFlagOverrides(before?.featureFlags),
  });

  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: ADMIN_TENANT_PLAN_AUDIT_ACTIONS.PLAN_UPDATED,
    entityType: "TENANT",
    entityId: input.tenantId,
    message: `Tenant plan updated to ${plan.tier}`,
    metadata: {
      before: before
        ? { tier: before.tier, status: before.status }
        : { tier: "FREE", status: "ACTIVE" },
      after: { tier: plan.tier, status: plan.status },
    },
  });

  return plan;
}

export async function updateAdminTenantFeatureOverrides(input: {
  tenantId: string;
  body: AdminUpdateTenantFeatureOverridesBody;
  actorUserId: string;
}) {
  const tenant = await findTenantById(input.tenantId);
  if (!tenant) {
    throw new NotFoundError("Tenant not found.");
  }

  const before = await findTenantPlanByTenantId(input.tenantId);
  const previousFlags = parseTenantFeatureFlagOverrides(before?.featureFlags);
  const mergedFlags = { ...previousFlags, ...input.body.featureFlags };

  const plan = await upsertTenantPlan({
    tenantId: input.tenantId,
    tier: before?.tier ?? "FREE",
    status: before?.status ?? "ACTIVE",
    featureFlags: mergedFlags,
  });

  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: ADMIN_TENANT_PLAN_AUDIT_ACTIONS.FEATURE_OVERRIDE_UPDATED,
    entityType: "TENANT",
    entityId: input.tenantId,
    message: "Tenant feature overrides updated",
    metadata: {
      before: previousFlags,
      after: mergedFlags,
    },
  });

  return plan;
}

export async function createAdminBillingLedgerAdjustment(input: {
  tenantId: string;
  body: AdminBillingLedgerAdjustmentBody;
  actorUserId: string;
}) {
  const closed = await isBillingPeriodClosed(input.tenantId, input.body.billingPeriodKey);
  if (isBillingPeriodMutationBlocked(closed)) {
    throw new ForbiddenError("Billing period is closed.");
  }

  const ledger = await createManualBillingLedgerAdjustment({
    tenantId: input.tenantId,
    billingPeriodKey: input.body.billingPeriodKey,
    chargeCategory: input.body.chargeCategory,
    billableQuantity: input.body.billableQuantity,
    adjustmentOfId: input.body.adjustmentOfId,
    adjustmentReason: input.body.adjustmentReason,
    actorUserId: input.actorUserId,
  });

  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: ADMIN_TENANT_PLAN_AUDIT_ACTIONS.BILLING_LEDGER_ADJUSTED,
    entityType: "TENANT",
    entityId: input.tenantId,
    message: "Admin billing ledger adjustment recorded",
    metadata: {
      ledgerId: ledger.id,
      billingPeriodKey: input.body.billingPeriodKey,
      chargeCategory: input.body.chargeCategory,
      billableQuantity: input.body.billableQuantity,
      adjustmentReason: input.body.adjustmentReason,
      noAutomaticInvoice: true,
    },
  });

  return ledger;
}
