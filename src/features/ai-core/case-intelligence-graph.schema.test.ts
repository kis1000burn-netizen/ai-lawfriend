import { describe, expect, it } from "vitest";

import {
  CASE_INTELLIGENCE_GRAPH_VERSION,
  caseIntelligenceClaimSchema,
  parseCaseIntelligenceGraph,
  PHASE9D_CASE_INTELLIGENCE_GRAPH_MARKER,
} from "./case-intelligence-graph.schema";
import { buildWageBackpayExampleClaim } from "./case-summary-provenance-map";
import { validateCaseIntelligenceClaim } from "./case-summary-claim-validator";

describe("case-intelligence-graph.schema Phase 9-D", () => {
  it("exposes marker and version", () => {
    expect(PHASE9D_CASE_INTELLIGENCE_GRAPH_MARKER).toBe(
      "PHASE9D_CASE_INTELLIGENCE_GRAPH",
    );
    expect(CASE_INTELLIGENCE_GRAPH_VERSION).toBe("9-D.1");
  });

  it("parses wage backpay example claim", () => {
    const claim = buildWageBackpayExampleClaim();
    expect(caseIntelligenceClaimSchema.parse(claim).claimType).toBe("USER_CLAIM");
    expect(claim.sources[0]?.ref).toBe("InterviewAnswer.Q_WAGE_03");
  });

  it("parses minimal graph", () => {
    const claim = buildWageBackpayExampleClaim();
    const graph = parseCaseIntelligenceGraph({
      graphVersion: "9-D.1",
      caseId: "c1",
      generatedAt: new Date().toISOString(),
      summaryOperation: "CASE_SUMMARY_GENERATE",
      caseSummaryAiMode: "RULE_BASED",
      claims: [claim],
    });
    expect(graph.claims).toHaveLength(1);
  });

  it("rejects claim without sources", () => {
    const claim = buildWageBackpayExampleClaim();
    expect(() =>
      caseIntelligenceClaimSchema.parse({ ...claim, sources: [] }),
    ).toThrow();
  });

  it("validates example through claim validator", () => {
    const result = validateCaseIntelligenceClaim(buildWageBackpayExampleClaim());
    expect(result.passed).toBe(true);
  });
});
