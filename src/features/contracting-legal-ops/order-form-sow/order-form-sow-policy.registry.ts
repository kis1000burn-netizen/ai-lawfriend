/**
 * Product Phase 35-C — Order form / SOW policy SSOT.
 */
import type { OrderFormSowPolicyResult } from "./order-form-sow-policy.schema";

export const ORDER_FORM_SOW_POLICY_REGISTRY_MARKER_PHASE35C =
  "phase35c-order-form-sow-policy-registry" as const;

type OrderFormSowPolicyItem = Omit<OrderFormSowPolicyResult["policies"][number], "defined">;

export const ORDER_FORM_SOW_POLICIES: OrderFormSowPolicyItem[] = [
  { policyId: "ORDER_FORM_FIELDS", label: "Order form field checklist", required: true },
  { policyId: "SOW_SCOPE_CLAUSES", label: "SOW scope and deliverable clauses", required: true },
  { policyId: "PRICING_SCHEDULE", label: "Pricing schedule attachment", required: true },
  { policyId: "TERM_RENEWAL", label: "Term and renewal policy", required: true },
  { policyId: "CHANGE_ORDER_POLICY", label: "Change order / SOW amendment policy", required: true },
];
