import { describe, expect, it } from "vitest";
import { assemblePaidConversionContractPack } from "./paid-conversion-contract-pack.policy";
import { PAID_CONVERSION_CONTRACT_ITEMS } from "./paid-conversion-contract-pack.registry";
import { buildPaidConversionContractPack } from "./paid-conversion-contract-pack.service";

describe("paid-conversion-contract-pack (Phase 28-A)", () => {
  it("marks contractPackReady when all signed", () => {
    const result = assemblePaidConversionContractPack({
      tenantSlug: "pilot-lawfirm-001",
      signedItemIds: new Set(PAID_CONVERSION_CONTRACT_ITEMS.map((i) => i.itemId)),
    });
    expect(result.contractPackReady).toBe(true);
  });

  it("defaults to signed when assumeContractSigned", () => {
    const result = buildPaidConversionContractPack();
    expect(result.contractPackReady).toBe(true);
  });
});
