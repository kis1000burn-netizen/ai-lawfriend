/**
 * Product Phase 35-D — DPA / security addendum pack service.
 */
import { CONTRACTING_LEGAL_OPS_DEFAULT_SCOPE_SLUG } from "../contract-template/contract-template-pack.registry";
import { DPA_SECURITY_ADDENDA } from "./dpa-security-addendum.registry";
import { assembleDpaSecurityAddendumPack } from "./dpa-security-addendum.policy";
import type { DpaSecurityAddendumPackResult } from "./dpa-security-addendum.schema";

export const DPA_SECURITY_ADDENDUM_SERVICE_MARKER_PHASE35D =
  "phase35d-dpa-security-addendum-service" as const;

export function buildDpaSecurityAddendumPack(input?: {
  contractingScopeSlug?: string;
  definedAddendumIds?: string[];
}): DpaSecurityAddendumPackResult {
  const definedAddendumIds = new Set(
    input?.definedAddendumIds ??
      DPA_SECURITY_ADDENDA.filter((addendum) => addendum.required).map(
        (addendum) => addendum.addendumId,
      ),
  );

  return assembleDpaSecurityAddendumPack({
    contractingScopeSlug: input?.contractingScopeSlug ?? CONTRACTING_LEGAL_OPS_DEFAULT_SCOPE_SLUG,
    definedAddendumIds,
  });
}
