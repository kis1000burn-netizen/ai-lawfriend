import { describe, expect, it } from "vitest";
import { buildSalesPipelineModel } from "./sales-pipeline-model.service";

describe("sales-pipeline-model (Phase 34-A)", () => {
  it("marks salesPipelineReady when required stages defined", () => {
    const result = buildSalesPipelineModel();
    expect(result.salesPipelineReady).toBe(true);
  });
});
