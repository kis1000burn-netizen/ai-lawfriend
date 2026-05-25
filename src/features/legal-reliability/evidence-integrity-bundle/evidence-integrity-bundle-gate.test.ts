import { describe, expect, it } from "vitest";
import { buildEvidenceIntegrityBundleGate } from "./evidence-integrity-bundle-gate.service";

describe("evidence-integrity-bundle-gate (Phase 47-C)", () => {
  it("marks evidenceIntegrityBundleGateReady when bundled items defined", () => {
    const result = buildEvidenceIntegrityBundleGate();
    expect(result.evidenceIntegrityBundleGateReady).toBe(true);
    expect(result.bundledPhase).toBe("42-F");
    expect(result.bundledVerifyScript).toBe("verify:aibeopchin-evidence-integrity-rc");
  });
});
