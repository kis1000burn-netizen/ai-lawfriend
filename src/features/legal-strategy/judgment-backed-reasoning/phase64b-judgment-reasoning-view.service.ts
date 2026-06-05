/**
 * Product Phase 64-B — Judgment Reasoning View service SSOT.
 */
import {
  assertJudgmentReasoningViewAllowed,
  buildJudgmentReasoningView,
} from "./phase64b-judgment-reasoning-view.policy";
import type {
  BuildJudgmentReasoningViewInput,
  JudgmentReasoningView,
} from "./phase64b-judgment-reasoning-view.schema";

export const PHASE64B_JUDGMENT_REASONING_VIEW_SERVICE_MARKER =
  "phase64b-judgment-reasoning-view-service" as const;

export function composeJudgmentReasoningView(
  input: BuildJudgmentReasoningViewInput,
): JudgmentReasoningView {
  assertJudgmentReasoningViewAllowed(input.sourceMap);
  return buildJudgmentReasoningView(input);
}
