import { describe, expect, it } from "vitest";
import { buildOrderFormSowPolicy } from "./order-form-sow-policy.service";

describe("order-form-sow-policy (Phase 35-C)", () => {
  it("marks orderFormSowPolicyReady when required policies defined", () => {
    const result = buildOrderFormSowPolicy();
    expect(result.orderFormSowPolicyReady).toBe(true);
  });
});
