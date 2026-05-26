/**
 * In-memory Control Tower Brain state (no production DB migration).
 */
import type { BrainDiagnosis } from "./phase60c-conflict-diagnosis.schema";
import type { BrainDetectedIssue } from "./phase60b-error-detection.schema";
import type { BrainPatchPlan } from "./phase60d-patch-plan.schema";

const issues = new Map<string, BrainDetectedIssue>();
const diagnoses = new Map<string, BrainDiagnosis>();
const plans = new Map<string, BrainPatchPlan>();

let lastScanAt: string | undefined;

export function setLastScanAt(iso: string) {
  lastScanAt = iso;
}

export function getLastScanAt(): string | undefined {
  return lastScanAt;
}

export function upsertIssues(items: BrainDetectedIssue[]) {
  for (const item of items) {
    issues.set(item.issueId, item);
  }
}

export function listIssues(): BrainDetectedIssue[] {
  return [...issues.values()].sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
}

export function getIssue(issueId: string): BrainDetectedIssue | undefined {
  return issues.get(issueId);
}

export function upsertDiagnoses(items: BrainDiagnosis[]) {
  for (const item of items) {
    diagnoses.set(item.diagnosisId, item);
  }
}

export function listDiagnoses(): BrainDiagnosis[] {
  return [...diagnoses.values()].sort((a, b) => b.diagnosedAt.localeCompare(a.diagnosedAt));
}

export function upsertPlans(items: BrainPatchPlan[]) {
  for (const item of items) {
    plans.set(item.planId, item);
  }
}

export function listPlans(): BrainPatchPlan[] {
  return [...plans.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPlan(planId: string): BrainPatchPlan | undefined {
  return plans.get(planId);
}

export function approvePlan(planId: string, approvedByUserId: string): BrainPatchPlan | undefined {
  const plan = plans.get(planId);
  if (!plan) {
    return undefined;
  }
  const updated: BrainPatchPlan = {
    ...plan,
    approved: true,
    approvedAt: new Date().toISOString(),
    approvedByUserId,
  };
  plans.set(planId, updated);
  return updated;
}

export function resetControlTowerBrainStoreForTests() {
  issues.clear();
  diagnoses.clear();
  plans.clear();
  lastScanAt = undefined;
}
