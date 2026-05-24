/**
 * Product Phase 22-D — Billing-safe usage ledger service.
 * Not invoice issuance — safe ledger for future billing/payment/tax documents.
 */
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit-log";
import { resolveTenantEntitlements } from "@/features/platform/tenant-entitlement/tenant-entitlement.service";

import {
  assertBillingLedgerStatusTransition,
  assertBillingPeriodOpen,
  BILLING_LEDGER_DENIED_CODES,
  BILLING_LEDGER_NO_AUTOMATIC_INVOICE_MARKER,
  buildBillingPlanSnapshot,
  buildBillingUnitCostSnapshot,
  resolveBillableQuantityFromMeteringEvent,
  resolveChargeCategoryFromMeteringEvent,
} from "./billing-usage-ledger.policy";
import {
  closeBillingLedgerPeriod,
  createBillingUsageLedgerEntry,
  findBillingLedgerById,
  findBillingLedgerByMeteringEventId,
  findTenantUsageEventById,
  isBillingPeriodClosed,
  listBillingLedgersForPeriod,
  updateBillingLedgerStatus,
} from "./billing-usage-ledger.repository";
import type {
  ManualBillingLedgerAdjustmentInput,
  PromoteMeteringEventToLedgerInput,
} from "./billing-usage-ledger.schema";
import {
  manualBillingLedgerAdjustmentInputSchema,
  promoteMeteringEventToLedgerInputSchema,
} from "./billing-usage-ledger.schema";

export const BILLING_USAGE_LEDGER_SERVICE_MARKER_PHASE22D =
  "phase22d-billing-usage-ledger-service" as const;

export const BILLING_LEDGER_AUDIT_ACTIONS = {
  PROMOTED: "BILLING_LEDGER_PROMOTED",
  POSTED: "BILLING_LEDGER_POSTED",
  VOIDED: "BILLING_LEDGER_VOIDED",
  MANUAL_ADJUSTMENT: "BILLING_LEDGER_MANUAL_ADJUSTMENT",
  PERIOD_CLOSED: "BILLING_LEDGER_PERIOD_CLOSED",
} as const;

async function persistBillingLedgerAudit(input: {
  action: string;
  tenantId: string;
  ledgerId: string;
  actorUserId?: string;
  metadata?: Record<string, unknown>;
}) {
  await writeAuditLog({
    actorUserId: input.actorUserId ?? "system",
    action: input.action,
    entityType: "BILLING_USAGE_LEDGER",
    entityId: input.ledgerId,
    metadata: {
      tenantId: input.tenantId,
      noAutomaticInvoice: true,
      marker: BILLING_LEDGER_NO_AUTOMATIC_INVOICE_MARKER,
      ...input.metadata,
    },
  });
}

function assertNoDuplicateCharge(existing: { id: string } | null) {
  if (existing) {
    throw new ConflictError("Metering event already promoted to billing ledger.", {
      code: BILLING_LEDGER_DENIED_CODES.DUPLICATE_CHARGE,
    });
  }
}

async function assertPeriodOpenForTenant(tenantId: string, billingPeriodKey: string) {
  const closed = await isBillingPeriodClosed(tenantId, billingPeriodKey);
  try {
    assertBillingPeriodOpen(closed);
  } catch {
    throw new ForbiddenError("Billing period is closed.");
  }
}

/** Promote 22-C metering event → DRAFT billing ledger entry (idempotent guard). */
export async function promoteMeteringEventToBillingLedger(
  input: PromoteMeteringEventToLedgerInput,
) {
  const parsed = promoteMeteringEventToLedgerInputSchema.parse(input);

  const existing = await findBillingLedgerByMeteringEventId(parsed.meteringEventId);
  assertNoDuplicateCharge(existing);

  const meteringEvent = await findTenantUsageEventById(parsed.meteringEventId);
  if (!meteringEvent) {
    throw new NotFoundError("Metering event not found.");
  }

  await assertPeriodOpenForTenant(meteringEvent.tenantId, meteringEvent.periodKey);

  const entitlements = await resolveTenantEntitlements(meteringEvent.tenantId);
  if (!entitlements) {
    throw new NotFoundError("Tenant entitlements not found.");
  }

  const chargeCategory = resolveChargeCategoryFromMeteringEvent({
    kind: meteringEvent.kind,
    metadata: meteringEvent.metadata,
  });
  const billableQuantity = resolveBillableQuantityFromMeteringEvent({
    kind: meteringEvent.kind,
    quantity: meteringEvent.quantity,
    metadata: meteringEvent.metadata,
  });
  const capturedAt = meteringEvent.recordedAt;

  const ledger = await createBillingUsageLedgerEntry({
    tenantId: meteringEvent.tenantId,
    meteringEventId: meteringEvent.id,
    billingPeriodKey: meteringEvent.periodKey,
    chargeCategory,
    billableQuantity,
    unitCostSnapshot: buildBillingUnitCostSnapshot({
      entitlements,
      category: chargeCategory,
      capturedAt,
    }),
    planSnapshot: buildBillingPlanSnapshot(entitlements, capturedAt),
    status: "DRAFT",
    actorUserId: parsed.actorUserId,
  });

  await persistBillingLedgerAudit({
    action: BILLING_LEDGER_AUDIT_ACTIONS.PROMOTED,
    tenantId: ledger.tenantId,
    ledgerId: ledger.id,
    actorUserId: parsed.actorUserId,
    metadata: {
      meteringEventId: meteringEvent.id,
      chargeCategory,
      billableQuantity,
    },
  });

  return ledger;
}

