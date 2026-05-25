/**
 * Product Phase 39-A — Strategic account plan SSOT.
 */
import type { StrategicAccountPlanResult } from "./strategic-account-plan.schema";

export const STRATEGIC_ACCOUNT_PLAN_REGISTRY_MARKER_PHASE39A =
  "phase39a-strategic-account-plan-registry" as const;

export const STRATEGIC_ACCOUNT_EXPANSION_DEFAULT_SCOPE_SLUG =
  "strategic-account-expansion-001" as const;

type StrategicAccountPlanItem = Omit<StrategicAccountPlanResult["items"][number], "defined">;

export const STRATEGIC_ACCOUNT_PLAN_ITEMS: StrategicAccountPlanItem[] = [
  { itemId: "ACCOUNT_VISION", label: "Strategic account vision", required: true },
  { itemId: "STAKEHOLDER_MAP", label: "Stakeholder and sponsor map", required: true },
  { itemId: "EXPANSION_OBJECTIVES", label: "Expansion objectives", required: true },
  { itemId: "SUCCESS_METRICS", label: "Account success metrics", required: true },
  { itemId: "ACCOUNT_PLAN_SIGNOFF", label: "Account plan signoff", required: true },
];
