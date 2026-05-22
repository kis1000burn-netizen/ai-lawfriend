import { describe, expect, it } from "vitest";
import { isAllowedStaffAdminPath } from "@/lib/auth/ops-admin-paths";

describe("isAllowedStaffAdminPath (alias)", () => {
  it("허용 경로 및 하위 경로를 통과시킨다", () => {
    expect(isAllowedStaffAdminPath("/admin/alerts/ops-queue")).toBe(true);
    expect(isAllowedStaffAdminPath("/admin/alerts/ops-queue/123")).toBe(true);
    expect(isAllowedStaffAdminPath("/admin/alerts/ops-dashboard")).toBe(true);
    expect(isAllowedStaffAdminPath("/admin/audit-logs")).toBe(true);
    expect(isAllowedStaffAdminPath("/admin/audit-logs/detail/1")).toBe(true);
    expect(isAllowedStaffAdminPath("/admin/question-sets")).toBe(true);
    expect(isAllowedStaffAdminPath("/admin/question-sets/x")).toBe(true);
    expect(isAllowedStaffAdminPath("/admin/gongbuho")).toBe(true);
    expect(isAllowedStaffAdminPath("/admin/gongbuho/cuid123")).toBe(true);
  });

  it("느슨한 prefix 허용을 막는다", () => {
    expect(isAllowedStaffAdminPath("/admin/alerts/ops")).toBe(false);
    expect(isAllowedStaffAdminPath("/admin/users")).toBe(false);
    expect(isAllowedStaffAdminPath("/admin/system")).toBe(false);
  });
});
