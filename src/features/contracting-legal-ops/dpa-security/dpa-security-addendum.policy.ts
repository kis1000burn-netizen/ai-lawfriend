/**
 * Product Phase 35-D — DPA / security addendum pack policy SSOT.
 */
import { DPA_SECURITY_ADDENDA } from "./dpa-security-addendum.registry";
import type { DpaSecurityAddendumPackResult } from "./dpa-security-addendum.schema";
import { DPA_SECURITY_ADDENDUM_VERSION } from "./dpa-security-addendum.schema";

export const DPA_SECURITY_ADDENDUM_POLICY_MARKER_PHASE35D =
  "phase35d-dpa-security-addendum-policy" as const;

export function assembleDpaSecurityAddendumPack(input: {
  contractingScopeSlug: string;
  definedAddendumIds: Set<string>;
  generatedAt?: string;
}): DpaSecurityAddendumPackResult {
  const addenda = DPA_SECURITY_ADDENDA.map((addendum) => ({
    ...addendum,
    defined: input.definedAddendumIds.has(addendum.addendumId),
  }));

  const required = addenda.filter((addendum) => addendum.required);
  const definedRequired = required.filter((addendum) => addendum.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: DPA_SECURITY_ADDENDUM_VERSION,
    contractingScopeSlug: input.contractingScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    addenda,
    completionRate,
    dpaSecurityAddendumReady: definedRequired === required.length,
  };
}
