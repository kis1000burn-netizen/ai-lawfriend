import { describe, expect, it } from "vitest";
import { AIBEOPCHIN_CMB_CASE_TYPES } from "@/cmb/core/cmb-schema";
import {
  getCmbCaseConfig,
  listRegisteredCmbCaseTypes,
} from "@/cmb/core/cmb-registry";
import { validateAllCmbConfigs } from "@/cmb/core/cmb-validator";

describe("cmb-registry", () => {
  it("모든 Gongbuho caseType 에 CMB config 가 등록되어 있다", () => {
    expect(listRegisteredCmbCaseTypes().sort()).toEqual(
      [...AIBEOPCHIN_CMB_CASE_TYPES].sort(),
    );
  });

  it("WAGE_BACKPAY CMB 는 LAW-WAGE-001 패킷과 연결된다", () => {
    const config = getCmbCaseConfig("WAGE_BACKPAY");
    expect(config?.gongbuho.requiredPacketCodes).toContain("LAW-WAGE-001");
    expect(config?.status).toBe("LOCKED");
  });
});

describe("cmb-validator", () => {
  it("validateAllCmbConfigs 는 PASS 한다", () => {
    const result = validateAllCmbConfigs();
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
