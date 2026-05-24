import { describe, expect, it } from "vitest";
import {
  assertAiEvaluationFeatureSupported,
  buildAiEvaluationDatasetCatalogSummary,
  filterEvaluationEntries,
  normalizeAiEvaluationEntryCode,
} from "./ai-evaluation-dataset.policy";
import {
  AI_EVALUATION_DATASET_SAMPLES,
  findStaticAiEvaluationEntryByCode,
} from "./ai-evaluation-dataset.registry";
import { AI_EVALUATION_CASE_PACK_TYPES } from "./ai-evaluation-dataset.schema";

describe("ai-evaluation-dataset.registry (Phase 23-A)", () => {
  it("covers case pack types with golden samples", () => {
    for (const packType of AI_EVALUATION_CASE_PACK_TYPES) {
      if (packType === "GENERIC") continue;
      expect(AI_EVALUATION_DATASET_SAMPLES.some((entry) => entry.packType === packType)).toBe(
        true,
      );
    }
  });

  it("finds static entry by code", () => {
    const entry = findStaticAiEvaluationEntryByCode("EVAL-LOAN-CASE-SUMMARY-001");
    expect(entry?.feature).toBe("CASE_SUMMARY");
  });
});

describe("ai-evaluation-dataset.policy (Phase 23-A)", () => {
  it("normalizes evaluation entry codes", () => {
    expect(normalizeAiEvaluationEntryCode(" eval loan 001 ")).toBe("EVAL-LOAN-001");
  });

  it("filters entries by pack and feature", () => {
    const filtered = filterEvaluationEntries({
      entries: AI_EVALUATION_DATASET_SAMPLES,
      packType: "LABOR",
      feature: "DOCUMENT_PARAGRAPH",
    });
    expect(filtered).toHaveLength(1);
  });

  it("builds catalog summary", () => {
    const summary = buildAiEvaluationDatasetCatalogSummary(AI_EVALUATION_DATASET_SAMPLES);
    expect(summary.totalEntries).toBe(AI_EVALUATION_DATASET_SAMPLES.length);
    expect(summary.byPackType.LOAN).toBeGreaterThan(0);
  });

  it("rejects unsupported governance features", () => {
    expect(() => assertAiEvaluationFeatureSupported("UNKNOWN_FEATURE")).toThrow(
      "UNSUPPORTED_EVALUATION_FEATURE",
    );
    expect(() => assertAiEvaluationFeatureSupported("CASE_SUMMARY")).not.toThrow();
  });
});
