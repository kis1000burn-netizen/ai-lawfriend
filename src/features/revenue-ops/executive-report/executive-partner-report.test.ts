import { describe, expect, it } from "vitest";
import { EXECUTIVE_REPORT_AGGREGATE_ONLY_MARKER } from "./executive-partner-report.registry";
import { buildExecutivePartnerSuccessReport } from "./executive-partner-report.service";

describe("executive-partner-report (Phase 29-E)", () => {
  it("produces aggregate-only PII-redacted report", () => {
    const result = buildExecutivePartnerSuccessReport();
    expect(result.aggregateOnly).toBe(true);
    expect(result.piiRedacted).toBe(true);
    expect(result.executiveReportReady).toBe(true);
    expect(EXECUTIVE_REPORT_AGGREGATE_ONLY_MARKER).toContain("aggregate-only");
  });

  it("does not include case body or client PII fields", () => {
    const result = buildExecutivePartnerSuccessReport();
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("caseBody");
    expect(serialized).not.toContain("clientEmail");
  });
});
