/**
 * Product Phase 35-C — Order form / SOW policy SSOT.
 */
import { ORDER_FORM_SOW_POLICIES } from "./order-form-sow-policy.registry";
import type { OrderFormSowPolicyResult } from "./order-form-sow-policy.schema";
import { ORDER_FORM_SOW_POLICY_VERSION } from "./order-form-sow-policy.schema";

export const ORDER_FORM_SOW_POLICY_POLICY_MARKER_PHASE35C =
  "phase35c-order-form-sow-policy-policy" as const;

export function assembleOrderFormSowPolicy(input: {
  contractingScopeSlug: string;
  definedPolicyIds: Set<string>;
  generatedAt?: string;
}): OrderFormSowPolicyResult {
  const policies = ORDER_FORM_SOW_POLICIES.map((policy) => ({
    ...policy,
    defined: input.definedPolicyIds.has(policy.policyId),
  }));

  const required = policies.filter((policy) => policy.required);
  const definedRequired = required.filter((policy) => policy.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: ORDER_FORM_SOW_POLICY_VERSION,
    contractingScopeSlug: input.contractingScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    policies,
    completionRate,
    orderFormSowPolicyReady: definedRequired === required.length,
  };
}
