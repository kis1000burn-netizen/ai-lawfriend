import { randomUUID } from "node:crypto";
import type { BrainDiagnosis } from "./phase60c-conflict-diagnosis.schema";
import type { BrainDetectedIssue } from "./phase60b-error-detection.schema";
import type { BrainPatchPlan, BrainPatchPlanResult } from "./phase60d-patch-plan.schema";
import {
  PHASE60D_PATCH_PLAN_MARKER,
  PHASE60D_PATCH_PLAN_VERSION,
} from "./phase60d-patch-plan.schema";
import { classifyPatchPlanRisk } from "./phase60e-safe-auto-fix.policy";

function buildPlanForIssue(issue: BrainDetectedIssue, diagnosis?: BrainDiagnosis): BrainPatchPlan {
  const filesToChange = issue.files.length > 0 ? issue.files : ["docs/project-governance/IMPLEMENTATION_EVIDENCE.md"];

  const proposedChanges = filesToChange.map((file) => ({
    file,
    reason: diagnosis?.likelyRootCause ?? issue.summary,
    changeSummary:
      issue.source === "NAVIGATOR"
        ? "Sync navigator phase status with evidence"
        : issue.source === "VERIFY"
          ? "Register verify script and evidence tag"
          : issue.source === "EVIDENCE"
            ? "Add or update IMPLEMENTATION_EVIDENCE block"
            : "Apply minimal safe fix aligned with phase boundary",
  }));

  const draft: BrainPatchPlan = {
    planId: randomUUID(),
    issueId: issue.issueId,
    diagnosisId: diagnosis?.diagnosisId,
    riskLevel: "REVIEW_REQUIRED",
    filesToChange,
    proposedChanges,
    testPlan: [
      issue.source === "TEST" ? "npm run test -- <target-test>" : "npm run test",
      "npm run verify:aibeopchin-control-tower-brain-rc",
    ],
    rollbackPlan: ["git restore <files>", "Re-run verify scripts to confirm rollback"],
    requiresHumanApproval: true,
    approved: false,
    createdAt: new Date().toISOString(),
  };

  const riskLevel = classifyPatchPlanRisk(draft);
  return {
    ...draft,
    riskLevel,
    requiresHumanApproval: riskLevel !== "SAFE",
  };
}

export function generateControlTowerBrainPatchPlans(input: {
  issues: BrainDetectedIssue[];
  diagnoses: BrainDiagnosis[];
}): BrainPatchPlanResult {
  const diagnosisByIssue = new Map(input.diagnoses.map((d) => [d.issueId, d]));
  const plans = input.issues.map((issue) =>
    buildPlanForIssue(issue, diagnosisByIssue.get(issue.issueId)),
  );

  return {
    marker: PHASE60D_PATCH_PLAN_MARKER,
    version: PHASE60D_PATCH_PLAN_VERSION,
    generatedAt: new Date().toISOString(),
    plans,
  };
}
