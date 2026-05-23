import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 11-A file: ${relativePath}`);
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
    "docs/ai/AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md",
    "src/features/ai-core/lawyer-review-console-lock.ts",
    "src/features/ai-core/case-intelligence-review.service.ts",
    "src/features/ai-core/case-intelligence-review.api.validators.ts",
    "src/features/ai-core/case-intelligence-review.service.test.ts",
    "src/features/ai-core/case-intelligence-review.api.validators.test.ts",
    "src/components/cases/lawyer-intelligence-review-console.tsx",
    "src/app/(protected)/cases/[caseId]/intelligence-review/page.tsx",
    "src/app/api/cases/[caseId]/intelligence-review/route.ts",
    "src/app/api/cases/[caseId]/intelligence-review/judgments/route.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("docs/ai/AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md", [
    "Phase **11‑A**",
    "intelligence-review",
    "applyLawyerJudgmentDecision",
    "CaseIntelligenceSnapshot",
    "verify:aibeopchin-lawyer-review-console",
  ]);

  assertIncludes("prisma/schema.prisma", ["model CaseIntelligenceSnapshot"]);

  assertIncludes("src/features/ai-core/case-intelligence-review.service.ts", [
    "PHASE11A_LAWYER_REVIEW_CONSOLE_SERVICE_MARKER",
    "refreshCaseIntelligenceReviewSnapshot",
    "applyCaseIntelligenceJudgment",
    "mergeSavedDecisionsIntoLedger",
  ]);

  assertIncludes("src/components/cases/lawyer-intelligence-review-console.tsx", [
    "LawyerIntelligenceReviewConsole",
    "intelligence-review/judgments",
    "LAWYER_INTELLIGENCE_REVIEW_CONSOLE_MARKER_PHASE11A",
  ]);

  assertIncludes("src/components/cases/case-detail-client.tsx", [
    "intelligence-review",
    "Lawyer Review Console",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag =
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11A-LAWYER-REVIEW-CONSOLE";
  if (!impl.includes(tag)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **11-A** |")) {
    throw new Error("docs/ai/README.md must include Phase **11-A** row");
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-lawyer-review-console")) {
    throw new Error("package.json must define verify:aibeopchin-lawyer-review-console");
  }

  console.log("verify:aibeopchin-lawyer-review-console PASS");
}

main();
