/**
 * @vitest-environment node
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { projectGongbuhoQuestionFlowToQuestions } from "./project-gongbuho-question-flow";
import { gongbuhoSampleLibraryPacketSchema } from "@/lib/validators/gongbuho-sample-library";

const SAMPLE_DIR = path.resolve(process.cwd(), "docs/gongbuho/samples");

function listSamples(): string[] {
  return readdirSync(SAMPLE_DIR)
    .filter((name) => name.endsWith("_GONGBUHO.json"))
    .sort((a, b) => a.localeCompare(b, "en"));
}

describe("Gongbuho sample library JSON (Phase 4-D)", () => {
  const files = listSamples();

  it("샘플 파일이 최소 하나 존재", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const fname of files) {
    const filePath = path.resolve(SAMPLE_DIR, fname);

    it(`문법 파싱 + 라이브러리 Zod + questionFlow — ${fname}`, () => {
      const parsedJson = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
      expect(parsedJson).not.toBeNull();

      const packet = gongbuhoSampleLibraryPacketSchema.parse(parsedJson);
      const qs = projectGongbuhoQuestionFlowToQuestions(packet);
      expect(qs.length).toBeGreaterThan(0);
      expect(packet.code?.trim().length ?? 0).toBeGreaterThan(0);

      expect(packet.caseType ?? "").not.toHaveLength(0);
    });
  }

  it("caseType 없으면 라이브러리 스키마 실패", () => {
    const bad = {
      code: "X",
      version: "1.0.0",
      name: "n",
      domain: "d",
      // caseType 의도적 누락
    };
    const r = gongbuhoSampleLibraryPacketSchema.safeParse(bad);
    expect(r.success).toBe(false);
  });

  it("questionFlow id 중복이면 투영 실패", () => {
    const badFlow = {
      code: "X",
      version: "1",
      name: "n",
      domain: "d",
      caseType: "TEST",
      questionFlow: [
        { id: "A", text: "t1", purpose: "p" },
        { id: "A", text: "t2", purpose: "p" },
      ],
    };
    const packet = gongbuhoSampleLibraryPacketSchema.parse(badFlow);
    expect(() => projectGongbuhoQuestionFlowToQuestions(packet)).toThrow();
  });

  it("outputContract.summary 없어도 샘플 투영은 가능 — 요약 규격은 Phase 3-E 선택 적용", () => {
    const minimal = {
      code: "MIN",
      version: "0.1.0",
      name: "n",
      domain: "d",
      caseType: "TEST_MINIMUM",
      questionFlow: [{ id: "ONLY", text: "q", purpose: "p" }],
    };
    const packet = gongbuhoSampleLibraryPacketSchema.parse(minimal);
    expect(
      projectGongbuhoQuestionFlowToQuestions({
        ...packet,
        outputContract: undefined,
      }).length,
    ).toBe(1);
  });
});
