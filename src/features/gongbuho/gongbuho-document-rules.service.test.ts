import fraudSample from "../../../docs/gongbuho/samples/LAW_FRAUD_001_GONGBUHO.json";
import { describe, expect, it } from "vitest";
import {
  evaluateGongbuhoDocumentRulesAgainstText,
  extractGongbuhoRuleStringArrays,
  forbiddenRuleTriggerCandidates,
  buildGongbuhoDocumentRulesPromptAppendix,
} from "./gongbuho-document-rules.service";

describe("extractGongbuhoRuleStringArrays", () => {
  it("parses validation and forbidden lines from sample packet", () => {
    const r = extractGongbuhoRuleStringArrays(fraudSample);
    expect(r.validationRules.length).toBeGreaterThan(0);
    expect(r.forbiddenRules.length).toBeGreaterThan(0);
    expect(r.expertReviewPoints.length).toBeGreaterThan(0);
  });
});

describe("forbiddenRuleTriggerCandidates", () => {
  it("extracts quoted phrases", () => {
    const t = forbiddenRuleTriggerCandidates("상대방을 '사기범' 등으로 표시하지 않습니다.");
    expect(t).toContain("사기범");
  });
});

describe("buildGongbuhoDocumentRulesPromptAppendix", () => {
  it("returns block when either list is non-empty", () => {
    const s = buildGongbuhoDocumentRulesPromptAppendix({
      validationRules: ["A"],
      forbiddenRules: [],
    });
    expect(s).toContain("[공부호 패킷 · 검증·금지 규칙 참고]");
    expect(s).toContain("A");
  });

  it("returns empty when both empty", () => {
    expect(buildGongbuhoDocumentRulesPromptAppendix({ validationRules: [], forbiddenRules: [] })).toBe(
      "",
    );
  });
});

describe("evaluateGongbuhoDocumentRulesAgainstText", () => {
  it("flags body containing quoted forbidden trigger", () => {
    const extracted = extractGongbuhoRuleStringArrays(fraudSample);
    const res = evaluateGongbuhoDocumentRulesAgainstText({
      generatedBody: "피의자는 명백한 사기범으로 보입니다.",
      validationRules: extracted.validationRules.slice(0, 1),
      forbiddenRules: extracted.forbiddenRules,
      expertReviewPoints: [],
    });
    expect(res.forbiddenHits.length).toBeGreaterThan(0);
    expect(res.riskFlags.some((f) => f.kind === "GONGBUHO_FORBIDDEN_CANDIDATE")).toBe(true);
  });

  it("emits expert review risk flags without substring match", () => {
    const res = evaluateGongbuhoDocumentRulesAgainstText({
      generatedBody: "정상 문장",
      validationRules: [],
      forbiddenRules: [],
      expertReviewPoints: ["손해액 재검토"],
    });
    expect(res.riskFlags.some((f) => f.kind === "GONGBUHO_EXPERT_REVIEW_POINT")).toBe(true);
  });
});
