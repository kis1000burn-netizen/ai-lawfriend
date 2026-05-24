import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/litigation-ops/hearing-submission-checklist.schema.ts",
  "src/features/litigation-ops/hearing-submission-checklist.registry.ts",
  "src/features/litigation-ops/hearing-submission-checklist.policy.ts",
  "src/features/litigation-ops/hearing-submission-checklist.service.ts",
  "src/features/litigation-ops/hearing-submission-checklist.test.ts",
  "docs/operations/AIBEOPCHIN_HEARING_SUBMISSION_CHECKLIST_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24D-HEARING-SUBMISSION-CHECKLIST";

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
    throw new Error(`Missing required Phase 24-D file: ${file}`);
  }
}

assertIncludes("src/features/litigation-ops/hearing-submission-checklist.service.ts", [
  "buildHearingSubmissionChecklistForCase",
  "assembleHearingSubmissionChecklist",
]);

assertIncludes(
  "docs/operations/AIBEOPCHIN_HEARING_SUBMISSION_CHECKLIST_RUNBOOK.md",
  ["24-D", "Hearing / Submission Checklist"],
);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
  "24-D",
  "Hearing / Submission Checklist",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-litigation-ops-phase24d")) {
  throw new Error("package.json must define verify:aibeopchin-litigation-ops-phase24d");
}

execSync("npm run test -- src/features/litigation-ops/hearing-submission-checklist.test.ts", {
  stdio: "inherit",
  cwd: root,
});

console.log(
  "verify:aibeopchin-litigation-ops-phase24d PASS (Product Phase 24-D Hearing / Submission Checklist)",
);
