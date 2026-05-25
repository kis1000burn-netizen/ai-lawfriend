import { describe, expect, it } from "vitest";
import { buildSalesDemoPitchDeckPack } from "./sales-demo-pitch-deck.service";

describe("sales-demo-pitch-deck (Phase 33-B)", () => {
  it("marks salesDemoPackReady when required slides prepared", () => {
    const result = buildSalesDemoPitchDeckPack();
    expect(result.salesDemoPackReady).toBe(true);
  });
});
