import { describe, expect, it } from "vitest";
import { ValidationError } from "@/lib/errors";
import { projectGongbuhoQuestionFlowToQuestions } from "@/features/gongbuho/project-gongbuho-question-flow";
import sample from "../../../docs/gongbuho/samples/LAW_FRAUD_001_GONGBUHO.json";

describe("projectGongbuhoQuestionFlowToQuestions", () => {
  it("샘패 LAW-FRAUD-001: 순서 유지 · key/id · 텍스트·설명 매핑", () => {
    const qs = projectGongbuhoQuestionFlowToQuestions(sample as Record<string, unknown>);
    expect(qs.length).toBeGreaterThan(0);
    expect(qs[0]).toMatchObject({
      key: "gongbuho.Q1",
      id: "proj-gongbuho.Q1",
      type: "TEXTAREA",
      required: true,
      order: 1,
    });
    expect(qs[0]!.label).toContain("상대방");
    expect(qs[0]!.description).toBeTruthy();

    expect(qs[1]!.order).toBe(2);

    expect(qs[0]!.helpText ?? "").toMatch(/단계:/);
    expect(qs[0]!.helpText ?? "").toMatch(/증거 힌트/);

    const keys = qs.map((q) => q.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("questionFlow 없으면 MISSING", () => {
    try {
      projectGongbuhoQuestionFlowToQuestions({});
      expect.fail("expected ValidationError");
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).details).toMatchObject({
        code: "GONGBUHO_QUESTION_FLOW_MISSING",
      });
    }
  });

  it("questionFlow 배열 아님 → NOT_ARRAY", () => {
    try {
      projectGongbuhoQuestionFlowToQuestions({ questionFlow: {} });
      expect.fail("expected ValidationError");
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).details).toMatchObject({
        code: "GONGBUHO_QUESTION_FLOW_NOT_ARRAY",
      });
    }
  });

  it("text 누락 → TEXT_MISSING", () => {
    try {
      projectGongbuhoQuestionFlowToQuestions({
        questionFlow: [{ id: "A", text: "   ", purpose: "p" }],
      });
      expect.fail("expected ValidationError");
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).details).toMatchObject({
        code: "GONGBUHO_QUESTION_FLOW_TEXT_MISSING",
      });
    }
  });

  it("중복 id → DUPLICATE_ID", () => {
    try {
      projectGongbuhoQuestionFlowToQuestions({
        questionFlow: [
          { id: "x", text: "a", purpose: "p" },
          { id: "x", text: "b", purpose: "p" },
        ],
      });
      expect.fail("expected ValidationError");
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).details).toMatchObject({
        code: "GONGBUHO_QUESTION_FLOW_DUPLICATE_ID",
      });
    }
  });

  it("purpose는 description에 보존", () => {
    const qs = projectGongbuhoQuestionFlowToQuestions({
      questionFlow: [{ id: "Z1", text: "무엇이 문제입니까?", purpose: "검증용 목적 문자열" }],
    });
    expect(qs).toHaveLength(1);
    expect(qs[0]!.description).toBe("검증용 목적 문자열");
    expect(qs[0]!.helpText).toBeNull();
  });
});
