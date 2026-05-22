import { describe, expect, it } from "vitest";
import fraudSample from "../../../docs/gongbuho/samples/LAW_FRAUD_001_GONGBUHO.json";
import type { InterviewAnswerMap } from "@/features/question-set/question-set.types";
import {
  buildGongbuhoContractSections,
  extractGongbuhoExpertReviewPoints,
  mergeInterviewSummaryWithGongbuhoContract,
  parseGongbuhoSummaryHeadings,
} from "./gongbuho-summary-contract.service";

describe("parseGongbuhoSummaryHeadings", () => {
  it("returns ordered headings from sample packet JSON", () => {
    const h = parseGongbuhoSummaryHeadings(fraudSample);
    expect(h).not.toBeNull();
    expect(h![0]).toBe("사건 개요");
    expect(h!).toContain("변호사 검토 포인트");
  });

  it("returns null when outputContract.summary is missing", () => {
    expect(parseGongbuhoSummaryHeadings({ code: "X" })).toBeNull();
  });
});

describe("extractGongbuhoExpertReviewPoints", () => {
  it("parses expertReviewPoints array from packet", () => {
    const pts = extractGongbuhoExpertReviewPoints(fraudSample);
    expect(pts.length).toBeGreaterThan(0);
    expect(pts[0]).toContain("기망행위");
  });
});

describe("buildGongbuhoContractSections", () => {
  const legacy = {
    overview: "개요 테스트",
    timeline: ["타임라인 1"],
    keyIssues: ["쟁점 A"],
    missingInfo: ["누락 항목"],
    checklist: ["체크 1"],
  };
  const answers: InterviewAnswerMap = {
    people_involved: "가해자 미상",
    evidence_summary: "입금증 있음",
  };

  it("fills lawyer review heading with numbered expert points + disclaimer cues", () => {
    const experts = extractGongbuhoExpertReviewPoints(fraudSample);
    const secs = buildGongbuhoContractSections({
      headings: ["변호사 검토 포인트"],
      legacy,
      answers,
      expertReviewPoints: experts,
    });
    expect(secs[0].body).toMatch(/패킷에 정의된 참고용/);
    expect(secs[0].body).toMatch(/1\./);
  });

  it("maps evidence heading to answers", () => {
    const secs = buildGongbuhoContractSections({
      headings: ["증거자료 목록"],
      legacy,
      answers,
      expertReviewPoints: [],
    });
    expect(secs[0].body).toContain("입금증 있음");
  });
});

describe("mergeInterviewSummaryWithGongbuhoContract", () => {
  const legacy = {
    overview: "요약 바디",
    timeline: [],
    keyIssues: [],
    missingInfo: [],
    checklist: [],
  };

  const resolution = {
    via: "trace",
    traceId: "trace-1",
    gongbuhoPacketId: "packet-1",
    code: "LAW-FRAUD-001",
    version: "1.0.0",
  } as const;

  it("falls back internally when headings cannot be parsed from packet JSON", () => {
    const r = mergeInterviewSummaryWithGongbuhoContract({
      legacy,
      answers: {},
      packetJson: { code: "X" },
      resolution,
    });
    expect(r.outputContractApplied).toBe(false);
    expect(r.contractSections).toBeUndefined();
    expect(r.flat.caseOverview).toBe("요약 바디");
  });

  it("applies structured sections when headings exist", () => {
    const r = mergeInterviewSummaryWithGongbuhoContract({
      legacy,
      answers: { case_background: "배경" },
      packetJson: fraudSample,
      resolution,
    });
    expect(r.outputContractApplied).toBe(true);
    expect(r.contractSections!.length).toBeGreaterThan(3);
    expect(r.gongbuhoResolution!.via).toBe("trace");
  });
});
