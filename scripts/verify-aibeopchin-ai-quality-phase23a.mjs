import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "prisma/migrations/20260526090000_ai_evaluation_dataset_phase23a/migration.sql",
  "prisma/seed-ai-evaluation-dataset.ts",
  "src/features/ai-quality/ai-evaluation-dataset.schema.ts",
  "src/features/ai-quality/ai-evaluation-dataset.registry.ts",
  "src/features/ai-quality/ai-evaluation-dataset.policy.ts",
  "src/features/ai-quality/ai-evaluation-dataset.repository.ts",
  "src/features/ai-quality/ai-evaluation-dataset.service.ts",
  "src/features/ai-quality/ai-evaluation-dataset.test.ts",
  "src/features/ai-quality/ai-output-quality-evaluation.schema.ts",
  "src/features/ai-quality/ai-output-quality-evaluation.policy.ts",
  "src/features/ai-quality/ai-output-quality-evaluation.service.ts",
  "src/features/ai-quality/ai-output-quality-evaluation.test.ts",
  "docs/operations/AIBEOPCHIN_AI_OUTPUT_QUALITY_EVALUATION_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23A-OUTPUT-QUALITY-EVALUATION";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertIncludes(relativePath, terms) {
  const content = read(relativePath);
  for (const term of terms) {
    if (!content.includes(term)) {
      throw new Error(`Missing term "${term}" in ${relativePath}`);
    }
  }
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing required Phase 23-A file: ${file}`);
  }
}

assertIncludes("prisma/schema.prisma", [
  "model AiEvaluationDatasetEntry",
  "enum AiEvaluationCasePackType",
]);

assertIncludes("src/features/ai-quality/ai-output-quality-evaluation.policy.ts", [
  "AI_OUTPUT_QUALITY_EVALUATION_POLICY_MARKER_PHASE23A",
  "evaluateAiOutputQuality",
  "AI_OUTPUT_QUALITY_PASS_THRESHOLD",
]);

assertIncludes("src/features/ai-quality/ai-output-quality-evaluation.service.ts", [
  "evaluateAiOutputAgainstGoldenEntry",
  "runAiOutputQualityRegressionSample",
]);

assertIncludes(
  "docs/operations/AIBEOPCHIN_AI_OUTPUT_QUALITY_EVALUATION_RUNBOOK.md",
  ["23-A", "AI Output Quality Evaluation", "golden"],
);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
  "23-A",
  "AI Output Quality Evaluation",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-ai-quality-phase23a")) {
  throw new Error("package.json must define verify:aibeopchin-ai-quality-phase23a");
}

execSync("npm run test -- src/features/ai-quality/ai-evaluation-dataset.test.ts", {
  stdio: "inherit",
  cwd: root,
});

execSync("npm run test -- src/features/ai-quality/ai-output-quality-evaluation.test.ts", {
  stdio: "inherit",
  cwd: root,
});

console.log(
  "verify:aibeopchin-ai-quality-phase23a PASS (Product Phase 23-A AI Output Quality Evaluation)",
);
