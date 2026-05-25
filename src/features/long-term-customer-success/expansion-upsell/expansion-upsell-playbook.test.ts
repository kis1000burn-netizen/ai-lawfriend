import { describe, expect, it } from "vitest";
import { buildExpansionUpsellPlaybook } from "./expansion-upsell-playbook.service";

describe("expansion-upsell-playbook (Phase 38-D)", () => {
  it("marks expansionUpsellPlaybookReady when required plays defined", () => {
    const result = buildExpansionUpsellPlaybook();
    expect(result.expansionUpsellPlaybookReady).toBe(true);
  });
});
