/**
 * Product Phase 32-A — Security control inventory policy SSOT.
 */
import { SECURITY_CONTROL_ITEMS } from "./security-control-inventory.registry";
import type { SecurityControlInventoryResult } from "./security-control-inventory.schema";
import { SECURITY_CONTROL_INVENTORY_VERSION } from "./security-control-inventory.schema";

export const SECURITY_CONTROL_INVENTORY_POLICY_MARKER_PHASE32A =
  "phase32a-security-control-inventory-policy" as const;

export const SECURITY_CONTROL_INVENTORY_GATE_MARKER_PHASE32A =
  "phase32a-security-control-inventory-gate" as const;

export function assembleSecurityControlInventory(input: {
  reviewScopeSlug: string;
  documentedControlIds: Set<string>;
  generatedAt?: string;
}): SecurityControlInventoryResult {
  const controls = SECURITY_CONTROL_ITEMS.map((control) => ({
    ...control,
    documented: input.documentedControlIds.has(control.controlId),
  }));

  const required = controls.filter((control) => control.required);
  const documentedRequired = required.filter((control) => control.documented).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((documentedRequired / required.length) * 100);

  return {
    version: SECURITY_CONTROL_INVENTORY_VERSION,
    reviewScopeSlug: input.reviewScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    controls,
    completionRate,
    securityControlInventoryReady: documentedRequired === required.length,
  };
}
