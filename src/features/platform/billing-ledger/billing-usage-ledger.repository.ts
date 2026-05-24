/**
 * Product Phase 22-D — Billing usage ledger repository.
 */
import type { BillingChargeCategory, BillingLedgerStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BillingPlanSnapshot, BillingUnitCostSnapshot } from "./billing-usage-ledger.schema";

export const BILLING_USAGE_LEDGER_REPOSITORY_MARKER_PHASE22D =
  "phase22d-billing-usage-ledger-repository" as const;

export async function findBillingLedgerByMeteringEventId(meteringEventId: string) {
  return prisma.billingUsageLedger.findUnique({
    where: { meteringEventId },
  });
}

export async function findBillingLedgerById(id: string) {
  return prisma.billingUsageLedger.findUnique({ where: { id } });
}

export async function isBillingPeriodClosed(tenantId: string, billingPeriodKey: string) {
  const row = await prisma.billingLedgerPeriodClose.findUnique({
    where: {
      tenantId_billingPeriodKey: { tenantId, billingPeriodKey },
    },
  });
  return row !== null;
}

export async function createBillingUsageLedgerEntry(input: {
  tenantId: string;
  meteringEventId?: string;
  billingPeriodKey: string;
  chargeCategory: BillingChargeCategory;
  billableQuantity: number;
  unitCostSnapshot: BillingUnitCostSnapshot;
  planSnapshot: BillingPlanSnapshot;
  status?: BillingLedgerStatus;
  adjustmentOfId?: string;
  adjustmentReason?: string;
  actorUserId?: string;
}) {
  return prisma.billingUsageLedger.create({
    data: {
      tenantId: input.tenantId,
      meteringEventId: input.meteringEventId,
      billingPeriodKey: input.billingPeriodKey,
      chargeCategory: input.chargeCategory,
      billableQuantity: input.billableQuantity,
      unitCostSnapshot: input.unitCostSnapshot as Prisma.InputJsonValue,
      planSnapshot: input.planSnapshot as Prisma.InputJsonValue,
      status: input.status ?? "DRAFT",
      adjustmentOfId: input.adjustmentOfId,
      adjustmentReason: input.adjustmentReason,
      actorUserId: input.actorUserId,
    },
  });
}

export async function updateBillingLedgerStatus(input: {
  id: string;
  status: BillingLedgerStatus;
  voidReason?: string;
  postedAt?: Date;
  voidedAt?: Date;
}) {
  return prisma.billingUsageLedger.update({
    where: { id: input.id },
    data: {
      status: input.status,
      voidReason: input.voidReason,
      postedAt: input.postedAt,
      voidedAt: input.voidedAt,
    },
  });
}

export async function closeBillingLedgerPeriod(input: {
  tenantId: string;
  billingPeriodKey: string;
  closedByUserId?: string;
}) {
  return prisma.billingLedgerPeriodClose.create({
    data: {
      tenantId: input.tenantId,
      billingPeriodKey: input.billingPeriodKey,
      closedByUserId: input.closedByUserId,
    },
  });
}

export async function listBillingLedgersForPeriod(input: {
  tenantId: string;
  billingPeriodKey: string;
  status?: BillingLedgerStatus;
}) {
  return prisma.billingUsageLedger.findMany({
    where: {
      tenantId: input.tenantId,
      billingPeriodKey: input.billingPeriodKey,
      status: input.status,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function findTenantUsageEventById(meteringEventId: string) {
  return prisma.tenantUsageEvent.findUnique({
    where: { id: meteringEventId },
  });
}
