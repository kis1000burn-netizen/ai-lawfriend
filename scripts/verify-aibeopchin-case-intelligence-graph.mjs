import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 9-D file: ${relativePath}`);
  }
}

function assertIncludes(relativePath, terms) {
  const content = readFile(relativePath);
  for (const term of terms) {
    if (!content.includes(term)) {
      throw new Error(`Missing term "${term}" in ${relativePath}`);
    }
  }
}

function main() {
  const required = [
    "docs/ai/AIBEOPCHIN_CASE_INTELLIGENCE_GRAPH_SPEC.md",
    "src/features/ai-core/case-intelligence-graph.schema.ts",
    "src/features/ai-core/case-summary-provenance-map.ts",
    "src/features/ai-core/case-summary-claim-validator.ts",
    "src/features/ai-core/case-intelligence-graph.schema.test.ts",
    "src/features/ai-core/case-summary-provenance-map.test.ts",
    "src/features/ai-core/case-summary-claim-validator.test.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("docs/ai/AIBEOPCHIN_CASE_INTELLIGENCE_GRAPH_SPEC.md", [
    "Phase **9‑D**",
    "AI는 판단하지 않는다",
    "USER_CLAIM",
    "InterviewAnswer.Q_WAGE_03",
    "GongbuhoPacket.WAGE_BACKPAY",
    "lawyerReviewState",
    "verify:aibeopchin-case-intelligence-graph",
    "9-D.1",
    "Contradiction Radar",
  ]);

  assertIncludes("src/features/ai-core/case-intelligence-graph.schema.ts", [
    "PHASE9D_CASE_INTELLIGENCE_GRAPH",
    "CASE_INTELLIGENCE_GRAPH_VERSION",
    "9-D.1",
    "LAWYER_REVIEW_STATES",
    "caseIntelligenceClaimSchema",
  ]);

  assertIncludes("src/features/ai-core/case-summary-provenance-map.ts", [
    "CASE_SUMMARY_OUTPUT_SPEC_TO_API_FIELD",
    "buildWageBackpayExampleClaim",
    "buildCaseIntelligenceGraphDraft",
  ]);

  assertIncludes("src/features/ai-core/case-summary-claim-validator.ts", [
    "validateCaseIntelligenceClaim",
    "assertClaimNoFinalJudgment",
    "checkForbiddenAssertions",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag9c = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9C-CASE-SUMMARY-RC-CLOSURE";
  const tag9d = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9D-CASE-INTELLIGENCE-GRAPH-SPEC";
  if (!impl.includes(tag9c)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag9c}`);
  }
  if (!impl.includes(tag9d)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag9d}`);
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("AIBEOPCHIN_CASE_INTELLIGENCE_GRAPH_SPEC.md")) {
    throw new Error("docs/ai/README.md must link Case Intelligence Graph spec");
  }
  if (!readme.includes("| **9-D** |")) {
    throw new Error("docs/ai/README.md must include Phase **9-D** row");
  }

  const route = readFile("src/app/api/cases/[caseId]/summary/generate/route.ts");
  if (!route.includes("invokeCaseSummaryGenerate")) {
    throw new Error("summary/generate must delegate to invokeCaseSummaryGenerate");
  }

  console.log("verify:aibeopchin-case-intelligence-graph PASS");
}

main();
