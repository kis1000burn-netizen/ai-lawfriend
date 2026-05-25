/**
 * Product Phase 35-C — Order form / SOW policy service.
 */
import { CONTRACTING_LEGAL_OPS_DEFAULT_SCOPE_SLUG } from "../contract-template/contract-template-pack.registry";
import { ORDER_FORM_SOW_POLICIES } from "./order-form-sow-policy.registry";
import { assembleOrderFormSowPolicy } from "./order-form-sow-policy.policy";
import type { OrderFormSowPolicyResult } from "./order-form-sow-policy.schema";

export const ORDER_FORM_SOW_POLICY_SERVICE_MARKER_PHASE35C =
  "phase35c-order-form-sow-policy-service" as const;

export function buildOrderFormSowPolicy(input?: {
  contractingScopeSlug?: string;
  definedPolicyIds?: string[];
}): OrderFormSowPolicyResult {
  const definedPolicyIds = new Set(
    input?.definedPolicyIds ??
      ORDER_FORM_SOW_POLICIES.filter((policy) => policy.required).map(
        (policy) => policy.policyId,
      ),
  );

  return assembleOrderFormSowPolicy({
    contractingScopeSlug: input?.contractingScopeSlug ?? CONTRACTING_LEGAL_OPS_DEFAULT_SCOPE_SLUG,
    definedPolicyIds,
  });
}
