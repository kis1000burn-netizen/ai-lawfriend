import { writeAuditLog } from "@/lib/audit-log";
import { assertBrainActionAllowed } from "./phase60a-control-tower-brain-safety.policy";
import { PHASE60A_ONE_LINE_STANDARD } from "./phase60a-control-tower-brain-safety.policy";
import type { BrainPatchPlan } from "./phase60d-patch-plan.schema";
import type { BrainAutoFixResult } from "./phase60e-safe-auto-fix.schema";
import {
  PHASE60E_SAFE_AUTO_FIX_MARKER,
  PHASE60E_SAFE_AUTO_FIX_VERSION,
} from "./phase60e-safe-auto-fix.schema";
import {
  canExecuteSafeAutoFix,
  inferSafeFixType,
} from "./phase60e-safe-auto-fix.policy";

export const CONTROL_TOWER_BRAIN_AUDIT_ACTION = "CONTROL_TOWER_BRAIN_DECISION" as const;

export async function executeControlTowerBrainSafeAutoFix(input: {
  plan: BrainPatchPlan;
  dryRun: boolean;
  actorUserId: string;
}): Promise<BrainAutoFixResult> {
  const fixType = inferSafeFixType(input.plan);
  const gate = assertBrainActionAllowed({
    action: "AUTO_FIX",
    hasHumanApproval: input.plan.approved,
    hasTestPlan: input.plan.testPlan.length > 0,
    hasRollbackPlan: input.plan.rollbackPlan.length > 0,
    touchesProductionCode: input.plan.filesToChange.some((file) => file.startsWith("src/")),
    touchesDatabase: input.plan.filesToChange.some((file) => file.includes("prisma/")),
    touchesLegalLogic: input.plan.filesToChange.some((file) => /legal|gongbuho|case-status/.test(file)),
    touchesSecrets: false,
    touchesClientVisibleOutput: input.plan.filesToChange.some((file) => file.includes("components/")),
  });

  if (!gate.allowed) {
    return {
      marker: PHASE60E_SAFE_AUTO_FIX_MARKER,
      version: PHASE60E_SAFE_AUTO_FIX_VERSION,
      planId: input.plan.planId,
      executed: false,
      dryRun: input.dryRun,
      fixType,
      message: gate.reason ?? "Auto-fix blocked by safety boundary.",
      verificationCommands: input.plan.testPlan,
      rollbackCommands: input.plan.rollbackPlan,
      auditAction: CONTROL_TOWER_BRAIN_AUDIT_ACTION,
      plan: input.plan,
    };
  }

  if (!canExecuteSafeAutoFix(input.plan)) {
    return {
      marker: PHASE60E_SAFE_AUTO_FIX_MARKER,
      version: PHASE60E_SAFE_AUTO_FIX_VERSION,
      planId: input.plan.planId,
      executed: false,
      dryRun: input.dryRun,
      fixType,
      message: "Plan is not SAFE+approved or missing test/rollback plan.",
      verificationCommands: input.plan.testPlan,
      rollbackCommands: input.plan.rollbackPlan,
      auditAction: CONTROL_TOWER_BRAIN_AUDIT_ACTION,
      plan: input.plan,
    };
  }

  if (input.dryRun) {
    return {
      marker: PHASE60E_SAFE_AUTO_FIX_MARKER,
      version: PHASE60E_SAFE_AUTO_FIX_VERSION,
      planId: input.plan.planId,
      executed: false,
      dryRun: true,
      fixType,
      message: "Dry-run only — no repository files were modified.",
      verificationCommands: input.plan.testPlan,
      rollbackCommands: input.plan.rollbackPlan,
      auditAction: CONTROL_TOWER_BRAIN_AUDIT_ACTION,
      plan: input.plan,
    };
  }

  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: CONTROL_TOWER_BRAIN_AUDIT_ACTION,
    entityType: "CONTROL_TOWER_BRAIN_PLAN",
    entityId: input.plan.planId,
    message: `Safe auto-fix recorded (${fixType}) — manual apply recommended for doc/meta changes`,
    metadata: {
      fixType,
      filesToChange: input.plan.filesToChange,
      testPlan: input.plan.testPlan,
      rollbackPlan: input.plan.rollbackPlan,
    },
  });

  return {
    marker: PHASE60E_SAFE_AUTO_FIX_MARKER,
    version: PHASE60E_SAFE_AUTO_FIX_VERSION,
    planId: input.plan.planId,
    executed: true,
    dryRun: false,
    fixType,
    message:
      "Safe auto-fix audit recorded. Doc/meta file writes remain manual — Brain never auto-writes production code.",
    verificationCommands: input.plan.testPlan,
    rollbackCommands: input.plan.rollbackPlan,
    auditAction: CONTROL_TOWER_BRAIN_AUDIT_ACTION,
    plan: input.plan,
  };
}

export function buildControlTowerBrainStatus(input: {
  openIssueCount: number;
  pendingApprovalCount: number;
  safeAutoFixQueueCount: number;
  lastScanAt?: string;
  health: "OK" | "ATTENTION" | "CRITICAL";
}) {
  return {
    marker: "control-tower-brain-status-v1" as const,
    health: input.health,
    openIssueCount: input.openIssueCount,
    pendingApprovalCount: input.pendingApprovalCount,
    safeAutoFixQueueCount: input.safeAutoFixQueueCount,
    lastScanAt: input.lastScanAt,
    oneLineStandard: PHASE60A_ONE_LINE_STANDARD,
  };
}