export async function postBillingLedgerEntry(input: {
  ledgerId: string;
  actorUserId?: string;
}) {
  const ledger = await findBillingLedgerById(input.ledgerId);
  if (!ledger) {
    throw new NotFoundError("Billing ledger entry not found.");
  }

  await assertPeriodOpenForTenant(ledger.tenantId, ledger.billingPeriodKey);
  assertBillingLedgerStatusTransition(ledger.status, "POSTED");

  const updated = await updateBillingLedgerStatus({
    id: ledger.id,
    status: "POSTED",
    postedAt: new Date(),
  });

  await persistBillingLedgerAudit({
    action: BILLING_LEDGER_AUDIT_ACTIONS.POSTED,
    tenantId: ledger.tenantId,
    ledgerId: ledger.id,
    actorUserId: input.actorUserId,
  });

  return updated;
}

export async function voidBillingLedgerEntry(input: {
  ledgerId: string;
  voidReason: string;
  actorUserId?: string;
}) {
  const ledger = await findBillingLedgerById(input.ledgerId);
  if (!ledger) {
    throw new NotFoundError("Billing ledger entry not found.");
  }

  await assertPeriodOpenForTenant(ledger.tenantId, ledger.billingPeriodKey);
  assertBillingLedgerStatusTransition(ledger.status, "VOIDED");

  const updated = await updateBillingLedgerStatus({
    id: ledger.id,
    status: "VOIDED",
    voidReason: input.voidReason,
    voidedAt: new Date(),
  });

  await persistBillingLedgerAudit({
    action: BILLING_LEDGER_AUDIT_ACTIONS.VOIDED,
    tenantId: ledger.tenantId,
    ledgerId: ledger.id,
    actorUserId: input.actorUserId,
    metadata: { voidReason: input.voidReason },
  });

  return updated;
}

/** Manual adjustment — creates ADJUSTED ledger row + audit (not invoice). */
export async function createManualBillingLedgerAdjustment(
  input: ManualBillingLedgerAdjustmentInput,
) {
  const parsed = manualBillingLedgerAdjustmentInputSchema.parse(input);

  await assertPeriodOpenForTenant(parsed.tenantId, parsed.billingPeriodKey);

  const entitlements = await resolveTenantEntitlements(parsed.tenantId);
  if (!entitlements) {
    throw new NotFoundError("Tenant entitlements not found.");
  }

  if (parsed.adjustmentOfId) {
    const original = await findBillingLedgerById(parsed.adjustmentOfId);
    if (!original) {
      throw new NotFoundError("Original ledger entry not found.");
    }
    assertBillingLedgerStatusTransition(original.status, "ADJUSTED");
    await updateBillingLedgerStatus({
      id: original.id,
      status: "ADJUSTED",
    });
  }

  const capturedAt = new Date();
  const ledger = await createBillingUsageLedgerEntry({
    tenantId: parsed.tenantId,
    billingPeriodKey: parsed.billingPeriodKey,
    chargeCategory: parsed.chargeCategory,
    billableQuantity: parsed.billableQuantity,
    unitCostSnapshot: buildBillingUnitCostSnapshot({
      entitlements,
      category: parsed.chargeCategory,
      capturedAt,
    }),
    planSnapshot: buildBillingPlanSnapshot(entitlements, capturedAt),
    status: "ADJUSTED",
    adjustmentOfId: parsed.adjustmentOfId,
    adjustmentReason: parsed.adjustmentReason,
    actorUserId: parsed.actorUserId,
  });

  await persistBillingLedgerAudit({
    action: BILLING_LEDGER_AUDIT_ACTIONS.MANUAL_ADJUSTMENT,
    tenantId: parsed.tenantId,
    ledgerId: ledger.id,
    actorUserId: parsed.actorUserId,
    metadata: {
      adjustmentOfId: parsed.adjustmentOfId,
      adjustmentReason: parsed.adjustmentReason,
      billableQuantity: parsed.billableQuantity,
    },
  });

  return ledger;
}

export async function closeTenantBillingPeriod(input: {
  tenantId: string;
  billingPeriodKey: string;
  closedByUserId?: string;
}) {
  const alreadyClosed = await isBillingPeriodClosed(
    input.tenantId,
    input.billingPeriodKey,
  );
  if (alreadyClosed) {
    throw new ConflictError("Billing period already closed.");
  }

  const close = await closeBillingLedgerPeriod(input);

  await persistBillingLedgerAudit({
    action: BILLING_LEDGER_AUDIT_ACTIONS.PERIOD_CLOSED,
    tenantId: input.tenantId,
    ledgerId: close.id,
    actorUserId: input.closedByUserId,
    metadata: { billingPeriodKey: input.billingPeriodKey },
  });

  return close;
}

export async function getTenantBillingLedgerSummary(input: {
  tenantId: string;
  billingPeriodKey: string;
}) {
  const entries = await listBillingLedgersForPeriod(input);
  const periodClosed = await isBillingPeriodClosed(
    input.tenantId,
    input.billingPeriodKey,
  );

  return {
    tenantId: input.tenantId,
    billingPeriodKey: input.billingPeriodKey,
    periodClosed,
    entryCount: entries.length,
    noAutomaticInvoiceIssuance: true,
    entries,
  };
}

export { BILLING_LEDGER_DENIED_CODES, BILLING_LEDGER_NO_AUTOMATIC_INVOICE_MARKER };
