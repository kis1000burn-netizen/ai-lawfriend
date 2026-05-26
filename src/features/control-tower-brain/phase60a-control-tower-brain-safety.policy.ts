/**
 * Product Phase 60-A — Control Tower Brain safety boundary SSOT.
 */
import type { BrainSafetyBoundary, BrainSafetyPolicy } from "./phase60a-control-tower-brain-safety.schema";
import {
  PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_MARKER,
  PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_VERSION,
} from "./phase60a-control-tower-brain-safety.schema";

export const PHASE60A_BOUNDARY_MARKERS: readonly BrainSafetyBoundary[] = [
  "NO_UNAPPROVED_PRODUCTION_CODE_WRITE",
  "NO_DESTRUCTIVE_DB_CHANGE_BY_AI",
  "NO_AUTO_LEGAL_LOGIC_CHANGE_WITHOUT_REVIEW",
  "NO_SECRET_ACCESS_BY_AI",
  "NO_CLIENT_DATA_EXFILTRATION",
  "NO_AUTO_DEPLOY_TO_PRODUCTION",
  "NO_PATCH_WITHOUT_TEST_PLAN",
  "NO_FIX_WITHOUT_ROLLBACK_PLAN",
  "AUDIT_EVERY_BRAIN_DECISION",
] as const;

export const PHASE60A_ONE_LINE_STANDARD =
  "Control Tower Brain은 오류·충돌·증빙 불일치를 탐지·진단·수정안·검증·rollback 계획까지 생성하되, production code·DB·법률 판단·client-visible output·deployment는 승인 게이트와 audit 없이 변경하지 않는다." as const;

export function buildControlTowerBrainSafetyPolicy(): BrainSafetyPolicy {
  return {
    marker: PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_MARKER,
    version: PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_VERSION,
    oneLineStandard: PHASE60A_ONE_LINE_STANDARD,
    boundaries: [...PHASE60A_BOUNDARY_MARKERS],
  };
}

export function assertBrainActionAllowed(input: {
  action: "SCAN" | "DIAGNOSE" | "PATCH_PLAN" | "AUTO_FIX" | "APPROVE" | "DEPLOY";
  hasHumanApproval?: boolean;
  hasTestPlan?: boolean;
  hasRollbackPlan?: boolean;
  touchesProductionCode?: boolean;
  touchesDatabase?: boolean;
  touchesLegalLogic?: boolean;
  touchesSecrets?: boolean;
  touchesClientVisibleOutput?: boolean;
}): { allowed: boolean; blockedBy?: BrainSafetyBoundary; reason?: string } {
  if (input.action === "DEPLOY") {
    return {
      allowed: false,
      blockedBy: "NO_AUTO_DEPLOY_TO_PRODUCTION",
      reason: "Brain cannot deploy to production.",
    };
  }

  if (input.touchesSecrets) {
    return {
      allowed: false,
      blockedBy: "NO_SECRET_ACCESS_BY_AI",
      reason: "Brain cannot access secrets.",
    };
  }

  if (input.touchesDatabase) {
    return {
      allowed: false,
      blockedBy: "NO_DESTRUCTIVE_DB_CHANGE_BY_AI",
      reason: "Brain cannot mutate database or run migrations.",
    };
  }

  if (input.touchesLegalLogic && !input.hasHumanApproval) {
    return {
      allowed: false,
      blockedBy: "NO_AUTO_LEGAL_LOGIC_CHANGE_WITHOUT_REVIEW",
      reason: "Legal logic changes require human approval.",
    };
  }

  if (input.touchesClientVisibleOutput && !input.hasHumanApproval) {
    return {
      allowed: false,
      blockedBy: "NO_CLIENT_DATA_EXFILTRATION",
      reason: "Client-visible output changes require human approval.",
    };
  }

  if (
    (input.action === "AUTO_FIX" || input.action === "APPROVE") &&
    input.touchesProductionCode &&
    !input.hasHumanApproval
  ) {
    return {
      allowed: false,
      blockedBy: "NO_UNAPPROVED_PRODUCTION_CODE_WRITE",
      reason: "Production code writes require human approval.",
    };
  }

  if (input.action === "AUTO_FIX" && !input.hasTestPlan) {
    return {
      allowed: false,
      blockedBy: "NO_PATCH_WITHOUT_TEST_PLAN",
      reason: "Auto-fix requires a test plan.",
    };
  }

  if (input.action === "AUTO_FIX" && !input.hasRollbackPlan) {
    return {
      allowed: false,
      blockedBy: "NO_FIX_WITHOUT_ROLLBACK_PLAN",
      reason: "Auto-fix requires a rollback plan.",
    };
  }

  return { allowed: true };
}
