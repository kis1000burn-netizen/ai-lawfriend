import { describe, expect, it } from "vitest";

import {
  CMB_PHASE6H_OPERATIONS_STUDIO_POLICY_MARKER,
  pickCmbOperationsBottleneckStage,
} from "@/cmb/ops/cmb-operations-studio-policy";
import {
  assertCmbOperationsStudioDashboardMetaOnly,
  CMB_PHASE6H_OPERATIONS_STUDIO_SERVICE_MARKER,
} from "@/cmb/ops/cmb-operations-studio.service";

describe("cmb-operations-studio (Phase 6-H)", () => {
  it("exposes policy marker", () => {
    expect(CMB_PHASE6H_OPERATIONS_STUDIO_POLICY_MARKER).toBe("PHASE6H_CMB_OPERATIONS_STUDIO");
  });

  it("exposes service marker", () => {
    expect(CMB_PHASE6H_OPERATIONS_STUDIO_SERVICE_MARKER).toBe("phase6h-cmb-operations-studio");
  });

  it("picks bottleneck by max queue count", () => {
    expect(
      pickCmbOperationsBottleneckStage({
        DRAFT_REVIEW_QUEUE: 1,
        VERIFY_PASS_AWAITING_LOCK: 5,
        LOCKED_AWAITING_PUBLISH: 2,
        CASE_TYPE_NO_PUBLISHED: 0,
      }),
    ).toBe("VERIFY_PASS_AWAITING_LOCK");
  });

  it("rejects configJson in dashboard snapshot", () => {
    const bad = { configJson: { x: 1 } };
    expect(() =>
      assertCmbOperationsStudioDashboardMetaOnly(bad as never),
    ).toThrow(/configJson/);
  });
});
