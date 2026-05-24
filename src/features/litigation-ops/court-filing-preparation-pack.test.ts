import { describe, expect, it } from "vitest";
import { COURT_FILING_PACK_TEMPLATES } from "./court-filing-preparation-pack.registry";
import { assembleCourtFilingPreparationPack } from "./court-filing-preparation-pack.policy";

describe("court-filing-preparation-pack (Phase 24-B)", () => {
  it("defines templates for all filing types", () => {
    expect(COURT_FILING_PACK_TEMPLATES.length).toBe(5);
  });

  it("assembles pack with readiness score", () => {
    const pack = assembleCourtFilingPreparationPack({
      caseId: "case-1",
      filingType: "COMPLAINT",
      courtName: "서울중앙지방법원",
      hasParties: true,
      hasClaims: true,
      hasEvidence: false,
      hasDeadlines: true,
      hasOpenTasks: false,
      hasAttachments: true,
    });

    expect(pack.readinessScore).toBeGreaterThan(0);
    expect(pack.missingRequiredSections).toContain("증거목록");
    expect(pack.disclaimer).toContain("변호사");
  });
});
