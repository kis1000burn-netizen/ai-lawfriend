import type { BrainScanInput } from "./phase60b-error-detection.schema";
import { runControlTowerBrainScan } from "./phase60b-error-detection.service";
import { runControlTowerBrainDiagnosis } from "./phase60c-conflict-diagnosis.service";
import { generateControlTowerBrainPatchPlans } from "./phase60d-patch-plan-generator.service";
import {
  approvePlan,
  getLastScanAt,
  getPlan,
  listDiagnoses,
  listIssues,
  listPlans,
  setLastScanAt,
  upsertDiagnoses,
  upsertIssues,
  upsertPlans,
} from "./control-tower-brain.repository";
import {
  buildControlTowerBrainStatus,
  executeControlTowerBrainSafeAutoFix,
} from "./phase60e-safe-auto-fix.service";

export const CONTROL_TOWER_BRAIN_ORCHESTRATOR_MARKER =
  "control-tower-brain-orchestrator-v1" as const;

export async function scanControlTowerBrain(input: BrainScanInput) {
  const result = runControlTowerBrainScan(input);
  upsertIssues(result.issues);
  setLastScanAt(result.scannedAt);
  return result;
}

export async function diagnoseControlTowerBrain(issueIds?: string[]) {
  const issues = listIssues().filter((issue) =>
    issueIds?.length ? issueIds.includes(issue.issueId) : true,
  );
  const result = runControlTowerBrainDiagnosis(issues);
  upsertDiagnoses(result.diagnoses);
  return result;
}

export async function buildControlTowerBrainPatchPlans(issueIds?: string[], diagnosisIds?: string[]) {
  const issues = listIssues().filter((issue) =>
    issueIds?.length ? issueIds.includes(issue.issueId) : true,
  );
  const diagnoses = listDiagnoses().filter((d) =>
    diagnosisIds?.length ? diagnosisIds.includes(d.diagnosisId) : issues.some((i) => i.issueId === d.issueId),
  );
  const result = generateControlTowerBrainPatchPlans({ issues, diagnoses });
  upsertPlans(result.plans);
  return result;
}

export async function approveControlTowerBrainPatch(planId: string, approvedByUserId: string) {
  return approvePlan(planId, approvedByUserId);
}

export async function autoFixControlTowerBrain(input: {
  planId: string;
  dryRun: boolean;
  actorUserId: string;
}) {
  const plan = getPlan(input.planId);
  if (!plan) {
    throw new Error("Patch plan not found.");
  }
  return executeControlTowerBrainSafeAutoFix({
    plan,
    dryRun: input.dryRun,
    actorUserId: input.actorUserId,
  });
}

export async function getControlTowerBrainSnapshot() {
  const issues = listIssues();
  const plans = listPlans();
  const pendingApprovalCount = plans.filter((p) => p.requiresHumanApproval && !p.approved).length;
  const safeAutoFixQueueCount = plans.filter((p) => p.riskLevel === "SAFE" && !p.approved).length;
  const criticalCount = issues.filter((i) => i.severity === "CRITICAL").length;
  const highCount = issues.filter((i) => i.severity === "HIGH").length;

  const health =
    criticalCount > 0 ? "CRITICAL" : highCount > 0 || pendingApprovalCount > 0 ? "ATTENTION" : "OK";

  return {
    orchestratorMarker: CONTROL_TOWER_BRAIN_ORCHESTRATOR_MARKER,
    status: buildControlTowerBrainStatus({
      openIssueCount: issues.length,
      pendingApprovalCount,
      safeAutoFixQueueCount,
      lastScanAt: getLastScanAt(),
      health,
    }),
    issues,
    diagnoses: listDiagnoses(),
    plans,
  };
}
