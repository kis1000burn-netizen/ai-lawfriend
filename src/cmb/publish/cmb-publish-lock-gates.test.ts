import { describe, expect, it } from "vitest";
import { WAGE_BACKPAY_CMB } from "@/cmb/case-types/wage-backpay.cmb";
import {
  assertCmbPublishTransitionAllowed,
  assertNoCmbGateWeakening,
  getAllowedCmbPublishTransitions,
} from "@/cmb/publish/cmb-publish-lock-gates";

describe("cmb-publish-lock-gates", () => {
  it("LOCKED → PUBLISHED 만 허용하고 skip 전이는 거부", () => {
    expect(getAllowedCmbPublishTransitions("LOCKED")).toEqual(["PUBLISHED"]);
    expect(assertCmbPublishTransitionAllowed("DRAFT", "PUBLISHED")).toContain("허용되지");
    expect(assertCmbPublishTransitionAllowed("LOCKED", "PUBLISHED")).toBeNull();
  });

  it("gate 약화 시도를 차단한다", () => {
    const weakened = structuredClone(WAGE_BACKPAY_CMB);
    weakened.gongbuho.requireApprovedPacketsOnly = false;
    const errors = assertNoCmbGateWeakening(WAGE_BACKPAY_CMB, weakened);
    expect(errors.some((e) => e.includes("requireApprovedPacketsOnly"))).toBe(true);
  });
});
