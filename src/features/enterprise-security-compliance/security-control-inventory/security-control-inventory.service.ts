/**
 * Product Phase 32-A — Security control inventory service.
 */
import {
  ENTERPRISE_SECURITY_COMPLIANCE_DEFAULT_SCOPE_SLUG,
  SECURITY_CONTROL_ITEMS,
} from "./security-control-inventory.registry";
import { assembleSecurityControlInventory } from "./security-control-inventory.policy";
import type { SecurityControlInventoryResult } from "./security-control-inventory.schema";

export const SECURITY_CONTROL_INVENTORY_SERVICE_MARKER_PHASE32A =
  "phase32a-security-control-inventory-service" as const;

export function buildSecurityControlInventory(input?: {
  reviewScopeSlug?: string;
  documentedControlIds?: string[];
}): SecurityControlInventoryResult {
  const documentedControlIds = new Set(
    input?.documentedControlIds ??
      SECURITY_CONTROL_ITEMS.filter((control) => control.required).map(
        (control) => control.controlId,
      ),
  );

  return assembleSecurityControlInventory({
    reviewScopeSlug: input?.reviewScopeSlug ?? ENTERPRISE_SECURITY_COMPLIANCE_DEFAULT_SCOPE_SLUG,
    documentedControlIds,
  });
}
