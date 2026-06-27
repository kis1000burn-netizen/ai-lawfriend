import { describe, expect, it } from "vitest";

import {
  buildLawyerArgumentSocialProofSignal,
  isFixtureCaseIdForSocialProof,
  LAWYER_ARGUMENT_SOCIAL_PROOF_MIN_SIGNAL_COUNT,
} from "./lawyer-argument-social-proof";

describe("lawyer-argument-social-proof", () => {
  it("returns only safe category themes without counts or identifiers", () => {
    const result = buildLawyerArgumentSocialProofSignal({
      themes: [
        { label: "부동산 관련 분쟁", signalCount: 18 },
        { label: "산업재해 및 손해배상 관련 검토", signalCount: 7 },
      ],
    });

    expect(result.visible).toBe(true);
    expect(result.themes).toEqual([
      "부동산 관련 분쟁",
      "산업재해 및 손해배상 관련 검토",
    ]);
    expect(result.disclaimer).toContain("특정 사건");
    expect(JSON.stringify(result)).not.toContain("18");
    expect(JSON.stringify(result)).not.toContain("7");
    expect(JSON.stringify(result)).not.toContain("case-joohwan");
    expect(JSON.stringify(result)).not.toContain("토지·통행");
  });

  it("hides the card when every theme is below the per-theme minimum", () => {
    const result = buildLawyerArgumentSocialProofSignal({
      themes: [
        { label: "부동산 관련 분쟁", signalCount: 2 },
        { label: "산업재해 및 손해배상 관련 검토", signalCount: 1 },
      ],
    });

    expect(result.visible).toBe(false);
    expect(result.themes).toEqual([]);
    expect(result.emptyStateMessage).toContain("테마별 최소 집계 기준");
  });

  it("shows only themes that meet the per-theme minimum aggregation threshold", () => {
    const result = buildLawyerArgumentSocialProofSignal({
      themes: [
        { label: "부동산 관련 분쟁", signalCount: 6 },
        { label: "산업재해 및 손해배상 관련 검토", signalCount: 1 },
      ],
    });

    expect(result.visible).toBe(true);
    expect(result.themes).toEqual(["부동산 관련 분쟁"]);
    expect(JSON.stringify(result)).not.toContain("6");
    expect(JSON.stringify(result)).not.toContain("1");
  });

  it("hides sparse themes even when total signals exceed the minimum", () => {
    const result = buildLawyerArgumentSocialProofSignal({
      themes: [
        {
          label: "부동산 관련 분쟁",
          signalCount: LAWYER_ARGUMENT_SOCIAL_PROOF_MIN_SIGNAL_COUNT,
        },
        { label: "산업재해 및 손해배상 관련 검토", signalCount: 1 },
      ],
    });

    expect(result.visible).toBe(true);
    expect(result.themes).toEqual(["부동산 관련 분쟁"]);
  });

  it("detects known fixture case ids for exclusion", () => {
    expect(isFixtureCaseIdForSocialProof("case-joohwan-land-access")).toBe(true);
    expect(isFixtureCaseIdForSocialProof("case-live-001")).toBe(false);
  });
});
