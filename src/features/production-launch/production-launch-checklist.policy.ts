/**
 * Product Phase 25-A — Production launch checklist policy SSOT.
 */
import { PRODUCTION_LAUNCH_CHECKLIST_ITEMS } from "./production-launch-checklist.registry";
import type { ProductionLaunchChecklistResult } from "./production-launch-checklist.schema";
import { PRODUCTION_LAUNCH_CHECKLIST_VERSION } from "./production-launch-checklist.schema";

export const PRODUCTION_LAUNCH_CHECKLIST_POLICY_MARKER_PHASE25A =
  "phase25a-production-launch-checklist-policy" as const;

export function evaluateProductionLaunchChecklist(input: {
  completedItemIds: Set<string>;
  rollbackTargetConfirmed?: boolean;
  goNoGoDecision?: "GO" | "NO-GO" | null;
  generatedAt?: string;
}): ProductionLaunchChecklistResult {
  const items = PRODUCTION_LAUNCH_CHECKLIST_ITEMS.map((item) => {
    let completed = input.completedItemIds.has(item.itemId);

    if (item.itemId === "ROLLBACK_TARGET") {
      completed = input.rollbackTargetConfirmed === true;
    }
    if (item.itemId === "GO_NO_GO_RECORD") {
      completed = input.goNoGoDecision === "GO";
    }

    return {
      itemId: item.itemId,
      label: item.label,
      required: item.required,
      verifyScript: item.verifyScript,
      completed,
      notes: completed ? [] : [`pending: ${item.itemId}`],
    };
  });

  const required = items.filter((item) => item.required);
  const completedRequired = required.filter((item) => item.completed).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((completedRequired / required.length) * 100);
  const allRequiredComplete = completedRequired === required.length;

  let goNoGoRecommendation: ProductionLaunchChecklistResult["goNoGoRecommendation"] = "REVIEW";
  if (allRequiredComplete && input.goNoGoDecision === "GO") {
    goNoGoRecommendation = "GO";
  } else if (input.goNoGoDecision === "NO-GO" || completionRate < 80) {
    goNoGoRecommendation = "NO-GO";
  }

  return {
    version: PRODUCTION_LAUNCH_CHECKLIST_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    allRequiredComplete,
    goNoGoRecommendation,
  };
}
