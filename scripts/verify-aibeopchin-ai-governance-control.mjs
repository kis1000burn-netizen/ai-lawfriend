import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 10-A file: ${relativePath}`);
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
    "docs/ai/AIBEOPCHIN_AI_GOVERNANCE_CONTROL_MATRIX.md",
    "src/features/ai-core/ai-governance-control.schema.ts",
    "src/features/ai-core/ai-governance-policy.service.ts",
    "src/features/ai-core/ai-governance-validator.ts",
    "src/features/ai-core/ai-governance-control.schema.test.ts",
    "src/features/ai-core/ai-governance-policy.service.test.ts",
    "src/features/ai-core/ai-governance-validator.test.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("docs/ai/AIBEOPCHIN_AI_GOVERNANCE_CONTROL_MATRIX.md", [
    "Phase **10‑A**",
    "masterEnableRoles",
    "allowedCaseStatuses",
    "clientVisibleMinCaseStatus",
    "tenantPolicy",
    "roleInvoke",
    "roleView",
    "verify:aibeopchin-ai-governance-control",
    "10-A.1",
    "filterIntelligenceGraphForRole",
  ]);

  assertIncludes("src/features/ai-core/ai-governance-control.schema.ts", [
    "PHASE10A_AI_GOVERNANCE_CONTROL",
    "AI_GOVERNANCE_CONTROL_MATRIX_VERSION",
    "AI_GOVERNANCE_FEATURES",
  ]);

  assertIncludes("src/features/ai-core/ai-governance-policy.service.ts", [
    "evaluateAiGovernanceGate",
    "resolveDefaultAiGovernanceControlMatrix",
    "assertCaseSummaryAiGovernanceAllowsInvoke",
  ]);

  assertIncludes("src/features/ai-core/ai-governance-validator.ts", [
    "validateAiGovernanceControlMatrix",
    "AI_GOVERNANCE_VALIDATOR_MARKER",
  ]);

  assertIncludes("src/features/ai-core/case-summary-ai-core-runtime.service.ts", [
    "assertCaseSummaryGovernanceAndMeterAllowsInvoke",
    "filterIntelligenceGraphForRole",
  ]);

  const route = readFile("src/app/api/cases/[caseId]/summary/generate/route.ts");
  if (!route.includes("Phase 10-A")) {
    throw new Error("summary/generate route must document Phase 10-A governance");
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag9f = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9F-LAWYER-JUDGMENT-BOUNDARY-LEDGER";
  const tag10a = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10A-AI-GOVERNANCE-CONTROL-MATRIX";
  if (!impl.includes(tag9f)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag9f}`);
  }
  if (!impl.includes(tag10a)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag10a}`);
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("AIBEOPCHIN_AI_GOVERNANCE_CONTROL_MATRIX.md")) {
    throw new Error("docs/ai/README.md must link AI Governance Control Matrix spec");
  }
  if (!readme.includes("| **10-A** |")) {
    throw new Error("docs/ai/README.md must include Phase **10-A** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-ai-governance-control")) {
    throw new Error("package.json must define verify:aibeopchin-ai-governance-control");
  }

  console.log("verify:aibeopchin-ai-governance-control PASS");
}

main();
