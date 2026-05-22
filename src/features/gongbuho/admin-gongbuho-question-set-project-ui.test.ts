import { describe, expect, it } from "vitest";
import { deriveGongbuhoQuestionSetProjectPanelUi } from "./admin-gongbuho-question-set-project-ui";

describe("deriveGongbuhoQuestionSetProjectPanelUi", () => {
  it("STAFF → 저장 버튼 숨김·안내", () => {
    const ui = deriveGongbuhoQuestionSetProjectPanelUi({
      status: "APPROVED",
      viewerCanProjectQuestionSet: false,
      linkedQuestionSetId: null,
      previewFlowOk: true,
    });
    expect(ui.staffReadOnlyBanner).not.toBeNull();
    expect(ui.project.showButton).toBe(false);
  });

  it("ADMIN APPROVED·미링크·프리뷰 ok → 활성 버튼", () => {
    const ui = deriveGongbuhoQuestionSetProjectPanelUi({
      status: "APPROVED",
      viewerCanProjectQuestionSet: true,
      linkedQuestionSetId: null,
      previewFlowOk: true,
    });
    expect(ui.staffReadOnlyBanner).toBeNull();
    expect(ui.project.showButton).toBe(true);
    expect(ui.project.disabled).toBe(false);
  });

  it("DRAFT + ADMIN → 비활성", () => {
    const ui = deriveGongbuhoQuestionSetProjectPanelUi({
      status: "DRAFT",
      viewerCanProjectQuestionSet: true,
      linkedQuestionSetId: null,
      previewFlowOk: true,
    });
    expect(ui.project.disabled).toBe(true);
  });

  it("이미 질문셋 있음 → 비활성·duplicate id", () => {
    const ui = deriveGongbuhoQuestionSetProjectPanelUi({
      status: "APPROVED",
      viewerCanProjectQuestionSet: true,
      linkedQuestionSetId: "qs-1",
      previewFlowOk: true,
    });
    expect(ui.duplicateLinkedSetId).toBe("qs-1");
    expect(ui.project.disabled).toBe(true);
  });

  it("프리뷰 실패 → 비활성", () => {
    const ui = deriveGongbuhoQuestionSetProjectPanelUi({
      status: "APPROVED",
      viewerCanProjectQuestionSet: true,
      linkedQuestionSetId: null,
      previewFlowOk: false,
    });
    expect(ui.project.disabled).toBe(true);
  });
});
