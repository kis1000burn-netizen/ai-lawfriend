import { describe, expect, it } from "vitest";
import {
  countFilledKeysInInterviewAnswerMap,
  isFilledInterviewAnswerValue,
  maxInterviewAnswerCount,
  mergedInterviewAnswersRecordForPreview,
} from "./interview-answers-for-ui";

describe("isFilledInterviewAnswerValue", () => {
  it("treats empty string and empty array as unfilled", () => {
    expect(isFilledInterviewAnswerValue("")).toBe(false);
    expect(isFilledInterviewAnswerValue([])).toBe(false);
    expect(isFilledInterviewAnswerValue(null)).toBe(false);
    expect(isFilledInterviewAnswerValue(undefined)).toBe(false);
  });
});

describe("maxInterviewAnswerCount", () => {
  it("uses memo when answersJson is empty", () => {
    const memo = JSON.stringify({ q1: "hello", q2: "" });
    expect(
      maxInterviewAnswerCount([{ answersJson: null }], memo),
    ).toBe(1);
  });

  it("falls back to answersJson when memo empty", () => {
    expect(
      maxInterviewAnswerCount([{ answersJson: { a: "1", b: "2" } }], ""),
    ).toBe(2);
  });

  it("returns max of memo and json", () => {
    const memo = JSON.stringify({ x: "1" });
    expect(
      maxInterviewAnswerCount(
        [{ answersJson: { y: "a", z: "b" } }],
        memo,
      ),
    ).toBe(2);
  });
});

describe("mergedInterviewAnswersRecordForPreview", () => {
  it("merges memo over json for same key", () => {
    const memo = JSON.stringify({ k: "memo" });
    const out = mergedInterviewAnswersRecordForPreview(memo, { k: "json" });
    expect(out?.k).toBe("memo");
  });

  it("returns null when neither has data", () => {
    expect(
      mergedInterviewAnswersRecordForPreview("", null),
    ).toBeNull();
  });
});

describe("countFilledKeysInInterviewAnswerMap", () => {
  it("counts only filled entries", () => {
    expect(
      countFilledKeysInInterviewAnswerMap({
        a: "x",
        b: "",
        c: null,
        d: [],
        e: true,
      }),
    ).toBe(2);
  });
});
