/**
 * Product Phase 63-F — Counter-Argument Draft Engine RC policy SSOT.
 */
import { ValidationError } from "@/lib/errors";

export const PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_POLICY_MARKER =
  "phase63f-counter-argument-draft-engine-rc-policy-v1" as const;

/** Consolidated RC boundaries — 63-A~63-E unified for 63-F lock. */
export const PHASE63F_CONSOLIDATED_RC_BOUNDARY_MARKERS = [
  "NO_AUTO_CONFIRMED_OPPONENT_ARGUMENT",
  "NO_COUNTER_ARGUMENT_WITHOUT_OPPONENT_ARGUMENT",
  "NO_COUNTER_ARGUMENT_WITHOUT_GONGBUHO_CONTEXT",
  "NO_COUNTER_ARGUMENT_WITHOUT_SOURCE_TRACE",
  "NO_COUNTER_ARGUMENT_FROM_UNAPPROVED_SIGNAL",
  "NO_COUNTER_ARGUMENT_FROM_AI_CANDIDATE_MEMORY",
  "NO_COUNTER_ARGUMENT_USE_WITHOUT_BACKFIRE_CHECK",
  "NO_DOCUMENT_USE_WHEN_BACKFIRE_CRITICAL",
  "NO_DRAFT_PARAGRAPH_FROM_CRITICAL_RISK",
  "NO_FINAL_LEGAL_ARGUMENT_BY_AI",
  "NO_FINAL_DOCUMENT_TEXT_BY_AI",
  "NO_DOCUMENT_INSERT_WITHOUT_ADOPTION",
  "NO_REJECTED_PARAGRAPH_DOCUMENT_INSERT",
  "NO_CLIENT_VISIBLE_COUNTER_STRATEGY_BY_DEFAULT",
  "NO_AUTO_FILED_COUNTER_ARGUMENT",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "ADOPTION_AUDIT_REQUIRED",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
  "COUNTER_ARGUMENT_DRAFT_ENGINE_MASTER_VERIFY_REQUIRED",
] as const;

/** RC gate boundaries — all sub-phases must be LOCKED before 63-F RC. */
export const PHASE63F_RC_GATE_BOUNDARY_MARKERS = [
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_63A_OPPONENT_ARGUMENT_LOCK",
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_63B_CANDIDATE_LOCK",
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_63C_BACKFIRE_CHECK_LOCK",
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_63D_DRAFT_PARAGRAPH_LOCK",
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_63E_ADOPTION_LOCK",
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_CONTROL_TOWER_BRAIN_RC",
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_MASTER_VERIFY",
] as const;

export function evaluateCounterArgumentDraftEngineRcGate(input: {
  phase63aOpponentArgumentLocked: boolean;
  phase63bCandidateLocked: boolean;
  phase63cBackfireCheckLocked: boolean;
  phase63dDraftParagraphLocked: boolean;
  phase63eAdoptionLocked: boolean;
  controlTowerBrainRcLocked: boolean;
  evidenceChainComplete: boolean;
  masterVerifyPassed: boolean;
}): { allowed: boolean; blockedBy?: string; reason?: string } {
  if (!input.phase63aOpponentArgumentLocked) {
    return {
      allowed: false,
      blockedBy: "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_63A_OPPONENT_ARGUMENT_LOCK",
      reason: "Phase 63-A opponent argument lock is required.",
    };
  }
  if (!input.phase63bCandidateLocked) {
    return {
      allowed: false,
      blockedBy: "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_63B_CANDIDATE_LOCK",
      reason: "Phase 63-B counter-argument candidate lock is required.",
    };
  }
  if (!input.phase63cBackfireCheckLocked) {
    return {
      allowed: false,
      blockedBy: "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_63C_BACKFIRE_CHECK_LOCK",
      reason: "Phase 63-C backfire risk check lock is required.",
    };
  }
  if (!input.phase63dDraftParagraphLocked) {
    return {
      allowed: false,
      blockedBy: "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_63D_DRAFT_PARAGRAPH_LOCK",
      reason: "Phase 63-D draft paragraph generator lock is required.",
    };
  }
  if (!input.phase63eAdoptionLocked) {
    return {
      allowed: false,
      blockedBy: "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_63E_ADOPTION_LOCK",
      reason: "Phase 63-E lawyer review adoption lock is required.",
    };
  }
  if (!input.controlTowerBrainRcLocked) {
    return {
      allowed: false,
      blockedBy: "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_CONTROL_TOWER_BRAIN_RC",
      reason: "Control Tower Brain RC lock is required.",
    };
  }
  if (!input.evidenceChainComplete) {
    return {
      allowed: false,
      blockedBy: "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITH_BROKEN_EVIDENCE_CHAIN",
      reason: "Counter-Argument Draft Engine evidence chain is incomplete.",
    };
  }
  if (!input.masterVerifyPassed) {
    return {
      allowed: false,
      blockedBy: "NO_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_WITHOUT_MASTER_VERIFY",
      reason: "Master verify script must pass before RC lock.",
    };
  }
  return { allowed: true };
}

export function assertCounterArgumentDraftEngineRcGateAllowed(
  input: Parameters<typeof evaluateCounterArgumentDraftEngineRcGate>[0],
): void {
  const result = evaluateCounterArgumentDraftEngineRcGate(input);
  if (!result.allowed) {
    throw new ValidationError(result.blockedBy ?? "COUNTER_ARGUMENT_DRAFT_ENGINE_RC_BLOCKED");
  }
}
