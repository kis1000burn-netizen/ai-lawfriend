import { describe, expect, it } from "vitest";
import { buildEnterpriseExpansionMap } from "./enterprise-expansion-map.service";

describe("enterprise-expansion-map (Phase 39-B)", () => {
  it("marks enterpriseExpansionMapReady when required nodes defined", () => {
    const result = buildEnterpriseExpansionMap();
    expect(result.enterpriseExpansionMapReady).toBe(true);
  });
});
