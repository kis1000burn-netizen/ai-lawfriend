import { describe, expect, it } from "vitest";
import { buildCourtReadyCaseRecordPackBundleGate } from "./court-ready-case-record-pack-bundle-gate.service";

describe("court-ready-case-record-pack-bundle-gate (Phase 47-E)", () => {
  it("marks courtReadyCaseRecordPackBundleGateReady when bundled items defined", () => {
    const result = buildCourtReadyCaseRecordPackBundleGate();
    expect(result.courtReadyCaseRecordPackBundleGateReady).toBe(true);
    expect(result.bundledPhase).toBe("44-F");
    expect(result.bundledVerifyScript).toBe("verify:aibeopchin-court-ready-case-record-pack-rc");
  });
});
