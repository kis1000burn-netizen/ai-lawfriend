import { describe, expect, it } from "vitest";
import { deriveGongbuhoQuestionFlowPreview } from "./admin-gongbuho-question-flow-preview";

describe("deriveGongbuhoQuestionFlowPreview", () => {
  it("유효한 questionFlow → ok + 질문 키", () => {
    const r = deriveGongbuhoQuestionFlowPreview({
      questionFlow: [{ id: "Q1", text: "내용입니다", purpose: "목표" }],
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.questions).toHaveLength(1);
    expect(r.questions[0]?.key).toBe("gongbuho.Q1");
  });

  it("questionFlow 누락 → 검증 코드", () => {
    const r = deriveGongbuhoQuestionFlowPreview({});
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.code).toBe("GONGBUHO_QUESTION_FLOW_MISSING");
  });
});
