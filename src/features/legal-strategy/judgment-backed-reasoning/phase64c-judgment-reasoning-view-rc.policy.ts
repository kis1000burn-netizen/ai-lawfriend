/**
 * Product Phase 64-C — Judgment Reasoning View RC policy SSOT.
 */
import { ValidationError } from "@/lib/errors";

export const PHASE64C_JUDGMENT_REASONING_VIEW_RC_POLICY_MARKER =
  "phase64c-judgment-reasoning-view-rc-policy-v1" as const;

/** Consolidated RC boundaries — 64-A~64-B unified for 64-C lock. */
export const PHASE64C_CONSOLIDATED_RC_BOUNDARY_MARKERS = [
  "NO_REASONING_VIEW_WITHOUT_SOURCE_TRACE",
  "NO_JUDGMENT_USE_WITHOUT_CANONICAL_SOURCE",
  "NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_REASONING_VIEW",
  "NO_CASE_OUTCOME_PREDICTION_AS_CERTAINTY",
  "NO_CLIENT_VISIBLE_JUDGMENT_REASONING_BY_DEFAULT",
  "UNCERTAINTY_SIGNAL_REQUIRED",
  "NO_VIEW_WITHOUT_SOURCE_MAP",
  "NO_VIEW_WITHOUT_CANONICAL_JUDGMENT_SOURCE",
  "NO_HIDDEN_REASONING_SOURCE",
  "NO_CERTAIN_OUTCOME_LANGUAGE",
  "NO_UNAPPROVED_SIGNAL_RENDERED_AS_AUTHORITY",
  "UNCERTAINTY_PANEL_REQUIRED",
  "LAWYER_REVIEW_REQUIRED_FOR_REASONING_VIEW_USE",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
  "JUDGMENT_BACKED_REASONING_MASTER_VERIFY_REQUIRED",
] as const;

/** RC gate boundaries — all sub-phases must be LOCKED before 64-C RC. */
export const PHASE64C_RC_GATE_BOUNDARY_MARKERS = [
  "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_64A_SOURCE_MAP_LOCK",
  "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_64B_VIEW_BUILDER_LOCK",
  "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_CONTROL_TOWER_BRAIN_RC",
  "NO_JUDGMENT_BACKED_REASONING_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_MASTER_VERIFY",
] as const;

export function evaluateJudgmentBackedReasoningRcGate(input: {
  phase64aSourceMapLocked: boolean;
  phase64bViewBuilderLocked: boolean;
  controlTowerBrainRcLocked: boolean;
  evidenceChainComplete: boolean;
  masterVerifyPassed: boolean;
}): { allowed: boolean; blockedBy?: string; reason?: string } {
  if (!input.phase64aSourceMapLocked) {
    return {
      allowed: false,
      blockedBy: "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_64A_SOURCE_MAP_LOCK",
      reason: "Phase 64-A judgment reasoning source map lock is required.",
    };
  }
  if (!input.phase64bViewBuilderLocked) {
    return {
      allowed: false,
      blockedBy: "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_64B_VIEW_BUILDER_LOCK",
      reason: "Phase 64-B judgment reasoning view builder lock is required.",
    };
  }
  if (!input.controlTowerBrainRcLocked) {
    return {
      allowed: false,
      blockedBy: "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_CONTROL_TOWER_BRAIN_RC",
      reason: "Control Tower Brain RC lock is required.",
    };
  }
  if (!input.evidenceChainComplete) {
    return {
      allowed: false,
      blockedBy: "NO_JUDGMENT_BACKED_REASONING_RC_WITH_BROKEN_EVIDENCE_CHAIN",
      reason: "Judgment-backed reasoning evidence chain is incomplete.",
    };
  }
  if (!input.masterVerifyPassed) {
    return {
      allowed: false,
      blockedBy: "NO_JUDGMENT_BACKED_REASONING_RC_WITHOUT_MASTER_VERIFY",
      reason: "Master verify script must pass before RC lock.",
    };
  }
  return { allowed: true };
}

export function assertJudgmentBackedReasoningRcGateAllowed(
  input: Parameters<typeof evaluateJudgmentBackedReasoningRcGate>[0],
): void {
  const result = evaluateJudgmentBackedReasoningRcGate(input);
  if (!result.allowed) {
    throw new ValidationError(result.blockedBy ?? "JUDGMENT_BACKED_REASONING_RC_BLOCKED");
  }
}
