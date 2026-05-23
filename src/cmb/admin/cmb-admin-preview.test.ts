import { describe, expect, it } from "vitest";
import {
  buildCmbAdminCasePreview,
  buildCmbAdminGlobalVerifySummary,
  listCmbAdminListItems,
} from "@/cmb/admin/cmb-admin-preview";

describe("cmb-admin-preview", () => {
  it("목록에 Gongbuho 5종 caseType 이 포함된다", () => {
    const items = listCmbAdminListItems();
    expect(items.length).toBe(5);
    expect(items.every((i) => i.validationOk)).toBe(true);
    expect(items.find((i) => i.caseType === "WAGE_BACKPAY")?.previewHref).toBe(
      "/admin/cmb/case-types/WAGE_BACKPAY",
    );
  });

  it("global verify summary 는 PASS 한다", () => {
    const summary = buildCmbAdminGlobalVerifySummary();
    expect(summary.ok).toBe(true);
    expect(summary.command).toBe("npm run verify:aibeopchin-cmb");
  });

  it("case preview 는 LOCKED · preview-only 를 표시한다", () => {
    const preview = buildCmbAdminCasePreview("FRAUD");
    expect(preview).not.toBeNull();
    expect(preview!.isEditable).toBe(false);
    expect(preview!.lockNotice).toContain("LOCKED");
    expect(preview!.questionSet.found).toBe(true);
    expect(preview!.roleBlocks.CLIENT).not.toContain("admin-audit-trail");
  });
});
