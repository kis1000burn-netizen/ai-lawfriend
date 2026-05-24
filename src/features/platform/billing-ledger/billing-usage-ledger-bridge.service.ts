/**
 * Product Phase 22-D — Auto-promote metering events to DRAFT billing ledger.
 */
import { ConflictError } from "@/lib/errors";
import { promoteMeteringEventToBillingLedger } from "./billing-usage-ledger.service";
import { BILLING_LEDGER_DENIED_CODES } from "./billing-usage-ledger.policy";

export const BILLING_USAGE_LEDGER_BRIDGE_MARKER_PHASE22D =
  "phase22d-billing-usage-ledger-bridge" as const;

export async function promoteMeteringEventToBillingLedgerDraft(meteringEventId: string) {
  try {
    return await promoteMeteringEventToBillingLedger({ meteringEventId });
  } catch (error) {
    if (
      error instanceof ConflictError &&
      (error.details as { code?: string } | undefined)?.code ===
        BILLING_LEDGER_DENIED_CODES.DUPLICATE_CHARGE
    ) {
      return null;
    }
    throw error;
  }
}
