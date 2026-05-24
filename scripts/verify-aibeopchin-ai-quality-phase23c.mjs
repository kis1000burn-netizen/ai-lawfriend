import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/ai-quality/case-pack-builder.schema.ts",
  "src/features/ai-quality/case-pack-builder.registry.ts",
  "src/features/ai-quality/case-pack-builder.policy.ts",
  "src/features/ai-quality/case-pack-builder.service.ts",
  "src/features/ai-quality/case-pack-builder.test.ts",
  "docs/operations/AIBEOPCHIN_CASE_PACK_BUILDER_RUNBOOK.md",
];

const EVIDENCE_TAG = "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23C-CASE-PACK-BUILDER";

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
    throw new Error(`Missing required Phase 23-C file: ${file}`);
  }
}

assertIncludes("src/features/ai-quality/case-pack-builder.registry.ts", [
  "CASE_PACK_BUILDER_TEMPLATES",
  "LOAN",
  "CRIMINAL",
]);

assertIncludes("src/features/ai-quality/case-pack-builder.service.ts", [
  "buildCasePackForCase",
  "buildCasePackageDto",
]);

assertIncludes("docs/operations/AIBEOPCHIN_CASE_PACK_BUILDER_RUNBOOK.md", [
  "23-C",
  "Case Pack Builder",
]);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
  "23-C",
  "Case Pack Builder",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-ai-quality-phase23c")) {
  throw new Error("package.json must define verify:aibeopchin-ai-quality-phase23c");
}

execSync("npm run test -- src/features/ai-quality/case-pack-builder.test.ts", {
  stdio: "inherit",
  cwd: root,
});

console.log("verify:aibeopchin-ai-quality-phase23c PASS (Product Phase 23-C Case Pack Builder)");
