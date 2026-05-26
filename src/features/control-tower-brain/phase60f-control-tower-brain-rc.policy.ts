/**
 * Product Phase 60-F — Control Tower Brain RC policy SSOT.
 */
import type { BrainSafetyBoundary } from "./phase60a-control-tower-brain-safety.schema";
import { PHASE60A_BOUNDARY_MARKERS } from "./phase60a-control-tower-brain-safety.policy";

export const PHASE60F_CONTROL_TOWER_BRAIN_RC_POLICY_MARKER =
  "phase60f-control-tower-brain-rc-policy-v1" as const;

export const PHASE60F_RC_GATE_BOUNDARY_MARKERS = [
  "NO_CONTROL_TOWER_RC_WITHOUT_60A_SAFETY_LOCK",
  "NO_CONTROL_TOWER_RC_WITHOUT_60B_ERROR_DETECTION",
  "NO_CONTROL_TOWER_RC_WITHOUT_60C_CONFLICT_DIAGNOSIS",
  "NO_CONTROL_TOWER_RC_WITHOUT_60D_PATCH_PLAN_GENERATOR",
  "NO_CONTROL_TOWER_RC_WITHOUT_60E_SAFE_AUTO_FIX",
  "NO_CONTROL_TOWER_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_CONTROL_TOWER_RC_WITHOUT_MASTER_VERIFY",
] as const;

export const PHASE60F_CONSOLIDATED_RC_BOUNDARY_MARKERS = [
  ...PHASE60A_BOUNDARY_MARKERS,
  "CONTROL_TOWER_BRAIN_MASTER_VERIFY_REQUIRED",
  "HUMAN_APPROVAL_GATE_REQUIRED_FOR_RISK_PATCH",
  "NO_AUTO_FIX_WITHOUT_AUDIT",
] as const satisfies readonly (BrainSafetyBoundary | string)[];

export function evaluateControlTowerBrainRcGate(input: {
  phase60aSafetyLocked: boolean;
  phase60bErrorDetectionLocked: boolean;
  phase60cConflictDiagnosisLocked: boolean;
  phase60dPatchPlanLocked: boolean;
  phase60eSafeAutoFixLocked: boolean;
  evidenceChainComplete: boolean;
  masterVerifyPassed: boolean;
}): { allowed: boolean; blockedBy?: string; reason?: string } {
  if (!input.phase60aSafetyLocked) {
    return {
      allowed: false,
      blockedBy: "NO_CONTROL_TOWER_RC_WITHOUT_60A_SAFETY_LOCK",
      reason: "Phase 60-A safety boundary lock is required.",
    };
  }
  if (!input.phase60bErrorDetectionLocked) {
    return {
      allowed: false,
      blockedBy: "NO_CONTROL_TOWER_RC_WITHOUT_60B_ERROR_DETECTION",
      reason: "Phase 60-B error detection is required.",
    };
  }
  if (!input.phase60cConflictDiagnosisLocked) {
    return {
      allowed: false,
      blockedBy: "NO_CONTROL_TOWER_RC_WITHOUT_60C_CONFLICT_DIAGNOSIS",
      reason: "Phase 60-C conflict diagnosis is required.",
    };
  }
  if (!input.phase60dPatchPlanLocked) {
    return {
      allowed: false,
      blockedBy: "NO_CONTROL_TOWER_RC_WITHOUT_60D_PATCH_PLAN_GENERATOR",
      reason: "Phase 60-D patch plan generator is required.",
    };
  }
  if (!input.phase60eSafeAutoFixLocked) {
    return {
      allowed: false,
      blockedBy: "NO_CONTROL_TOWER_RC_WITHOUT_60E_SAFE_AUTO_FIX",
      reason: "Phase 60-E safe auto-fix executor is required.",
    };
  }
  if (!input.evidenceChainComplete) {
    return {
      allowed: false,
      blockedBy: "NO_CONTROL_TOWER_RC_WITH_BROKEN_EVIDENCE_CHAIN",
      reason: "Control Tower Brain evidence chain is incomplete.",
    };
  }
  if (!input.masterVerifyPassed) {
    return {
      allowed: false,
      blockedBy: "NO_CONTROL_TOWER_RC_WITHOUT_MASTER_VERIFY",
      reason: "Master verify script must pass before RC lock.",
    };
  }
  return { allowed: true };
}

export function assertControlTowerBrainRcGateAllowed(
  input: Parameters<typeof evaluateControlTowerBrainRcGate>[0],
): void {
  const result = evaluateControlTowerBrainRcGate(input);
  if (!result.allowed) {
    throw new Error(result.blockedBy ?? "CONTROL_TOWER_BRAIN_RC_BLOCKED");
  }
}
