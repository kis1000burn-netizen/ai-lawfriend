/**
 * Product Phase 62-F — Evidence Gap Auto Planner RC policy SSOT.
 */
import { ValidationError } from "@/lib/errors";
import { evaluateClientVisiblePayloadMessage } from "./phase62e-client-send-gate.policy";

export const PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_POLICY_MARKER =
  "phase62f-evidence-gap-auto-planner-rc-policy-v1" as const;

/** Consolidated RC boundaries — 62-A~62-E unified for 62-F lock. */
export const PHASE62F_CONSOLIDATED_RC_BOUNDARY_MARKERS = [
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
  "NO_EVIDENCE_GAP_WITHOUT_SOURCE_TRACE",
  "NO_AI_FINAL_EVIDENCE_JUDGMENT",
  "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
  "NO_AUTO_SUPPLEMENT_REQUEST_FROM_DETECTION",
  "NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT",
  "NO_PORTAL_SYNC_WITHOUT_LAWYER_APPROVAL",
  "NO_AUTO_SEND_AFTER_PORTAL_SYNC",
  "NO_CLIENT_VISIBLE_WITHOUT_FINAL_LAWYER_APPROVAL",
  "NO_SEND_WITHOUT_SEND_GATE",
  "NO_NOTIFICATION_WITHOUT_MESSAGE_POLICY",
  "NO_AUTO_LITIGATION_TASK_EXECUTION",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "CLIENT_VISIBLE_PAYLOAD_AUDIT_REQUIRED",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
  "EVIDENCE_GAP_AUTO_PLANNER_MASTER_VERIFY_REQUIRED",
] as const;

/** RC gate boundaries — all sub-phases must be LOCKED before 62-F RC. */
export const PHASE62F_RC_GATE_BOUNDARY_MARKERS = [
  "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62A_CANDIDATE_LOCK",
  "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62B_DETECTION_LOCK",
  "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62C_DRAFT_LOCK",
  "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62D_PORTAL_SYNC_LOCK",
  "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62E_SEND_GATE_LOCK",
  "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_CONTROL_TOWER_BRAIN_RC",
  "NO_EVIDENCE_GAP_PLANNER_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_MASTER_VERIFY",
] as const;

export function evaluateEvidenceGapAutoPlannerRcGate(input: {
  phase62aCandidateLocked: boolean;
  phase62bDetectionLocked: boolean;
  phase62cDraftLocked: boolean;
  phase62dPortalSyncLocked: boolean;
  phase62eSendGateLocked: boolean;
  controlTowerBrainRcLocked: boolean;
  evidenceChainComplete: boolean;
  masterVerifyPassed: boolean;
}): { allowed: boolean; blockedBy?: string; reason?: string } {
  if (!input.phase62aCandidateLocked) {
    return {
      allowed: false,
      blockedBy: "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62A_CANDIDATE_LOCK",
      reason: "Phase 62-A evidence gap candidate lock is required.",
    };
  }
  if (!input.phase62bDetectionLocked) {
    return {
      allowed: false,
      blockedBy: "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62B_DETECTION_LOCK",
      reason: "Phase 62-B evidence gap detection engine lock is required.",
    };
  }
  if (!input.phase62cDraftLocked) {
    return {
      allowed: false,
      blockedBy: "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62C_DRAFT_LOCK",
      reason: "Phase 62-C supplement request draft lock is required.",
    };
  }
  if (!input.phase62dPortalSyncLocked) {
    return {
      allowed: false,
      blockedBy: "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62D_PORTAL_SYNC_LOCK",
      reason: "Phase 62-D lawyer approval portal sync lock is required.",
    };
  }
  if (!input.phase62eSendGateLocked) {
    return {
      allowed: false,
      blockedBy: "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_62E_SEND_GATE_LOCK",
      reason: "Phase 62-E client-visible send gate lock is required.",
    };
  }
  if (!input.controlTowerBrainRcLocked) {
    return {
      allowed: false,
      blockedBy: "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_CONTROL_TOWER_BRAIN_RC",
      reason: "Control Tower Brain RC lock is required.",
    };
  }
  if (!input.evidenceChainComplete) {
    return {
      allowed: false,
      blockedBy: "NO_EVIDENCE_GAP_PLANNER_RC_WITH_BROKEN_EVIDENCE_CHAIN",
      reason: "Evidence Gap Auto Planner evidence chain is incomplete.",
    };
  }
  if (!input.masterVerifyPassed) {
    return {
      allowed: false,
      blockedBy: "NO_EVIDENCE_GAP_PLANNER_RC_WITHOUT_MASTER_VERIFY",
      reason: "Master verify script must pass before RC lock.",
    };
  }
  return { allowed: true };
}

export function assertEvidenceGapAutoPlannerRcGateAllowed(
  input: Parameters<typeof evaluateEvidenceGapAutoPlannerRcGate>[0],
): void {
  const result = evaluateEvidenceGapAutoPlannerRcGate(input);
  if (!result.allowed) {
    throw new ValidationError(result.blockedBy ?? "EVIDENCE_GAP_AUTO_PLANNER_RC_BLOCKED");
  }
}

export function evaluateEvidenceGapPlannerClientPayloadForRc(message: string): {
  allowed: boolean;
  blockedBy?: (typeof PHASE62F_CONSOLIDATED_RC_BOUNDARY_MARKERS)[number];
} {
  const result = evaluateClientVisiblePayloadMessage(message);
  if (!result.allowed) {
    return {
      allowed: false,
      blockedBy: "NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT",
    };
  }
  return { allowed: true };
}
