/**
 * Product Phase 28-A — Paid conversion contract pack items SSOT.
 */
import type { PaidConversionContractPackResult } from "./paid-conversion-contract-pack.schema";

export const PAID_CONVERSION_CONTRACT_PACK_REGISTRY_MARKER_PHASE28A =
  "phase28a-paid-conversion-contract-pack-registry" as const;

export const PAID_CONVERSION_DEFAULT_TENANT = "pilot-lawfirm-001" as const;

type ContractItem = Omit<PaidConversionContractPackResult["items"][number], "signed" | "notes">;

export const PAID_CONVERSION_CONTRACT_ITEMS: ContractItem[] = [
  { itemId: "MSA", label: "Master Service Agreement", required: true },
  { itemId: "ORDER_FORM", label: "Commercial order form · plan tier", required: true },
  {
    itemId: "DATA_PROCESSING_ADDENDUM",
    label: "Data processing addendum (DPA)",
    required: true,
  },
  { itemId: "BILLING_TERMS", label: "Billing · payment terms", required: true },
  { itemId: "SERVICE_LEVEL_EXHIBIT", label: "SLA exhibit reference", required: true },
];
