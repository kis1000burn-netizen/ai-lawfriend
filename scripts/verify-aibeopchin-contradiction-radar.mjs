import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 9-E file: ${relativePath}`);
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
    "docs/ai/AIBEOPCHIN_CONTRADICTION_RADAR_SPEC.md",
    "src/features/ai-core/case-contradiction-radar.ts",
    "src/features/ai-core/case-intelligence-graph-runtime.service.ts",
    "src/features/ai-core/case-contradiction-validator.ts",
    "src/features/ai-core/case-contradiction-radar.test.ts",
    "src/features/ai-core/case-contradiction-validator.test.ts",
    "src/features/ai-core/case-intelligence-graph-runtime.service.test.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("docs/ai/AIBEOPCHIN_CONTRADICTION_RADAR_SPEC.md", [
    "Phase **9‑E**",
    "AI는 판단하지 않는다",
    "INTERVIEW",
    "ATTACHMENT",
    "GONGBUHO",
    "SUMMARY_CLAIM",
    "LAWYER_MEMO",
    "intelligenceGraph",
    "verify:aibeopchin-contradiction-radar",
    "9-E.1",
    "scanCaseContradictionRadar",
  ]);

  assertIncludes("src/features/ai-core/case-contradiction-radar.ts", [
    "PHASE9E_CONTRADICTION_RADAR",
    "scanCaseContradictionRadar",
    "CONTRADICTION_SIGNAL_TYPES",
  ]);

  assertIncludes("src/features/ai-core/case-intelligence-graph-runtime.service.ts", [
    "PHASE9E_CASE_INTELLIGENCE_GRAPH_RUNTIME",
    "buildCaseIntelligenceGraphRuntime",
    "scanCaseContradictionRadar",
  ]);

  assertIncludes("src/features/ai-core/case-contradiction-validator.ts", [
    "validateCaseContradictionRadarResult",
    "CASE_CONTRADICTION_VALIDATOR_MARKER",
  ]);

  assertIncludes("src/features/ai-core/case-summary-ai-core-runtime.service.ts", [
    "buildCaseIntelligenceGraphRuntime",
    "intelligenceGraph",
  ]);

  const route = readFile("src/app/api/cases/[caseId]/summary/generate/route.ts");
  if (!route.includes("Phase 9-E")) {
    throw new Error("summary/generate route must document Phase 9-E intelligenceGraph");
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag9d = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9D-CASE-INTELLIGENCE-GRAPH-SPEC";
  const tag9e = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9E-CONTRADICTION-RADAR";
  if (!impl.includes(tag9d)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag9d}`);
  }
  if (!impl.includes(tag9e)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag9e}`);
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("AIBEOPCHIN_CONTRADICTION_RADAR_SPEC.md")) {
    throw new Error("docs/ai/README.md must link Contradiction Radar spec");
  }
  if (!readme.includes("| **9-E** |")) {
    throw new Error("docs/ai/README.md must include Phase **9-E** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-contradiction-radar")) {
    throw new Error("package.json must define verify:aibeopchin-contradiction-radar");
  }

  console.log("verify:aibeopchin-contradiction-radar PASS");
}

main();
