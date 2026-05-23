import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 9-F file: ${relativePath}`);
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
    "docs/ai/AIBEOPCHIN_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SPEC.md",
    "src/features/ai-core/lawyer-judgment-boundary-ledger.schema.ts",
    "src/features/ai-core/lawyer-judgment-boundary-ledger.service.ts",
    "src/features/ai-core/lawyer-judgment-boundary-validator.ts",
    "src/features/ai-core/lawyer-judgment-boundary-ledger.schema.test.ts",
    "src/features/ai-core/lawyer-judgment-boundary-ledger.service.test.ts",
    "src/features/ai-core/lawyer-judgment-boundary-validator.test.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("docs/ai/AIBEOPCHIN_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SPEC.md", [
    "Phase **9‑F**",
    "AI는 구조화했고, 변호사가 판단했다",
    "AI_DETECTED",
    "LAWYER_CONFIRMED",
    "LAWYER_REJECTED",
    "LAWYER_EDITED",
    "CLIENT_VISIBLE",
    "SUBMISSION_READY",
    "verify:aibeopchin-lawyer-judgment-ledger",
    "9-F.1",
    "buildLawyerJudgmentBoundaryLedgerDraft",
  ]);

  assertIncludes("src/features/ai-core/lawyer-judgment-boundary-ledger.schema.ts", [
    "PHASE9F_LAWYER_JUDGMENT_BOUNDARY_LEDGER",
    "LAWYER_JUDGMENT_BOUNDARY_LEDGER_VERSION",
    "lawyerJudgmentBoundaryEntrySchema",
  ]);

  assertIncludes("src/features/ai-core/lawyer-judgment-boundary-ledger.service.ts", [
    "buildLawyerJudgmentBoundaryLedgerDraft",
    "applyLawyerJudgmentDecision",
    "PHASE9F_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SERVICE",
  ]);

  assertIncludes("src/features/ai-core/lawyer-judgment-boundary-validator.ts", [
    "validateLawyerJudgmentBoundaryLedger",
    "LAWYER_JUDGMENT_BOUNDARY_VALIDATOR_MARKER",
  ]);

  assertIncludes("src/features/ai-core/case-intelligence-graph-runtime.service.ts", [
    "buildLawyerJudgmentBoundaryLedgerDraft",
    "ledgerValidationPassed",
  ]);

  const route = readFile("src/app/api/cases/[caseId]/summary/generate/route.ts");
  if (!route.includes("Phase 9-F")) {
    throw new Error("summary/generate route must document Phase 9-F ledger");
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag9e = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9E-CONTRADICTION-RADAR";
  const tag9f = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9F-LAWYER-JUDGMENT-BOUNDARY-LEDGER";
  if (!impl.includes(tag9e)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag9e}`);
  }
  if (!impl.includes(tag9f)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag9f}`);
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("AIBEOPCHIN_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SPEC.md")) {
    throw new Error("docs/ai/README.md must link Lawyer Judgment Boundary Ledger spec");
  }
  if (!readme.includes("| **9-F** |")) {
    throw new Error("docs/ai/README.md must include Phase **9-F** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-lawyer-judgment-ledger")) {
    throw new Error("package.json must define verify:aibeopchin-lawyer-judgment-ledger");
  }

  console.log("verify:aibeopchin-lawyer-judgment-ledger PASS");
}

main();
