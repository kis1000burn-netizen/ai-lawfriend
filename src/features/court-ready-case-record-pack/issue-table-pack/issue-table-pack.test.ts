import { describe, expect, it } from "vitest";
import { buildIssueTablePack } from "./issue-table-pack.service";

describe("issue-table-pack (Phase 44-B)", () => {
  it("marks issueTablePackReady when required items defined", () => {
    const result = buildIssueTablePack();
    expect(result.issueTablePackReady).toBe(true);
    expect(result.lawyerReviewRequired).toBe(true);
  });
});
