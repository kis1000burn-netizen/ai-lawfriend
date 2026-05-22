import { describe, expect, it } from "vitest";
import { deriveGongbuhoPacketLifecycleUi } from "@/features/gongbuho/admin-gongbuho-lifecycle-ui";

describe("deriveGongbuhoPacketLifecycleUi", () => {
  it("STAFF 에는 라이프사이클 버튼 미노출·안내 배너", () => {
    const ui = deriveGongbuhoPacketLifecycleUi({
      status: "DRAFT",
      viewerCanMutateLifecycle: false,
    });
    expect(ui.staffReadOnlyBanner).toContain("ADMIN");
    expect(ui.approve.showButton).toBe(false);
    expect(ui.archive.showButton).toBe(false);
  });

  it("플랫폼 관리자 + DRAFT: 승인 가능·보관 가능", () => {
    const ui = deriveGongbuhoPacketLifecycleUi({
      status: "DRAFT",
      viewerCanMutateLifecycle: true,
    });
    expect(ui.staffReadOnlyBanner).toBeNull();
    expect(ui.approve.showButton && !ui.approve.disabled).toBe(true);
    expect(ui.archive.showButton && !ui.archive.disabled).toBe(true);
  });

  it("플랫폼 관리자 + REVIEW: 승인 가능", () => {
    const ui = deriveGongbuhoPacketLifecycleUi({
      status: "REVIEW",
      viewerCanMutateLifecycle: true,
    });
    expect(ui.approve.disabled).toBe(false);
    expect(ui.archive.disabled).toBe(false);
  });

  it("APPROVED: 승인 버튼은 비활성·설명 제공, 보관은 가능", () => {
    const ui = deriveGongbuhoPacketLifecycleUi({
      status: "APPROVED",
      viewerCanMutateLifecycle: true,
    });
    expect(ui.approve.disabled).toBe(true);
    expect(ui.approve.isInformationalApproved).toBe(true);
    expect(ui.archive.disabled).toBe(false);
  });

  it("ARCHIVED: 플랫폼 관리자 UI에서 승인·보관 버튼 로컬 비활성(보관은 API 멱등)", () => {
    const ui = deriveGongbuhoPacketLifecycleUi({
      status: "ARCHIVED",
      viewerCanMutateLifecycle: true,
    });
    expect(ui.approve.disabled).toBe(true);
    expect(ui.archive.disabled).toBe(true);
    expect(ui.archive.isAlreadyArchived).toBe(true);
  });
});
