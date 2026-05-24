import { describe, expect, it } from "vitest";
import { buildOperatorTrainingAdminPlaybook } from "./operator-training-admin-playbook.service";
import { OPERATOR_TRAINING_MODULES } from "./operator-training-admin-playbook.registry";

describe("operator-training-admin-playbook (Phase 25-C)", () => {
  it("defines operator training modules with admin paths", () => {
    expect(OPERATOR_TRAINING_MODULES.some((m) => m.adminPath === "/admin/tenants")).toBe(true);
    expect(OPERATOR_TRAINING_MODULES.some((m) => m.adminPath === "/admin/operations/monitoring")).toBe(
      true,
    );
  });

  it("marks operator ready when all required modules trained", () => {
    const result = buildOperatorTrainingAdminPlaybook({
      trainedModuleIds: OPERATOR_TRAINING_MODULES.map((m) => m.moduleId),
    });
    expect(result.operatorReady).toBe(true);
    expect(result.trainingCompletionRate).toBe(100);
  });
});
