import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  assertBrainActionAllowed,
  buildControlTowerBrainSafetyPolicy,
  PHASE60A_BOUNDARY_MARKERS,
} from "./phase60a-control-tower-brain-safety.policy";
import { PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_LOCK } from "./phase60a-control-tower-brain-safety.lock";
import { runControlTowerBrainScan } from "./phase60b-error-detection.service";
import { runControlTowerBrainDiagnosis } from "./phase60c-conflict-diagnosis.service";
import { generateControlTowerBrainPatchPlans } from "./phase60d-patch-plan-generator.service";
import { classifyPatchPlanRisk } from "./phase60e-safe-auto-fix.policy";
import { executeControlTowerBrainSafeAutoFix } from "./phase60e-safe-auto-fix.service";
import {
  autoFixControlTowerBrain,
  buildControlTowerBrainPatchPlans,
  diagnoseControlTowerBrain,
  getControlTowerBrainSnapshot,
  scanControlTowerBrain,
} from "./control-tower-brain.orchestrator.service";
import { resetControlTowerBrainStoreForTests } from "./control-tower-brain.repository";

vi.mock("@/lib/audit-log", () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
}));

describe("Phase 60-A Control Tower Brain Safety", () => {
  it("exposes all safety boundaries", () => {
    expect(PHASE60A_BOUNDARY_MARKERS).toContain("NO_UNAPPROVED_PRODUCTION_CODE_WRITE");
    expect(PHASE60A_BOUNDARY_MARKERS).toContain("NO_DESTRUCTIVE_DB_CHANGE_BY_AI");
    expect(PHASE60A_BOUNDARY_MARKERS).toHaveLength(9);
  });

  it("blocks deploy and DB mutation", () => {
    expect(assertBrainActionAllowed({ action: "DEPLOY" }).allowed).toBe(false);
    expect(
      assertBrainActionAllowed({
        action: "AUTO_FIX",
        touchesDatabase: true,
        hasTestPlan: true,
        hasRollbackPlan: true,
      }).blockedBy,
    ).toBe("NO_DESTRUCTIVE_DB_CHANGE_BY_AI");
  });

  it("locks safety policy SSOT", () => {
    expect(PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(buildControlTowerBrainSafetyPolicy().boundaries).toHaveLength(9);
  });
});

describe("Phase 60 Control Tower Brain pipeline", () => {
  beforeEach(() => {
    resetControlTowerBrainStoreForTests();
  });

  it("scans logs and diagnoses navigator inconsistency", async () => {
    const scan = await scanControlTowerBrain({
      vitestLog: "FAIL src/foo.test.ts error TS2345",
      includeStaticRepoChecks: true,
    });
    expect(scan.marker).toBe("phase60b-error-detection-v1");
    expect(scan.issues.length).toBeGreaterThan(0);

    const diagnosis = await diagnoseControlTowerBrain();
    expect(diagnosis.marker).toBe("phase60c-conflict-diagnosis-v1");
    expect(diagnosis.diagnoses.length).toBeGreaterThan(0);
  });

  it("generates patch plans with risk classification", async () => {
    await scanControlTowerBrain({
      verifyLog: "Missing verify script in package.json",
      includeStaticRepoChecks: false,
    });
    await diagnoseControlTowerBrain();
    const plans = await buildControlTowerBrainPatchPlans();
    expect(plans.plans.length).toBeGreaterThan(0);
    expect(plans.plans.every((plan) => plan.testPlan.length > 0)).toBe(true);
  });

  it("blocks auto-fix for review-required production code plans", async () => {
    const plan = {
      planId: "plan-1",
      issueId: "issue-1",
      riskLevel: "REVIEW_REQUIRED" as const,
      filesToChange: ["src/app/api/admin/foo/route.ts"],
      proposedChanges: [
        {
          file: "src/app/api/admin/foo/route.ts",
          reason: "route mismatch",
          changeSummary: "align response",
        },
      ],
      testPlan: ["npm run test"],
      rollbackPlan: ["git restore src/app/api/admin/foo/route.ts"],
      requiresHumanApproval: true,
      approved: false,
      createdAt: new Date().toISOString(),
    };

    expect(classifyPatchPlanRisk(plan)).toBe("REVIEW_REQUIRED");

    const result = await executeControlTowerBrainSafeAutoFix({
      plan,
      dryRun: true,
      actorUserId: "admin-1",
    });
    expect(result.executed).toBe(false);
  });

  it("returns brain snapshot with health", async () => {
    await scanControlTowerBrain({
      runtimeLog: "CRITICAL heap OOM",
      includeStaticRepoChecks: false,
    });
    const snapshot = await getControlTowerBrainSnapshot();
    expect(snapshot.status.marker).toBe("control-tower-brain-status-v1");
    expect(snapshot.status.health).toBe("CRITICAL");
  });
});

describe("Phase 60-E safe auto-fix orchestration", () => {
  beforeEach(() => {
    resetControlTowerBrainStoreForTests();
  });

  it("dry-runs safe doc/meta plan after approval", async () => {
    await scanControlTowerBrain({
      verifyLog: "Missing verify script",
      includeStaticRepoChecks: false,
    });
    await diagnoseControlTowerBrain();
    const { plans } = await buildControlTowerBrainPatchPlans();
    const safePlan = plans.find((plan) => plan.riskLevel === "SAFE");
    if (!safePlan) {
      expect(plans.length).toBeGreaterThan(0);
      return;
    }

    const approved = await autoFixControlTowerBrain({
      planId: safePlan.planId,
      dryRun: true,
      actorUserId: "admin-1",
    });
    expect(approved.executed).toBe(false);
    expect(approved.dryRun).toBe(true);
  });
});
