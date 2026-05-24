import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/production-launch/production-launch-checklist.schema.ts",
  "src/features/production-launch/production-launch-checklist.registry.ts",
  "src/features/production-launch/production-launch-checklist.policy.ts",
  "src/features/production-launch/production-launch-checklist.service.ts",
  "src/features/production-launch/production-launch-checklist.test.ts",
  "docs/operations/AIBEOPCHIN_PRODUCTION_LAUNCH_CHECKLIST_RUNBOOK.md",
];

const EVIDENCE_TAG = "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25A-LAUNCH-CHECKLIST";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertIncludes(relativePath, terms) {
  const content = read(relativePath);
  for (const term of terms) {
    if (!content.includes(term)) throw new Error(`Missing term "${term}" in ${relativePath}`);
  }
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing required Phase 25-A file: ${file}`);
  }
}

assertIncludes("src/features/production-launch/production-launch-checklist.service.ts", [
  "buildProductionLaunchChecklist",
]);
assertIncludes("src/features/production-launch/production-launch-checklist.policy.ts", [
  "goNoGoRecommendation",
]);

assertIncludes("docs/operations/AIBEOPCHIN_PRODUCTION_LAUNCH_CHECKLIST_RUNBOOK.md", [
  "25-A",
  "Production Launch Checklist",
]);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
  "25-A",
  "Production Launch Checklist",
]);

if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

if (!read("package.json").includes("verify:aibeopchin-production-launch-phase25a")) {
  throw new Error("package.json must define verify:aibeopchin-production-launch-phase25a");
}

execSync("npm run test -- src/features/production-launch/production-launch-checklist.test.ts", {
  stdio: "inherit",
  cwd: root,
});

console.log("verify:aibeopchin-production-launch-phase25a PASS (Product Phase 25-A)");
