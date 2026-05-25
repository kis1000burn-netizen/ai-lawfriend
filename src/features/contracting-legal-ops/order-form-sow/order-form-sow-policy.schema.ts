/**
 * Product Phase 35-C — Order form / SOW policy schema (Zod SSOT).
 */
import { z } from "zod";

export const ORDER_FORM_SOW_POLICY_SCHEMA_MARKER_PHASE35C =
  "phase35c-order-form-sow-policy-schema" as const;

export const ORDER_FORM_SOW_POLICY_VERSION = "35-C.1" as const;

export const ORDER_FORM_SOW_POLICY_IDS = [
  "ORDER_FORM_FIELDS",
  "SOW_SCOPE_CLAUSES",
  "PRICING_SCHEDULE",
  "TERM_RENEWAL",
  "CHANGE_ORDER_POLICY",
] as const;

export const orderFormSowPolicyItemSchema = z.object({
  policyId: z.enum(ORDER_FORM_SOW_POLICY_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const orderFormSowPolicyResultSchema = z.object({
  version: z.literal(ORDER_FORM_SOW_POLICY_VERSION),
  contractingScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  policies: z.array(orderFormSowPolicyItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  orderFormSowPolicyReady: z.boolean(),
});

export type OrderFormSowPolicyId = (typeof ORDER_FORM_SOW_POLICY_IDS)[number];
export type OrderFormSowPolicyResult = z.infer<typeof orderFormSowPolicyResultSchema>;
