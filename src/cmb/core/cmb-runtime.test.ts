import { describe, expect, it } from "vitest";
import {
  cmbRequiresLawyerApprovalBeforeDelivery,
  cmbRequiresVoiceFinalizeGate,
  getCmbBlocksForRole,
  resolveCmbCaseConfig,
} from "@/cmb/core/cmb-runtime";

describe("cmb-runtime", () => {
  it("case category 로 CMB config 를 resolve 한다", () => {
    const config = resolveCmbCaseConfig("FRAUD");
    expect(config?.caseType).toBe("FRAUD");
  });

  it("CLIENT role block 에 admin-only 가 없다", () => {
    const config = resolveCmbCaseConfig("WAGE_BACKPAY");
    expect(config).not.toBeNull();
    const blocks = getCmbBlocksForRole(config!, "CLIENT");
    expect(blocks).not.toContain("admin-audit-trail");
  });

  it("voice finalize gate 와 lawyer approval 이 켜져 있다", () => {
    const config = resolveCmbCaseConfig("CRIMINAL_COMPLAINT_DRAFT");
    expect(config).not.toBeNull();
    expect(cmbRequiresVoiceFinalizeGate(config!)).toBe(true);
    expect(cmbRequiresLawyerApprovalBeforeDelivery(config!)).toBe(true);
  });
});
