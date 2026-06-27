import { describe, expect, it } from "vitest";

import { buildCaseIntakeSocialProof } from "./case-intake-social-proof";

describe("case-intake-social-proof", () => {
  it("shows anonymized recent activity without exact counts", () => {
    const result = buildCaseIntakeSocialProof({
      recentIntakeCount: 12,
      activeCaseCount: 30,
    });

    expect(result.activityLabel).toBe("최근 접수 활동 있음");
    expect(result.activityTone).toBe("active");
    expect(result.title).toContain("비슷한 고민");
    expect(result.description).toContain("개별 사건명");
    expect(JSON.stringify(result)).not.toContain("12");
    expect(JSON.stringify(result)).not.toContain("30");
  });

  it("keeps the pre-intake message useful even with no aggregate activity", () => {
    const result = buildCaseIntakeSocialProof({
      recentIntakeCount: 0,
      activeCaseCount: 0,
    });

    expect(result.activityLabel).toBe("새 접수 준비 가능");
    expect(result.activityTone).toBe("starter");
    expect(result.title).toContain("처음 접수");
    expect(result.bullets).toEqual(
      expect.arrayContaining([
        "접수 후 상세 내용은 본인과 권한 있는 담당자만 확인합니다.",
      ]),
    );
  });
});
