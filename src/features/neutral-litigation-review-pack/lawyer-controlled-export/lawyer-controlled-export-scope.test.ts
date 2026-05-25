import { describe, expect, it } from "vitest";
import { buildLawyerControlledExportScope } from "./lawyer-controlled-export-scope.service";

describe("lawyer-controlled-export-scope (Phase 46-C)", () => {
  it("marks lawyerControlledExportScopeReady when required items defined", () => {
    const result = buildLawyerControlledExportScope();
    expect(result.lawyerControlledExportScopeReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
