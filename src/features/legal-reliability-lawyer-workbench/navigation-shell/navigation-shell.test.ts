import { describe, expect, it } from "vitest";
import { buildLawyerWorkbenchNavigationShell } from "./navigation-shell.service";

describe("navigation-shell (Phase 48-A)", () => {
  it("marks lawyerWorkbenchNavigationShellReady when required items defined", () => {
    const result = buildLawyerWorkbenchNavigationShell();
    expect(result.lawyerWorkbenchNavigationShellReady).toBe(true);
    expect(result.uiRoute).toContain("lawyer-workbench");
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
