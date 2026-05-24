import { describe, expect, it } from "vitest";
import {
  assertBillingLedgerStatusTransition,
  assertBillingPeriodOpen,
  BILLING_LEDGER_DENIED_CODES,
  BILLING_LEDGER_NO_AUTOMATIC_INVOICE_MARKER,
  buildBillingPlanSnapshot,
  buildBillingUnitCostSnapshot,
  mapMeteringKindToChargeCategory,
  resolveBillableQuantityFromMeteringEvent,
  resolveChargeCategoryFromMeteringEvent,
} from "./billing-usage-ledger.policy";
import { BILLING_UNIT_COST_BY_TIER } from "./billing-unit-cost.registry";
import { resolveDefaultTenantEntitlements } from "@/features/platform/tenant-entitlement/tenant-entitlement.policy";

describe("billing-usage-ledger.policy (Phase 22-D)", () => {
  it("maps metering kinds to charge categories", () => {
    expect(
      resolveChargeCategoryFromMeteringEvent({
        kind: "AI_TOKEN_USAGE",
        metadata: null,
      }),
    ).toBe("AI_TOKEN");
    expect(
      mapMeteringKindToChargeCategory({
        kind: "FILE_UPLOAD",
        metadata: { bytesEstimate: 4096 },
      }).category,
    ).toBe("FILE_STORAGE");
  });

  it("resolves billable quantity from metering event", () => {
    expect(
      resolveBillableQuantityFromMeteringEvent({
        kind: "AI_TOKEN_USAGE",
        quantity: 1200,
        metadata: null,
      }),
    ).toBe(1200);
    expect(
      resolveBillableQuantityFromMeteringEvent({
        kind: "FILE_UPLOAD",
        quantity: 1,
        metadata: { bytesEstimate: 8192 },
      }),
    ).toBe(8192);
  });

  it("allows DRAFT → POSTED/VOIDED and POSTED → VOIDED/ADJUSTED", () => {
    expect(() => assertBillingLedgerStatusTransition("DRAFT", "POSTED")).not.toThrow();
    expect(() => assertBillingLedgerStatusTransition("POSTED", "ADJUSTED")).not.toThrow();
    expect(() => assertBillingLedgerStatusTransition("VOIDED", "POSTED")).toThrow(
      BILLING_LEDGER_DENIED_CODES.INVALID_STATUS_TRANSITION,
    );
  });

  it("blocks mutations when billing period is closed", () => {
    expect(() => assertBillingPeriodOpen(true)).toThrow(
      BILLING_LEDGER_DENIED_CODES.PERIOD_CLOSED,
    );
  });

  it("captures plan and unit cost snapshots from 22-B entitlements", () => {
    const entitlements = resolveDefaultTenantEntitlements("tenant-1", "PRO");
    const planSnapshot = buildBillingPlanSnapshot(entitlements);
    const unitCost = buildBillingUnitCostSnapshot({
      entitlements,
      category: "LLM_CALL",
    });

    expect(planSnapshot.tier).toBe("PRO");
    expect(unitCost.currency).toBe("KRW");
    expect(unitCost.amountMinor).toBe(BILLING_UNIT_COST_BY_TIER.PRO.LLM_CALL);
  });

  it("declares no automatic invoice issuance", () => {
    expect(BILLING_LEDGER_NO_AUTOMATIC_INVOICE_MARKER).toBe(
      "phase22d-no-automatic-invoice-issuance",
    );
  });
});
