/**
 * Product Phase 39-A — Strategic account plan policy SSOT.
 */
import { STRATEGIC_ACCOUNT_PLAN_ITEMS } from "./strategic-account-plan.registry";
import type { StrategicAccountPlanResult } from "./strategic-account-plan.schema";
import { STRATEGIC_ACCOUNT_PLAN_VERSION } from "./strategic-account-plan.schema";

export const STRATEGIC_ACCOUNT_PLAN_POLICY_MARKER_PHASE39A =
  "phase39a-strategic-account-plan-policy" as const;

export const STRATEGIC_ACCOUNT_PLAN_GATE_MARKER_PHASE39A =
  "phase39a-strategic-account-plan-gate" as const;

export function assembleStrategicAccountPlan(input: {
  strategicAccountScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): StrategicAccountPlanResult {
  const items = STRATEGIC_ACCOUNT_PLAN_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: STRATEGIC_ACCOUNT_PLAN_VERSION,
    strategicAccountScopeSlug: input.strategicAccountScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    strategicAccountPlanReady: definedRequired === required.length,
  };
}
