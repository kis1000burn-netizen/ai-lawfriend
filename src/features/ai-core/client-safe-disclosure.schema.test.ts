import { describe, expect, it } from "vitest";

import {
  CLIENT_SAFE_DISCLOSURE_VERSION,
  parseClientSafeDisclosureLayer,
  PHASE10C_CLIENT_SAFE_DISCLOSURE_MARKER,
} from "./client-safe-disclosure.schema";

describe("client-safe-disclosure.schema Phase 10-C", () => {
  it("exposes marker and version", () => {
    expect(PHASE10C_CLIENT_SAFE_DISCLOSURE_MARKER).toBe("PHASE10C_CLIENT_SAFE_DISCLOSURE");
    expect(CLIENT_SAFE_DISCLOSURE_VERSION).toBe("10-C.1");
  });

  it("parses empty client layer", () => {
    const layer = parseClientSafeDisclosureLayer({
      disclosureVersion: "10-C.1",
      caseId: "c1",
      caseStatus: "IN_INTERVIEW",
      generatedAt: new Date().toISOString(),
      releaseGatePassed: false,
      statements: [],
      blockedCategories: ["RADAR", "INTELLIGENCE_GRAPH", "INTERNAL_LAWYER_MEMO", "PENDING_LEDGER", "UNREVIEWED_LEDGER"],
      disclaimer: "disclaimer",
    });
    expect(layer.statements).toHaveLength(0);
  });
});
