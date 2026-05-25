/**
 * Product Phase 37-A — Go-live execution checklist SSOT.
 */
import type { GoLiveExecutionChecklistResult } from "./go-live-execution-checklist.schema";

export const GO_LIVE_EXECUTION_CHECKLIST_REGISTRY_MARKER_PHASE37A =
  "phase37a-go-live-execution-checklist-registry" as const;

export const CUSTOMER_GO_LIVE_ADOPTION_DEFAULT_SCOPE_SLUG = "customer-go-live-adoption-001" as const;

type GoLiveExecutionItem = Omit<GoLiveExecutionChecklistResult["items"][number], "defined">;

export const GO_LIVE_EXECUTION_ITEMS: GoLiveExecutionItem[] = [
  { itemId: "CUTOVER_EXECUTION", label: "Cutover execution checklist", required: true },
  { itemId: "SMOKE_VALIDATION", label: "Post go-live smoke validation", required: true },
  { itemId: "ACCESS_VERIFICATION", label: "Role access verification", required: true },
  { itemId: "SUPPORT_STANDING", label: "Support standing readiness", required: true },
  { itemId: "GO_LIVE_COMMUNICATION", label: "Go-live customer communication", required: true },
];
