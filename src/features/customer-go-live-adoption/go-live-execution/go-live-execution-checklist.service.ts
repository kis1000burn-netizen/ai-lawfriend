/**
 * Product Phase 37-A — Go-live execution checklist service.
 */
import {
  CUSTOMER_GO_LIVE_ADOPTION_DEFAULT_SCOPE_SLUG,
  GO_LIVE_EXECUTION_ITEMS,
} from "./go-live-execution-checklist.registry";
import { assembleGoLiveExecutionChecklist } from "./go-live-execution-checklist.policy";
import type { GoLiveExecutionChecklistResult } from "./go-live-execution-checklist.schema";

export const GO_LIVE_EXECUTION_CHECKLIST_SERVICE_MARKER_PHASE37A =
  "phase37a-go-live-execution-checklist-service" as const;

export function buildGoLiveExecutionChecklist(input?: {
  adoptionScopeSlug?: string;
  definedItemIds?: string[];
}): GoLiveExecutionChecklistResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      GO_LIVE_EXECUTION_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleGoLiveExecutionChecklist({
    adoptionScopeSlug: input?.adoptionScopeSlug ?? CUSTOMER_GO_LIVE_ADOPTION_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
