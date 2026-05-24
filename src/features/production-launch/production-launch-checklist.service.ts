/**
 * Product Phase 25-A — Production launch checklist service.
 */
import type { ProductionLaunchChecklistResult } from "./production-launch-checklist.schema";
import { evaluateProductionLaunchChecklist } from "./production-launch-checklist.policy";
import { PRODUCTION_LAUNCH_CHECKLIST_ITEMS } from "./production-launch-checklist.registry";

export const PRODUCTION_LAUNCH_CHECKLIST_SERVICE_MARKER_PHASE25A =
  "phase25a-production-launch-checklist-service" as const;

/** Product RC gates assumed PASS when building launch checklist (static gate layer). */
export function buildProductionLaunchChecklist(input?: {
  rollbackTargetConfirmed?: boolean;
  goNoGoDecision?: "GO" | "NO-GO" | null;
  skipItemIds?: string[];
}): ProductionLaunchChecklistResult {
  const completedItemIds = new Set(
    PRODUCTION_LAUNCH_CHECKLIST_ITEMS.filter(
      (item) =>
        item.verifyScript &&
        !(input?.skipItemIds ?? []).includes(item.itemId),
    ).map((item) => item.itemId),
  );

  return evaluateProductionLaunchChecklist({
    completedItemIds,
    rollbackTargetConfirmed: input?.rollbackTargetConfirmed ?? false,
    goNoGoDecision: input?.goNoGoDecision ?? null,
  });
}
