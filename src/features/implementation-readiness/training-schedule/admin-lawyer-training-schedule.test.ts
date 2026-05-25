import { describe, expect, it } from "vitest";
import { buildAdminLawyerTrainingSchedule } from "./admin-lawyer-training-schedule.service";

describe("admin-lawyer-training-schedule (Phase 36-C)", () => {
  it("marks adminLawyerTrainingReady when required modules defined", () => {
    const result = buildAdminLawyerTrainingSchedule();
    expect(result.adminLawyerTrainingReady).toBe(true);
  });
});
