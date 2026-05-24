import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const REQUIRED_FILES = [
  "src/features/litigation-ops/litigation-task-deadline-automation.schema.ts",
  "src/features/litigation-ops/litigation-task-deadline-automation.registry.ts",
  "src/features/litigation-ops/litigation-task-deadline-automation.policy.ts",
  "src/features/litigation-ops/litigation-task-deadline-automation.service.ts",
  "src/features/litigation-ops/litigation-task-deadline-automation.test.ts",
  "docs/operations/AIBEOPCHIN_LITIGATION_TASK_DEADLINE_AUTOMATION_RUNBOOK.md",
];

const EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24A-TASK-DEADLINE-AUTOMATION";

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
    throw new Error(`Missing required Phase 24-A file: ${file}`);
  }
}

assertIncludes("src/features/litigation-ops/litigation-task-deadline-automation.service.ts", [
  "runLitigationTaskDeadlineAutomationForCase",
  "LITIGATION_TASK_DEADLINE_AUTOMATION_RUN",
]);

assertIncludes(
  "docs/operations/AIBEOPCHIN_LITIGATION_TASK_DEADLINE_AUTOMATION_RUNBOOK.md",
  ["24-A", "Litigation Task / Deadline Automation"],
);

assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
  "24-A",
  "Litigation Task / Deadline Automation",
]);

const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
if (!impl.includes(EVIDENCE_TAG)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${EVIDENCE_TAG}`);
}

const pkg = read("package.json");
if (!pkg.includes("verify:aibeopchin-litigation-ops-phase24a")) {
  throw new Error("package.json must define verify:aibeopchin-litigation-ops-phase24a");
}

execSync(
  "npm run test -- src/features/litigation-ops/litigation-task-deadline-automation.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log(
  "verify:aibeopchin-litigation-ops-phase24a PASS (Product Phase 24-A Litigation Task / Deadline Automation)",
);
