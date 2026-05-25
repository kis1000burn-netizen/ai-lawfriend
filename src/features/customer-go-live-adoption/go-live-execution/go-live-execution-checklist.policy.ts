/**
 * Product Phase 37-A — Go-live execution checklist policy SSOT.
 */
import { GO_LIVE_EXECUTION_ITEMS } from "./go-live-execution-checklist.registry";
import type { GoLiveExecutionChecklistResult } from "./go-live-execution-checklist.schema";
import { GO_LIVE_EXECUTION_CHECKLIST_VERSION } from "./go-live-execution-checklist.schema";

export const GO_LIVE_EXECUTION_CHECKLIST_POLICY_MARKER_PHASE37A =
  "phase37a-go-live-execution-checklist-policy" as const;

export const GO_LIVE_EXECUTION_CHECKLIST_GATE_MARKER_PHASE37A =
  "phase37a-go-live-execution-checklist-gate" as const;

export function assembleGoLiveExecutionChecklist(input: {
  adoptionScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): GoLiveExecutionChecklistResult {
  const items = GO_LIVE_EXECUTION_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: GO_LIVE_EXECUTION_CHECKLIST_VERSION,
    adoptionScopeSlug: input.adoptionScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    goLiveExecutionChecklistReady: definedRequired === required.length,
  };
}
