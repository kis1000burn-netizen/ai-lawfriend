/**
 * Product Phase 39-A — Strategic account plan service.
 */
import {
  STRATEGIC_ACCOUNT_EXPANSION_DEFAULT_SCOPE_SLUG,
  STRATEGIC_ACCOUNT_PLAN_ITEMS,
} from "./strategic-account-plan.registry";
import { assembleStrategicAccountPlan } from "./strategic-account-plan.policy";
import type { StrategicAccountPlanResult } from "./strategic-account-plan.schema";

export const STRATEGIC_ACCOUNT_PLAN_SERVICE_MARKER_PHASE39A =
  "phase39a-strategic-account-plan-service" as const;

export function buildStrategicAccountPlan(input?: {
  strategicAccountScopeSlug?: string;
  definedItemIds?: string[];
}): StrategicAccountPlanResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      STRATEGIC_ACCOUNT_PLAN_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleStrategicAccountPlan({
    strategicAccountScopeSlug:
      input?.strategicAccountScopeSlug ?? STRATEGIC_ACCOUNT_EXPANSION_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
